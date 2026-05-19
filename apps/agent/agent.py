"""
Bridge wingman LiveKit agent (Phase 4).

Joins introduction rooms, stays quiet while humans talk, and offers a gentle
prompt only after a long stall once both people are present.
"""

import asyncio
import logging
import os
import re
import time

import httpx
from livekit.agents import AgentSession, JobContext, WorkerOptions, cli
from livekit.agents.voice import Agent as VoiceAgent
from livekit.plugins import elevenlabs, silero

logger = logging.getLogger("bridge.wingman")
API_URL = os.getenv("API_URL", "http://localhost:8000").rstrip("/")
AGENT_KEY = os.getenv("BRIDGE_AGENT_INTERNAL_KEY", "dev-agent-key")
STALL_SECONDS = float(os.getenv("WINGMAN_STALL_SECONDS", "45"))


def match_id_from_room(room_name: str) -> str | None:
    m = re.match(r"bridge-wingman-(.+)", room_name)
    return m.group(1) if m else None


def is_agent_participant(identity: str) -> bool:
    low = identity.lower()
    return low.startswith("agent") or low.startswith("wingman") or "bridge-wingman" in low


async def fetch_wingman_context(match_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_URL}/calls/{match_id}/wingman-context",
            headers={"X-Bridge-Agent-Key": AGENT_KEY},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()


def human_participant_count(room) -> int:
    return sum(
        1
        for p in room.remote_participants.values()
        if not is_agent_participant(p.identity)
    )


class WingmanAgent(VoiceAgent):
    def __init__(self, card_text: str, shared_topics: list):
        topics = ", ".join(shared_topics) if shared_topics else "what brought you both here"
        super().__init__(
            instructions=(
                "You are a warm wingman at a casual evening introduction between two new friends. "
                "Stay completely silent while the humans are talking naturally. "
                "Only speak if the conversation has clearly stalled for a long time. "
                "When you do speak, offer ONE short casual prompt based on shared interests. "
                "Never mention algorithms, matching, or loneliness. "
                f"Connection context: {card_text}. "
                f"Shared topics to use if needed: {topics}."
            ),
        )


async def entrypoint(ctx: JobContext):
    await ctx.connect()
    room = ctx.room
    room_name = room.name
    match_id = match_id_from_room(room_name)
    card_text = ""
    shared_topics: list = []

    if match_id:
        try:
            ctx_data = await fetch_wingman_context(match_id)
            card_text = ctx_data.get("card_text", "")
            shared_topics = ctx_data.get("shared_topics", [])
        except Exception as e:
            logger.warning("Could not load wingman context: %s", e)

    agent = WingmanAgent(card_text, shared_topics)
    tts = elevenlabs.TTS() if os.getenv("ELEVENLABS_API_KEY") else None
    if not tts:
        logger.warning("ELEVENLABS_API_KEY not set — wingman will not speak on stall")

    session = AgentSession(vad=silero.VAD.load(), tts=tts)
    await session.start(agent=agent, room=room)

    local_identity = room.local_participant.identity if room.local_participant else ""
    last_activity = time.monotonic()
    prompted_at = 0.0

    def mark_activity() -> None:
        nonlocal last_activity
        last_activity = time.monotonic()

    @room.on("active_speakers_changed")
    def on_active_speakers(speakers):
        for participant in speakers:
            if participant.identity != local_identity and not is_agent_participant(participant.identity):
                mark_activity()
                return

    @room.on("participant_connected")
    def on_participant_connected(participant):
        if not is_agent_participant(participant.identity):
            mark_activity()
            logger.info("Human joined room: %s", participant.identity)

    logger.info("Wingman listening in %s (match=%s)", room_name, match_id or "unknown")

    while True:
        await asyncio.sleep(5)
        if human_participant_count(room) < 2:
            continue

        elapsed = time.monotonic() - last_activity
        if elapsed < STALL_SECONDS:
            continue

        if not tts:
            mark_activity()
            continue

        # Avoid repeating prompts back-to-back
        if time.monotonic() - prompted_at < STALL_SECONDS:
            continue

        topic = (
            shared_topics[0]
            if shared_topics
            else "something you're both curious about lately"
        )
        try:
            await session.say(
                f"Okay quick one — have you both talked about {topic} yet?",
                allow_interruptions=True,
            )
            prompted_at = time.monotonic()
            mark_activity()
            logger.info("Wingman offered stall prompt")
        except Exception as e:
            logger.warning("Wingman say() failed: %s", e)
            mark_activity()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
