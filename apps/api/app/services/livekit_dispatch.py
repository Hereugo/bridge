import asyncio
import logging

from livekit import api

from app.config import settings

logger = logging.getLogger("bridge.livekit")


def _api_http_url() -> str:
    url = (settings.livekit_url or "").strip()
    if url.startswith("wss://"):
        return "https://" + url[6:]
    if url.startswith("ws://"):
        return "http://" + url[5:]
    return url


async def _ensure_wingman_dispatch_async(room_name: str) -> None:
    if not settings.livekit_api_key or not settings.livekit_api_secret:
        return

    lk = api.LiveKitAPI(
        url=_api_http_url(),
        api_key=settings.livekit_api_key,
        api_secret=settings.livekit_api_secret,
    )
    agent_name = settings.wingman_agent_name
    try:
        existing = await lk.agent_dispatch.list_dispatch(room_name=room_name)
        if any(getattr(d, "agent_name", None) == agent_name for d in existing):
            return
        await lk.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(agent_name=agent_name, room=room_name)
        )
        logger.info("Dispatched wingman agent %s to room %s", agent_name, room_name)
    except Exception as exc:
        logger.warning("Wingman dispatch failed for room %s: %s", room_name, exc)
    finally:
        await lk.aclose()


def ensure_wingman_dispatched(room_name: str) -> None:
    """Request the wingman worker to join a call room (idempotent)."""
    try:
        asyncio.run(_ensure_wingman_dispatch_async(room_name))
    except RuntimeError:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.ensure_future(_ensure_wingman_dispatch_async(room_name))
        else:
            loop.run_until_complete(_ensure_wingman_dispatch_async(room_name))
