from datetime import datetime, timedelta, timezone
import secrets

import re

import email_validator
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

# Dev/demo addresses like alice@demo.test use the .test TLD (reserved). EmailStr rejects those.
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def normalize_email(value: str) -> str:
    value = value.strip().lower()
    try:
        email_validator.validate_email(
            value,
            check_deliverability=False,
            test_environment=True,
        )
        return value
    except email_validator.EmailNotValidError:
        if _EMAIL_RE.match(value):
            return value
        raise

from app.auth import create_access_token
from app.database import get_db
from app.models import MagicLinkToken, Phase, User, UserJourney

router = APIRouter(prefix="/auth", tags=["auth"])


class MagicLinkRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return normalize_email(v)


class MagicLinkVerify(BaseModel):
    token: str


class TokenResponse(BaseModel):
    access_token: str
    user_id: str
    email: str


class AuthSyncRequest(BaseModel):
    user_id: str
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return normalize_email(v)


@router.post("/magic-link", response_model=dict)
def request_magic_link(body: MagicLinkRequest, db: Session = Depends(get_db)):
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.add(MagicLinkToken(email=body.email.lower(), token=token, expires_at=expires))
    db.commit()

    # Next.js handles verification on /login (not /auth/verify)
    link = f"/login?token={token}"
    print(f"[Bridge dev] Magic link for {body.email}: {link}")

    return {"message": "Magic link sent", "dev_link": link}


@router.post("/verify", response_model=TokenResponse)
def verify_magic_link(body: MagicLinkVerify, db: Session = Depends(get_db)):
    record = (
        db.query(MagicLinkToken)
        .filter(MagicLinkToken.token == body.token, MagicLinkToken.used_at.is_(None))
        .first()
    )
    if not record or record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    record.used_at = datetime.now(timezone.utc)
    email = record.email.lower()
    user = db.query(User).filter(User.email == email, User.deleted_at.is_(None)).first()
    if not user:
        user = User(email=email, current_phase=Phase.ONBOARDING)
        db.add(user)
        db.flush()
        db.add(UserJourney(user_id=user.id, phase=Phase.ONBOARDING))

    db.commit()
    access = create_access_token(user.id, user.email)
    return TokenResponse(access_token=access, user_id=str(user.id), email=user.email)


@router.post("/sync", response_model=TokenResponse)
def sync_user_from_next(body: AuthSyncRequest, db: Session = Depends(get_db)):
    """Called by Next.js after session creation to get API JWT."""
    from uuid import UUID

    user = db.query(User).filter(User.id == UUID(body.user_id), User.deleted_at.is_(None)).first()
    if not user:
        user = User(id=UUID(body.user_id), email=body.email.lower(), current_phase=Phase.ONBOARDING)
        db.add(user)
        db.flush()
        db.add(UserJourney(user_id=user.id, phase=Phase.ONBOARDING))
    db.commit()
    access = create_access_token(user.id, user.email)
    return TokenResponse(access_token=access, user_id=str(user.id), email=user.email)
