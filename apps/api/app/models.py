import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Phase(str, enum.Enum):
    ONBOARDING = "ONBOARDING"
    SWIPE = "SWIPE"
    KNOW = "KNOW"
    MATCHING = "MATCHING"
    MATCHED = "MATCHED"
    WINGMAN = "WINGMAN"
    COMPLETE = "COMPLETE"


class MatchStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CALL_SCHEDULED = "CALL_SCHEDULED"
    CALL_COMPLETE = "CALL_COMPLETE"
    CANCELLED = "CANCELLED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    current_phase: Mapped[Phase] = mapped_column(Enum(Phase), default=Phase.ONBOARDING)
    consent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    journey: Mapped["UserJourney | None"] = relationship(back_populates="user", uselist=False)
    summaries: Mapped[list["Summary"]] = relationship(back_populates="user")


class Persona(Base):
    __tablename__ = "personas"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    display_name: Mapped[str] = mapped_column(String(100))
    tagline: Mapped[str] = mapped_column(String(500))
    opener_examples: Mapped[dict] = mapped_column(JSONB, default=list)
    elevenlabs_agent_id: Mapped[str] = mapped_column(String(255))
    elevenlabs_voice_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class UserJourney(Base):
    __tablename__ = "user_journeys"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    persona_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("personas.id"), nullable=True
    )
    phase: Mapped[Phase] = mapped_column(Enum(Phase), default=Phase.SWIPE)
    phase_started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    phase_ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    elevenlabs_conversation_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    summary_ready: Mapped[bool] = mapped_column(Boolean, default=False)
    match_reveal_delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="journey")
    persona: Mapped["Persona | None"] = relationship()


class Summary(Base):
    __tablename__ = "summaries"
    __table_args__ = (Index("ix_summaries_expires_at", "expires_at"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    journey_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("user_journeys.id"))
    structured_summary: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="summaries")


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_a_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    user_b_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    status: Mapped[MatchStatus] = mapped_column(Enum(MatchStatus), default=MatchStatus.CONFIRMED)
    scheduled_call_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    compatibility_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    connection_card: Mapped["ConnectionCard | None"] = relationship(back_populates="match", uselist=False)
    wingman_session: Mapped["WingmanSession | None"] = relationship(back_populates="match", uselist=False)


class ConnectionCard(Base):
    __tablename__ = "connection_cards"
    __table_args__ = (Index("ix_connection_cards_expires_at", "expires_at"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    match_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("matches.id"), unique=True)
    card_text: Mapped[str] = mapped_column(Text)
    shared_topics: Mapped[dict] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    match: Mapped["Match"] = relationship(back_populates="connection_card")


class WingmanSession(Base):
    __tablename__ = "wingman_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    match_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("matches.id"), unique=True)
    livekit_room_name: Mapped[str] = mapped_column(String(255))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    purge_after: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    match: Mapped["Match"] = relationship(back_populates="wingman_session")


class DeletionAudit(Base):
    __tablename__ = "deletion_audit"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity: Mapped[str] = mapped_column(String(64))
    entity_id: Mapped[str] = mapped_column(String(64))
    deleted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class MagicLinkToken(Base):
    __tablename__ = "magic_link_tokens"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), index=True)
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
