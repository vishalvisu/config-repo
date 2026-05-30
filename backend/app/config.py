from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


_DEFAULT_CORS_ORIGINS = "http://localhost:3000"


class Settings(BaseSettings):
    cors_origins: str = _DEFAULT_CORS_ORIGINS
    groq_api_key: str | None = None
    groq_base_url: str = "https://api.groq.com/openai/v1"
    groq_model: str = "llama-3.3-70b-versatile"
    groq_vision_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    groq_timeout_seconds: float = 30.0
    openai_api_key: str | None = None
    openai_image_model: str = "gpt-image-1"
    openai_image_size: str = "1536x1024"
    thumbnail_gen_count: int = 1
    openai_timeout_seconds: float = 120.0
    openrouter_api_key: str | None = None
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "openai/gpt-4o-mini"
    openai_text_model: str = "gpt-4o-mini"
    script_doctor_timeout_seconds: float = 60.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]
        return origins or [_DEFAULT_CORS_ORIGINS]

    @property
    def groq_enabled(self) -> bool:
        return bool(self.groq_api_key and self.groq_api_key.strip())

    @property
    def openai_images_enabled(self) -> bool:
        return bool(self.openai_api_key and self.openai_api_key.strip())

    @property
    def openrouter_enabled(self) -> bool:
        return bool(self.openrouter_api_key and self.openrouter_api_key.strip())

    @property
    def openai_text_enabled(self) -> bool:
        return bool(self.openai_api_key and self.openai_api_key.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()
