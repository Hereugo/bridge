import httpx

from app.config import settings

ELEVENLABS_SIGNED_URL = "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"


def fetch_voice_signed_url(agent_id: str) -> str:
    if not settings.elevenlabs_api_key:
        raise ValueError("ELEVENLABS_API_KEY is not configured")
    response = httpx.get(
        ELEVENLABS_SIGNED_URL,
        params={"agent_id": agent_id},
        headers={"xi-api-key": settings.elevenlabs_api_key},
        timeout=15.0,
    )
    response.raise_for_status()
    signed_url = response.json().get("signed_url")
    if not signed_url:
        raise ValueError("ElevenLabs did not return a signed_url")
    return signed_url
