from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import ConnectionCard, DeletionAudit, Summary, WingmanSession


def purge_expired_records(db: Session) -> int:
    now = datetime.now(timezone.utc)
    count = 0

    summaries = db.query(Summary).filter(
        Summary.expires_at <= now,
        Summary.deleted_at.is_(None),
    ).all()
    for s in summaries:
        s.deleted_at = now
        db.add(DeletionAudit(entity="summary", entity_id=str(s.id)))
        count += 1

    cards = db.query(ConnectionCard).filter(ConnectionCard.expires_at <= now).all()
    for c in cards:
        db.delete(c)
        db.add(DeletionAudit(entity="connection_card", entity_id=str(c.id)))
        count += 1

    sessions = db.query(WingmanSession).filter(
        WingmanSession.purge_after.isnot(None),
        WingmanSession.purge_after <= now,
    ).all()
    for sess in sessions:
        db.delete(sess)
        db.add(DeletionAudit(entity="wingman_session", entity_id=str(sess.id)))
        count += 1

    db.commit()
    return count
