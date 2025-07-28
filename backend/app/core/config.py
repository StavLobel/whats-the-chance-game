"""
Core Configuration Module
FastAPI Backend Configuration Settings

This module contains all configuration settings for the FastAPI backend,
including environment variables, Firebase settings, and security configurations.
"""

import os
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # Application Settings
    app_name: str = Field(default="What's the Chance? API")
    app_version: str = Field(default="0.1.0")
    debug: bool = Field(default=False)

    # Server Settings
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)

    # CORS Settings
    allowed_origins: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:8080",
            "https://localhost:3000",
            "https://localhost:8080",
        ]
    )

    # Security Settings
    secret_key: str = Field(...)
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)

    # Firebase Settings
    firebase_project_id: str = Field(...)
    firebase_private_key_id: Optional[str] = Field(default=None)
    firebase_private_key: Optional[str] = Field(default=None)
    firebase_client_email: Optional[str] = Field(default=None)
    firebase_client_id: Optional[str] = Field(default=None)
    firebase_auth_uri: str = Field(default="https://accounts.google.com/o/oauth2/auth")
    firebase_token_uri: str = Field(default="https://oauth2.googleapis.com/token")
    firebase_auth_provider_x509_cert_url: str = Field(
        default="https://www.googleapis.com/oauth2/v1/certs"
    )
    firebase_client_x509_cert_url: Optional[str] = Field(default=None)

    # Database Settings
    firestore_collection_prefix: str = Field(default="")

    # Redis Settings (for caching and sessions)
    redis_url: str = Field(default="redis://localhost:6379")
    redis_db: int = Field(default=0)

    # Logging Settings
    log_level: str = Field(default="INFO")

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        """Parse allowed origins from comma-separated string."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @field_validator("firebase_private_key", mode="before")
    @classmethod
    def parse_firebase_private_key(cls, v):
        """Parse Firebase private key from environment variable."""
        if v and v.startswith('"') and v.endswith('"'):
            return v[1:-1].replace("\\n", "\n")
        return v

    model_config = SettingsConfigDict(
        env_file=".env",  # Load .env file
        case_sensitive=False,
        extra="ignore",
        env_parse_none_str="",
    )


# Create global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings instance."""
    return settings
