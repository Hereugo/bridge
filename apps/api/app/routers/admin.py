from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import Phase, Summary, User, UserJourney
from app.services.matching import run_matching_for_user

router = APIRouter(prefix="/admin", tags=["admin"])

_DEMO_SUMMARY = {
    "interests": ["live music", "coffee", "urban walks"],
    "communication_style": "warm and curious",
    "humour": "dry, gentle",
    "energy_level": "evening person",
    "availability": [
        {"day": "friday", "start": "19:00", "end": "21:00"},
        {"day": "saturday", "start": "14:00", "end": "17:00"},
    ],
    "notes": "PoC demo summary",
}


@router.post("/force-end-phase2")
async def force_end_phase2(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dev/demo: submit demo summary and run matching (pairs first two ready users)."""
    journey = db.query(UserJourney).filter(UserJourney.user_id == user.id).first()
    if not journey or journey.phase not in (Phase.KNOW, Phase.MATCHING):
        raise HTTPException(status_code=400, detail="Not in KNOW phase")

    if not (
        db.query(Summary)
        .filter(Summary.user_id == user.id, Summary.deleted_at.is_(None))
        .first()
    ):
        expires = datetime.now(timezone.utc) + timedelta(days=settings.summary_ttl_days)
        db.add(
            Summary(
                user_id=user.id,
                journey_id=journey.id,
                structured_summary=_DEMO_SUMMARY,
                expires_at=expires,
            )
        )

    journey.summary_ready = True
    journey.phase = Phase.MATCHING
    user.current_phase = Phase.MATCHING
    db.commit()
    match = await run_matching_for_user(db, user.id)
    return {
        "summary_ready": True,
        "match_id": str(match.id) if match else None,
        "waiting_for_partner": match is None,
    }
