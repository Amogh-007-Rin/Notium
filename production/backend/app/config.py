from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./notium.db"
    SECRET_KEY: str = "change-me-in-production-minimum-32-chars-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    CORS_ORIGINS: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"
    SEED_ON_STARTUP: bool = True
    RETRAIN_MODELS_ON_STARTUP: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
