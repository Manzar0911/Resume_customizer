"""Application configuration using pydantic-settings"""
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # API Keys
    GEMINI_API_KEY: str = ""

    # Application
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    APP_VERSION: str = "1.0.0"

    # LLM Settings
    GEMINI_MODEL: str = "gemini-flash-lite-latest"
    GEMINI_FLASH_MODEL: str = "gemini-flash-lite-latest"
    LLM_TEMPERATURE: float = 0.3
    LLM_MAX_OUTPUT_TOKENS: int = 8192
    LLM_TIMEOUT_SECONDS: int = 60
    LLM_MAX_RETRIES: int = 3

    # File Upload
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 10

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # Text Limits
    MAX_JD_LENGTH: int = 50000
    MIN_JD_LENGTH: int = 50
    MAX_RESUME_TEXT_LENGTH: int = 100000

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
