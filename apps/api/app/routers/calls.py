from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import ConnectionCard, Match, Phase, User, UserJourney, WingmanSession
from app.schemas import LiveKitTokenOut
from app.services.livekit_tokens import create_room_token, room_name_for_match

router = APIRouter(prefix="/calls", tags=["calls"])


@router.post("/{match_id}/token", response_model=LiveKitTokenOut)
def get_call_token(
    match_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.livekit_api_key or not settings.livekit_api_secret:
        raise HTTPException(status_code=503, detail="LiveKit not configured")

    match = db.get(Match, match_id)
    if not match or user.id not in (match.user_a_id, match.user_b_id):
        raise HTTPException(status_code=404, detail="Match not found")

    room_name = room_name_for_match(match_id)
    session = db.query(WingmanSession).filter(WingmanSession.match_id == match_id).first()
    if not session:
        session = WingmanSession(match_id=match_id, livekit_room_name=room_name)
        db.add(session)
    if not session.started_at:
        session.started_at = datetime.now(timezone.utc)
    db.commit()

    token = create_room_token(room_name, str(user.id), user.email.split("@")[0])
    return LiveKitTokenOut(
        token=token,
        room_name=room_name,
        livekit_url=settings.livekit_url,
    )


@router.get("/{match_id}/wingman-context")
def wingman_context(match_id: UUID, db: Session = Depends(get_db)):
    """Used by LiveKit agent worker — internal endpoint."""
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

    for uid in (match.user_a_id, match.user_b_id):
        u = db.get(User, uid)
        j = db.query(UserJourney).filter(UserJourney.user_id == uid).first()
        if u:
            u.current_phase = Phase.COMPLETE
        if j:
            j.phase = Phase.COMPLETE

    db.commit()
    return {"completed": True}
