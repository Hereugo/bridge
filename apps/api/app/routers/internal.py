from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Phase, UserJourney
from app.services.matching import run_matching_for_user
from app.services.phase import matching_should_run

router = APIRouter(prefix="/internal", tags=["internal"])


@router.post("/matching/run")
async def run_matching_batch(db: Session = Depends(get_db)):
    journeys = (
        db.query(UserJourney)
        .filter(
            UserJourney.phase.in_([Phase.KNOW, Phase.MATCHING]),
            UserJourney.summary_ready.is_(True),
        )
        .all()
    )
    created = []
    for j in journeys:
        match = await run_matching_for_user(db, j.user_id)
        if match:
            created.append(str(match.id))
    return {"matches_created": created}


@router.post("/matching/trigger-due")
async def trigger_due_matching(db: Session = Depends(get_db)):
    journeys = db.query(UserJourney).filter(UserJourney.phase == Phase.KNOW).all()
    triggered = []
    for j in journeys:
        if matching_should_run(j):
            j.summary_ready = True
            db.commit()
            match = await run_matching_for_user(db, j.user_id)
            if match:
                triggered.append(str(match.id))
    return {"triggered": triggered}
