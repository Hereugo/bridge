from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT_ENV = Path(__file__).resolve().parents[3] / ".env"
_API_DIR_ENV = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(_API_DIR_ENV), str(_REPO_ROOT_ENV), ".env"),
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

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    matching_llm_provider: str = "openai"

    phase2_duration_days: int = 7
    phase2_duration_minutes: int = 30
    matching_lead_fraction: float = 0.1

    summary_ttl_days: int = 7
    card_ttl_days: int = 30

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
