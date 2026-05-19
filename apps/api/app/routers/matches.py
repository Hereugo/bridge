from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import ConnectionCard, Match, User
from app.schemas import ConnectionCardOut

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/{match_id}/connection-card", response_model=ConnectionCardOut)
def get_connection_card(
    match_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    match = db.get(Match, match_id)
    if not match or user.id not in (match.user_a_id, match.user_b_id):
        raise HTTPException(status_code=404, detail="Match not found")

    card = db.query(ConnectionCard).filter(ConnectionCard.match_id == match_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Connection card not found")

    return ConnectionCardOut(
        match_id=match.id,
        card_text=card.card_text,
        shared_topics=card.shared_topics if isinstance(card.shared_topics, list) else [],
        scheduled_call_at=match.scheduled_call_at,
    )
