from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _env_files() -> tuple[str, ...]:
    """Optional .env paths for local dev. Production uses injected env vars (Docker/Dokploy)."""
    here = Path(__file__).resolve()
    paths: list[str] = []
    # Monorepo: apps/api/app/config.py -> repo root at parents[3]
    if len(here.parents) > 3:
        paths.append(str(here.parents[3] / ".env"))
    # API package dir: apps/api/.env locally, /app/.env in Docker (WORKDIR /app)
    if len(here.parents) > 1:
        paths.append(str(here.parents[1] / ".env"))
    paths.append(".env")
    return tuple(paths)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_files(),
        extra="ignore",
    )

    database_url: str = "postgresql://bridge:bridge@localhost:5432/bridge"
    api_jwt_secret: str = "dev-secret"
    cors_origins: str = "http://localhost:3000"

    elevenlabs_api_key: str = ""
    elevenlabs_webhook_secret: str = ""

    livekit_url: str = ""
    livekit_public_url: str = ""
    livekit_api_key: str = ""
    livekit_api_secret: str = ""
    bridge_agent_internal_key: str = "dev-agent-key"
    wingman_agent_name: str = "bridge-wingman"

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    matching_llm_provider: str = "openai"

    phase2_duration_days: int = 7
    phase2_duration_minutes: int = 30
    matching_lead_fraction: float = 0.1
    # PoC: pair the first two summary-ready users (FIFO). Set false for per-user candidate loop.
    matching_simple_first_pair: bool = True

    summary_ttl_days: int = 7
    card_ttl_days: int = 30

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
