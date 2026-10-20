"""Configuration for Agent Firewall backend."""
import os

try:
    from pydantic import BaseModel
    class Settings(BaseModel):
        APP_NAME: str = "Agent Firewall"
        VERSION: str = "1.0.0"
        API_PREFIX: str = "/api"
        SECRET_KEY: str = os.getenv("SECRET_KEY", "gardenia-2026-agent-firewall-super-secret-key-salt")
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
        DEMO_MODE: bool = os.getenv("DEMO_MODE", "1") == "1"
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agent_firewall.db")
except ImportError:
    class Settings:
        APP_NAME: str = "Agent Firewall"
        VERSION: str = "1.0.0"
        API_PREFIX: str = "/api"
        SECRET_KEY: str = os.getenv("SECRET_KEY", "gardenia-2026-agent-firewall-super-secret-key-salt")
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
        DEMO_MODE: bool = os.getenv("DEMO_MODE", "1") == "1"
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agent_firewall.db")

settings = Settings()
