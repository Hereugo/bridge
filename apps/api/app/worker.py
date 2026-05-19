import asyncio
import logging

from apscheduler.schedulers.blocking import BlockingScheduler

from app.database import SessionLocal
from app.services.cleanup import purge_expired_records
from app.services.matching import run_matching_for_user
from app.models import Phase, UserJourney
from app.services.phase import matching_should_run

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bridge.worker")


async def _run_matching_cycle():
    db = SessionLocal()
    try:
        journeys = db.query(UserJourney).filter(UserJourney.phase == Phase.KNOW).all()
        for j in journeys:
            if matching_should_run(j) and not j.summary_ready:
                j.summary_ready = True
                db.commit()
            if j.summary_ready:
                await run_matching_for_user(db, j.user_id)
    finally:
        db.close()


def matching_job():
    asyncio.run(_run_matching_cycle())


def cleanup_job():
    db = SessionLocal()
    try:
        n = purge_expired_records(db)
        if n:
            logger.info("Purged %s expired records", n)
    finally:
        db.close()


def main():
    scheduler = BlockingScheduler()
    scheduler.add_job(matching_job, "interval", minutes=1, id="matching")
    scheduler.add_job(cleanup_job, "interval", minutes=5, id="cleanup")
    logger.info("Bridge worker started")
    scheduler.start()


if __name__ == "__main__":
    main()
