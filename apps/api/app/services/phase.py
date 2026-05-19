from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Phase, User, UserJourney


def phase2_duration() -> timedelta:
    if settings.phase2_duration_minutes and settings.phase2_duration_minutes < 1440:
        return timedelta(minutes=settings.phase2_duration_minutes)
    return timedelta(days=settings.phase2_duration_days)


def ensure_journey(db: Session, user: User) -> UserJourney:
    journey = db.query(UserJourney).filter(UserJourney.user_id == user.id).first()
    if journey:
        return journey
    journey = UserJourney(user_id=user.id, phase=Phase.SWIPE)
    db.add(journey)
    user.current_phase = Phase.SWIPE
    db.commit()
    db.refresh(journey)
    return journey


def start_know_phase(db: Session, user: User, journey: UserJourney) -> UserJourney:
    now = datetime.now(timezone.utc)
    duration = phase2_duration()
    journey.phase = Phase.KNOW
    journey.phase_started_at = now
    journey.phase_ends_at = now + duration
    journey.summary_ready = False
    journey.match_reveal_delivered = False
    user.current_phase = Phase.KNOW
    db.commit()
    db.refresh(journey)
    return journey


def matching_should_run(journey: UserJourney) -> bool:
    if journey.phase != Phase.KNOW or not journey.phase_ends_at:
        return False
    if journey.summary_ready:
        return True
    now = datetime.now(timezone.utc)
    duration = phase2_duration()
    lead = duration * settings.matching_lead_fraction
    trigger_at = journey.phase_ends_at - lead
    return now >= trigger_at
