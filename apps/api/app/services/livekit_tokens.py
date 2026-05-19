import uuid
from datetime import timedelta

from livekit import api

from app.config import settings


def normalize_livekit_url(url: str) -> str:
    """Ensure browser-safe WebSocket URL (wss when API is configured with ws)."""
    if not url:
        return url
    u = url.strip()
    if u.startswith("https://"):
        return u.replace("https://", "wss://", 1)
    if u.startswith("http://"):
        return u.replace("http://", "ws://", 1)
    return u


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
    if settings.wingman_agent_name:
        token.with_room_config(
            api.RoomConfiguration(
                agents=[
                    api.RoomAgentDispatch(
                        agent_name=settings.wingman_agent_name,
                        metadata="bridge-wingman",
                    )
                ],
            )
        )
    return token.to_jwt()


def room_name_for_match(match_id: uuid.UUID) -> str:
    return f"bridge-wingman-{match_id}"
