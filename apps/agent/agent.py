"""
Bridge wingman LiveKit agent (Phase 4).

Joins three-way rooms, stays silent unless conversation stalls,
then injects a topic from the connection card.
"""

import asyncio
import logging
import os
import re

import httpx
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.agents.voice import Agent as VoiceAgent
from livekit.plugins import elevenlabs, silero

logger = logging.getLogger("bridge.wingman")
API_URL = os.getenv("API_URL", "http://localhost:8000")
STALL_SECONDS = float(os.getenv("WINGMAN_STALL_SECONDS", "45"))


def match_id_from_room(room_name: str) -> str | None:
    m = re.match(r"bridge-wingman-(.+)", room_name)
    return m.group(1) if m else None


async def fetch_wingman_context(match_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{API_URL}/calls/{match_id}/wingman-context", timeout=10)
        resp.raise_for_status()
        return resp.json()


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
        self._card_text = card_text
        self._shared_topics = shared_topics
        self._last_speech = asyncio.get_event_loop().time()

    async def on_enter(self):
        logger.info("Wingman joined — listening silently")

    async def on_user_speech(self):
        self._last_speech = asyncio.get_event_loop().time()

    async def stall_monitor(self, session: AgentSession):
        while True:
            await asyncio.sleep(5)
            elapsed = asyncio.get_event_loop().time() - self._last_speech
            if elapsed >= STALL_SECONDS:
                topic = (
                    self._shared_topics[0]
                    if self._shared_topics
                    else "something you're both curious about lately"
                )
                await session.say(
                    f"Okay quick one — have you both talked about {topic} yet?",
                    allow_interruptions=True,
                )
                self._last_speech = asyncio.get_event_loop().time()


async def entrypoint(ctx: JobContext):
    await ctx.connect()
    room_name = ctx.room.name
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
    session = AgentSession(
        vad=silero.VAD.load(),
        tts=elevenlabs.TTS() if os.getenv("ELEVENLABS_API_KEY") else None,
    )
    await session.start(agent=agent, room=ctx.room)
    asyncio.create_task(agent.stall_monitor(session))


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
