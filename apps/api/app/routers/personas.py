from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Persona
from app.schemas import PersonaOut

router = APIRouter(prefix="/personas", tags=["personas"])


@router.get("", response_model=list[PersonaOut])
def list_personas(db: Session = Depends(get_db)):
    personas = (
        db.query(Persona)
        .filter(Persona.active.is_(True))
        .order_by(Persona.sort_order)
        .all()
    )
    return [
        PersonaOut(
            id=p.id,
            display_name=p.display_name,
            tagline=p.tagline,
            opener_examples=p.opener_examples if isinstance(p.opener_examples, list) else [],
            elevenlabs_agent_id=p.elevenlabs_agent_id,
            sort_order=p.sort_order,
        )
        for p in personas
    ]
