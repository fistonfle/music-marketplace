"""Settings loaded from env (Docker-friendly defaults)."""

from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # If set, this takes precedence (useful for local dev: sqlite, cloud dsn, etc.)
    database_url_override: Optional[str] = Field(default=None, validation_alias="DATABASE_URL")

    postgres_user: str = "music"
    postgres_password: str = "music"
    postgres_db: str = "music_marketplace"
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    jwt_secret: str = "dev-secret-change-me"
    jwt_access_ttl_seconds: int = 900
    jwt_refresh_ttl_seconds: int = 60 * 60 * 24 * 14

    @property
    def database_url(self) -> str:
        if self.database_url_override:
            return self.database_url_override
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()

