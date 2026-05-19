import json
import re
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.config import settings
from app.models import (
    ConnectionCard,
    Match,
    MatchStatus,
    Phase,
    Summary,
    User,
    UserJourney,
)


def _matched_user_ids(db: Session) -> set[UUID]:
    ids: set[UUID] = set()
    for user_a_id, user_b_id in db.query(Match.user_a_id, Match.user_b_id).all():
        ids.add(user_a_id)
        ids.add(user_b_id)
    return ids


def _latest_summary(db: Session, user_id: UUID) -> Summary | None:
    return (
        db.query(Summary)
        .filter(Summary.user_id == user_id, Summary.deleted_at.is_(None))
        .order_by(Summary.created_at.desc())
        .first()
    )


async def try_match_first_two_ready_users(db: Session) -> Match | None:
    """Pair the two oldest summary-ready users who are not already in a match."""
    matched_ids = _matched_user_ids(db)
    queue: list[tuple[datetime, UserJourney, Summary]] = []

    journeys = db.query(UserJourney).filter(UserJourney.summary_ready.is_(True)).all()
    for journey in journeys:
        if journey.user_id in matched_ids:
            continue
        summary = _latest_summary(db, journey.user_id)
        if not summary:
            continue
        queue.append((summary.created_at, journey, summary))

    if len(queue) < 2:
        return None

    queue.sort(key=lambda row: row[0])
    _, journey_a, summary_a = queue[0]
    _, journey_b, summary_b = queue[1]
    if journey_a.user_id == journey_b.user_id:
        return None

    return await _generate_match(
        db,
        summary_a.structured_summary,
        summary_b.structured_summary,
        journey_a.user_id,
        journey_b.user_id,
    )


def _parse_llm_json(text: str) -> dict:
    text = text.strip()
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return json.loads(match.group())
    return json.loads(text)


def _find_overlap_slot(summary_a: dict, summary_b: dict) -> datetime | None:
    slots_a = summary_a.get("availability", [])
    slots_b = summary_b.get("availability", [])
    if not slots_a or not slots_b:
        return datetime.now(timezone.utc) + timedelta(days=2)

    for sa in slots_a:
        for sb in slots_b:
            if sa.get("day") == sb.get("day"):
                if sa.get("start") == sb.get("start") or True:
                    day = sa.get("day", "Saturday")
                    start = sa.get("start", "19:00")
                    try:
                        base = datetime.now(timezone.utc)
                        weekday_map = {
                            "monday": 0,
                            "tuesday": 1,
                            "wednesday": 2,
                            "thursday": 3,
                            "friday": 4,
                            "saturday": 5,
                            "sunday": 6,
                        }
                        target = weekday_map.get(day.lower(), 5)
                        days_ahead = (target - base.weekday()) % 7
                        if days_ahead == 0:
                            days_ahead = 7
                        hour, minute = map(int, start.split(":")[:2])
                        return (base + timedelta(days=days_ahead)).replace(
                            hour=hour, minute=minute, second=0, microsecond=0
                        )
                    except (ValueError, KeyError):
                        pass
    return datetime.now(timezone.utc) + timedelta(days=3)


async def run_matching_for_user(db: Session, user_id: UUID) -> Match | None:
    journey = db.query(UserJourney).filter(UserJourney.user_id == user_id).first()
    if not journey or not journey.summary_ready:
        return None

    if not _latest_summary(db, user_id):
        return None

    existing = (
        db.query(Match)
        .filter((Match.user_a_id == user_id) | (Match.user_b_id == user_id))
        .first()
    )
    if existing:
        return existing

    if settings.matching_simple_first_pair:
        match = await try_match_first_two_ready_users(db)
        if match and user_id in (match.user_a_id, match.user_b_id):
            return match
        return (
            db.query(Match)
            .filter((Match.user_a_id == user_id) | (Match.user_b_id == user_id))
            .first()
        )

    summary = _latest_summary(db, user_id)
    if not summary:
        return None

    candidates = (
        db.query(UserJourney)
        .join(Summary, Summary.user_id == UserJourney.user_id)
        .filter(
            UserJourney.user_id != user_id,
            UserJourney.summary_ready.is_(True),
            Summary.deleted_at.is_(None),
        )
        .all()
    )

    for candidate in candidates:
        other_summary = (
            db.query(Summary)
            .filter(Summary.user_id == candidate.user_id, Summary.deleted_at.is_(None))
            .order_by(Summary.created_at.desc())
            .first()
        )
        if not other_summary:
            continue

        other_in_match = (
            db.query(Match)
            .filter(
                (Match.user_a_id == candidate.user_id) | (Match.user_b_id == candidate.user_id)
            )
            .first()
        )
        if other_in_match:
            continue

        result = await _generate_match(
            db,
            summary.structured_summary,
            other_summary.structured_summary,
            user_id,
            candidate.user_id,
        )
        return result

    return None


async def _generate_match(
    db: Session,
    summary_a: dict,
    summary_b: dict,
    user_a_id: UUID,
    user_b_id: UUID,
) -> Match:
    card_data = await _llm_match_and_card(summary_a, summary_b)
    scheduled = _find_overlap_slot(summary_a, summary_b)

    match = Match(
        user_a_id=user_a_id,
        user_b_id=user_b_id,
        status=MatchStatus.CALL_SCHEDULED,
        scheduled_call_at=scheduled,
        compatibility_notes=card_data.get("compatibility_notes"),
    )
    db.add(match)
    db.flush()

    expires = datetime.now(timezone.utc) + timedelta(days=settings.card_ttl_days)
    card = ConnectionCard(
        match_id=match.id,
        card_text=card_data["card_text"],
        shared_topics=card_data.get("shared_topics", []),
        expires_at=expires,
    )
    db.add(card)

    for uid in (user_a_id, user_b_id):
        user = db.get(User, uid)
        journey = db.query(UserJourney).filter(UserJourney.user_id == uid).first()
        if user:
            user.current_phase = Phase.MATCHED
        if journey:
            journey.phase = Phase.MATCHED

        s = (
            db.query(Summary)
            .filter(Summary.user_id == uid, Summary.deleted_at.is_(None))
            .all()
        )
        for row in s:
            row.deleted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(match)
    return match


async def _llm_match_and_card(summary_a: dict, summary_b: dict) -> dict:
    prompt = f"""You are a warm matchmaker. Given two structured personality summaries (no transcripts),
create a connection card introduction.

User A summary:
{json.dumps(summary_a, indent=2)}

User B summary:
{json.dumps(summary_b, indent=2)}

Respond ONLY with JSON:
{{
  "card_text": "2-3 warm sentences as if a mutual friend is introducing them. No algorithmic language.",
  "shared_topics": ["topic1", "topic2"],
  "compatibility_notes": "internal brief note"
}}"""

    if settings.matching_llm_provider == "anthropic" and settings.anthropic_api_key:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        msg = client.messages.create(
            model="claude-3-5-haiku-latest",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        text = msg.content[0].text
    elif settings.openai_api_key:
        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        text = resp.choices[0].message.content or "{}"
    else:
        interests_a = summary_a.get("interests", [])
        interests_b = summary_b.get("interests", [])
        overlap = list(set(interests_a) & set(interests_b)) or interests_a[:1] or ["good conversation"]
        return {
            "card_text": (
                f"You both light up around {overlap[0]} — "
                "and you've got a similar easy energy in how you talk. "
                "Worth a proper hello."
            ),
            "shared_topics": overlap[:3],
            "compatibility_notes": "fallback matcher",
        }

    return _parse_llm_json(text)
