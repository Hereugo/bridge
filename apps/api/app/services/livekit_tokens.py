import uuid
from datetime import timedelta

from livekit import api

from app.config import settings


def create_room_token(room_name: str, identity: str, name: str) -> str:
    token = api.AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
    token.with_identity(identity).with_name(name).with_ttl(timedelta(hours=2))
    token.with_grants(
        api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
        )
    )
    return token.to_jwt()


def room_name_for_match(match_id: uuid.UUID) -> str:
    return f"bridge-wingman-{match_id}"
