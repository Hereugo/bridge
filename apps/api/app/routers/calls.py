from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import ConnectionCard, Match, MatchStatus, Phase, User, UserJourney, WingmanSession
from app.schemas import LiveKitTokenOut
from app.services.livekit_dispatch import ensure_wingman_dispatched
from app.services.livekit_tokens import create_room_token, normalize_livekit_url, room_name_for_match

router = APIRouter(prefix="/calls", tags=["calls"])


def _partner_display_name(match: Match, user_id: UUID, db: Session) -> str:
    partner_id = match.user_b_id if match.user_a_id == user_id else match.user_a_id
    partner = db.get(User, partner_id)
    if not partner:
        return "Your match"
    return partner.email.split("@")[0].replace(".", " ").split("_")[0].capitalize()


def _verify_agent_key(x_bridge_agent_key: str | None) -> None:
    if not x_bridge_agent_key or x_bridge_agent_key != settings.bridge_agent_internal_key:
        raise HTTPException(status_code=401, detail="Invalid agent credentials")


@router.post("/{match_id}/token", response_model=LiveKitTokenOut)
def get_call_token(
    match_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.livekit_api_key or not settings.livekit_api_secret or not settings.livekit_url:
        raise HTTPException(status_code=503, detail="LiveKit not configured")

    match = db.get(Match, match_id)
    if not match or user.id not in (match.user_a_id, match.user_b_id):
        raise HTTPException(status_code=404, detail="Match not found")

    journey = db.query(UserJourney).filter(UserJourney.user_id == user.id).first()
    if journey and journey.phase not in (Phase.MATCHED, Phase.WINGMAN):
        raise HTTPException(status_code=400, detail="Introduction call is not available in your current phase")

    room_name = room_name_for_match(match_id)
    session = db.query(WingmanSession).filter(WingmanSession.match_id == match_id).first()
    if not session:
        session = WingmanSession(match_id=match_id, livekit_room_name=room_name)
        db.add(session)
    first_join = not session.started_at
    if first_join:
        session.started_at = datetime.now(timezone.utc)
    db.commit()

    if first_join:
        ensure_wingman_dispatched(room_name)

    display = user.email.split("@")[0].replace(".", " ").split("_")[0].capitalize()
    token = create_room_token(room_name, str(user.id), display)
    return LiveKitTokenOut(
        token=token,
        room_name=room_name,
        livekit_url=normalize_livekit_url(settings.livekit_public_url or settings.livekit_url),
        partner_display_name=_partner_display_name(match, user.id, db),
    )


@router.get("/{match_id}/wingman-context")
def wingman_context(
    match_id: UUID,
    db: Session = Depends(get_db),
    x_bridge_agent_key: str | None = Header(default=None, alias="X-Bridge-Agent-Key"),
):
    """Used by the LiveKit wingman worker (authenticated)."""
    _verify_agent_key(x_bridge_agent_key)

    match = db.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    card = db.query(ConnectionCard).filter(ConnectionCard.match_id == match_id).first()
    return {
        "card_text": card.card_text if card else "",
        "shared_topics": card.shared_topics if card else [],
    }


@router.post("/{match_id}/complete")
def complete_call(
    match_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    match = db.get(Match, match_id)
    if not match or user.id not in (match.user_a_id, match.user_b_id):
        raise HTTPException(status_code=404, detail="Match not found")

    session = db.query(WingmanSession).filter(WingmanSession.match_id == match_id).first()
    now = datetime.now(timezone.utc)
    if session:
        session.ended_at = now
        session.purge_after = now + timedelta(hours=1)

    match.status = MatchStatus.CALL_COMPLETE

    for uid in (match.user_a_id, match.user_b_id):
        u = db.get(User, uid)
        j = db.query(UserJourney).filter(UserJourney.user_id == uid).first()
        if u:
            u.current_phase = Phase.COMPLETE
        if j:
            j.phase = Phase.COMPLETE

    db.commit()
    return {"completed": True}
