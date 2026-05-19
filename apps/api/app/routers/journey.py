from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import ConnectionCard, Match, Persona, Phase, Summary, User, UserJourney
from app.schemas import (
    JourneyOut,
    MatchRevealContext,
    SelectPersonaRequest,
    SummarySubmitRequest,
)
from app.services.matching import run_matching_for_user
from app.services.phase import ensure_journey, start_know_phase

router = APIRouter(prefix="/journey", tags=["journey"])


def _journey_response(db: Session, user: User, journey: UserJourney) -> JourneyOut:
    match_id = None
    scheduled_call_at = None
    connection_card = None
    elevenlabs_agent_id = None

    if journey.persona_id:
        persona = db.get(Persona, journey.persona_id)
        if persona:
            elevenlabs_agent_id = persona.elevenlabs_agent_id

    match = (
        db.query(Match)
        .filter((Match.user_a_id == user.id) | (Match.user_b_id == user.id))
        .first()
    )
    if match:
        match_id = match.id
        scheduled_call_at = match.scheduled_call_at
        card = db.query(ConnectionCard).filter(ConnectionCard.match_id == match.id).first()
        if card:
            connection_card = card.card_text

    return JourneyOut(
        phase=journey.phase.value,
        persona_id=journey.persona_id,
        phase_started_at=journey.phase_started_at,
        phase_ends_at=journey.phase_ends_at,
        summary_ready=journey.summary_ready,
        match_reveal_delivered=journey.match_reveal_delivered,
        match_id=match_id,
        scheduled_call_at=scheduled_call_at,
        connection_card=connection_card,
        elevenlabs_agent_id=elevenlabs_agent_id,
    )


@router.get("/me", response_model=JourneyOut)
def get_my_journey(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    journey = ensure_journey(db, user)
    return _journey_response(db, user, journey)


@router.post("/select-persona", response_model=JourneyOut)
def select_persona(
    body: SelectPersonaRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    persona = db.get(Persona, body.persona_id)
    if not persona or not persona.active:
        raise HTTPException(status_code=404, detail="Persona not found")

    if body.consent:
        from datetime import datetime, timezone

        user.consent_at = datetime.now(timezone.utc)

    journey = ensure_journey(db, user)
    journey.persona_id = body.persona_id
    user.current_phase = Phase.SWIPE
    db.commit()

    journey = start_know_phase(db, user, journey)
    return _journey_response(db, user, journey)


@router.post("/summary", response_model=JourneyOut)
async def submit_summary(
    body: SummarySubmitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from datetime import datetime, timedelta, timezone

    from app.config import settings

    journey = ensure_journey(db, user)
    if journey.phase not in (Phase.KNOW, Phase.MATCHING):
        raise HTTPException(status_code=400, detail="Not in KNOW phase")

    expires = datetime.now(timezone.utc) + timedelta(days=settings.summary_ttl_days)
    summary = Summary(
        user_id=user.id,
        journey_id=journey.id,
        structured_summary=body.structured_summary,
        expires_at=expires,
    )
    db.add(summary)
    journey.summary_ready = True
    journey.phase = Phase.MATCHING
    user.current_phase = Phase.MATCHING
    db.commit()

    await run_matching_for_user(db, user.id)
    db.refresh(journey)
    return _journey_response(db, user, journey)


@router.get("/match-reveal", response_model=MatchRevealContext)
def get_match_reveal_context(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    journey = ensure_journey(db, user)
    match = (
        db.query(Match)
        .filter((Match.user_a_id == user.id) | (Match.user_b_id == user.id))
        .first()
    )
    if not match:
        return MatchRevealContext(match_ready=False)

    card = db.query(ConnectionCard).filter(ConnectionCard.match_id == match.id).first()
    partner_id = match.user_b_id if match.user_a_id == user.id else match.user_a_id
    partner = db.get(User, partner_id)
    partner_name = partner.email.split("@")[0] if partner else "your match"

    if card and not journey.match_reveal_delivered:
        journey.match_reveal_delivered = True
        db.commit()

    return MatchRevealContext(
        match_ready=True,
        connection_card=card.card_text if card else None,
        scheduled_call_at=match.scheduled_call_at,
        partner_first_name=partner_name.capitalize(),
    )


@router.post("/advance-wingman")
def advance_to_wingman(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    journey = ensure_journey(db, user)
    match = (
        db.query(Match)
        .filter((Match.user_a_id == user.id) | (Match.user_b_id == user.id))
        .first()
    )
    if not match:
        raise HTTPException(status_code=400, detail="No match found")
    journey.phase = Phase.WINGMAN
    user.current_phase = Phase.WINGMAN
    db.commit()
    return {"phase": Phase.WINGMAN.value, "match_id": str(match.id)}
