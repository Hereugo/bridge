from sqlalchemy.orm import Session

from app.models import Persona


def seed_personas(db: Session) -> None:
    if db.query(Persona).count() > 0:
        return

    personas = [
        Persona(
            display_name="Noor",
            tagline="Late-night playlists and unhurried conversation",
            opener_examples=[
                "What's the last song that stopped you mid-scroll?",
                "Best small venue you've found in the city?",
            ],
            elevenlabs_agent_id="agent_noor_placeholder",
            elevenlabs_voice_id="voice_noor_placeholder",
            sort_order=1,
        ),
        Persona(
            display_name="Milan",
            tagline="Dry humour, big opinions on coffee",
            opener_examples=[
                "Team espresso or something weirder?",
                "What's a hill you'll die on that's actually harmless?",
            ],
            elevenlabs_agent_id="agent_milan_placeholder",
            elevenlabs_voice_id="voice_milan_placeholder",
            sort_order=2,
        ),
        Persona(
            display_name="Sage",
            tagline="Calm energy, curious about everything",
            opener_examples=[
                "What did you learn recently that surprised you?",
                "Sunday morning ritual — what's yours?",
            ],
            elevenlabs_agent_id="agent_sage_placeholder",
            elevenlabs_voice_id="voice_sage_placeholder",
            sort_order=3,
        ),
        Persona(
            display_name="Ravi",
            tagline="Spontaneous plans, always finding a gig",
            opener_examples=[
                "Last minute yes that actually paid off?",
                "Hidden spot you'd take a friend to?",
            ],
            elevenlabs_agent_id="agent_ravi_placeholder",
            elevenlabs_voice_id="voice_ravi_placeholder",
            sort_order=4,
        ),
    ]
    db.add_all(personas)
    db.commit()
