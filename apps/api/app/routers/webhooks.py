from uuid import UUID

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Phase, UserJourney
from app.schemas import WebhookPayload
from app.services.matching import run_matching_for_user

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


class ConversationIdBody(BaseModel):
    conversation_id: str
    user_id: UUID


@router.post("/elevenlabs")
async def elevenlabs_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    body = await request.json()
    payload = WebhookPayload(
        event=body.get("type", body.get("event", "unknown")),
        conversation_id=body.get("conversation_id"),
        data=body,
    )

    if payload.conversation_id:
        journey = (
            db.query(UserJourney)
            .filter(UserJourney.elevenlabs_conversation_id == payload.conversation_id)
            .first()
        )
        if journey and payload.event in ("conversation.ended", "session.ended"):
            journey.summary_ready = True
            journey.phase = Phase.MATCHING
            db.commit()
            await run_matching_for_user(db, journey.user_id)

    return {"received": True}


@router.post("/elevenlabs/conversation-id")
def register_conversation(body: ConversationIdBody, db: Session = Depends(get_db)):
    journey = db.query(UserJourney).filter(UserJourney.user_id == body.user_id).first()
    if journey:
        journey.elevenlabs_conversation_id = body.conversation_id
        db.commit()
    return {"ok": True}
