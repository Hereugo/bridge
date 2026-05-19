from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

ALGORITHM = "HS256"
security = HTTPBearer()


def create_access_token(user_id: UUID, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, settings.api_jwt_secret, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.api_jwt_secret, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user = db.query(User).filter(User.id == UUID(user_id), User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
