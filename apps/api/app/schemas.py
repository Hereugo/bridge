from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class PersonaOut(BaseModel):
    id: UUID
    display_name: str
    tagline: str
    opener_examples: list[str]
    elevenlabs_agent_id: str
    sort_order: int

    model_config = {"from_attributes": True}


class SelectPersonaRequest(BaseModel):
    persona_id: UUID
    consent: bool = True


class JourneyOut(BaseModel):
    phase: str
    persona_id: UUID | None
    phase_started_at: datetime | None
    phase_ends_at: datetime | None
    summary_ready: bool
    match_reveal_delivered: bool
    match_id: UUID | None = None
    scheduled_call_at: datetime | None = None
    connection_card: str | None = None
    elevenlabs_agent_id: str | None = None


class SummarySubmitRequest(BaseModel):
    structured_summary: dict


class MatchRevealContext(BaseModel):
    match_ready: bool
    connection_card: str | None = None
    scheduled_call_at: datetime | None = None
    partner_first_name: str | None = None


class ConnectionCardOut(BaseModel):
    match_id: UUID
    card_text: str
    shared_topics: list[str]
    scheduled_call_at: datetime | None


class LiveKitTokenOut(BaseModel):
    token: str
    room_name: str
    livekit_url: str


class AuthSyncRequest(BaseModel):
    user_id: UUID
    email: EmailStr


class WebhookPayload(BaseModel):
    event: str
    conversation_id: str | None = None
    data: dict = Field(default_factory=dict)


class UserDeleteResponse(BaseModel):
    deleted: bool
