from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import (
    ConnectionCard,
    DeletionAudit,
    Match,
    Summary,
    User,
    UserJourney,
    WingmanSession,
)
from app.schemas import UserDeleteResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.delete("/me", response_model=UserDeleteResponse)
def delete_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    user.deleted_at = now

    journey = db.query(UserJourney).filter(UserJourney.user_id == user.id).first()
    if journey:
        db.delete(journey)

    for s in db.query(Summary).filter(Summary.user_id == user.id).all():
        s.deleted_at = now
        db.add(DeletionAudit(entity="summary", entity_id=str(s.id)))

    for m in db.query(Match).filter(
        (Match.user_a_id == user.id) | (Match.user_b_id == user.id)
    ).all():
        card = db.query(ConnectionCard).filter(ConnectionCard.match_id == m.id).first()
        if card:
            db.delete(card)
        sess = db.query(WingmanSession).filter(WingmanSession.match_id == m.id).first()
        if sess:
            db.delete(sess)
        db.delete(m)
        db.add(DeletionAudit(entity="match", entity_id=str(m.id)))

    db.add(DeletionAudit(entity="user", entity_id=str(user.id)))
    db.commit()
    return UserDeleteResponse(deleted=True)
