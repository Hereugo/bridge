from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Phase, User, UserJourney
from app.services.matching import run_matching_for_user
router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/force-end-phase2")
async def force_end_phase2(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dev/demo: mark summary ready and run matching immediately."""
    journey = db.query(UserJourney).filter(UserJourney.user_id == user.id).first()
    if not journey or journey.phase not in (Phase.KNOW, Phase.MATCHING):
        raise HTTPException(status_code=400, detail="Not in KNOW phase")
    journey.summary_ready = True
    journey.phase = Phase.MATCHING
    user.current_phase = Phase.MATCHING
    db.commit()
    match = await run_matching_for_user(db, user.id)
    return {"summary_ready": True, "match_id": str(match.id) if match else None}
