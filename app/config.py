from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


_APP_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    # Apify
    apify_api_token: str = ""

    # Razorpay
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    # News
    news_api_key: str = ""

    # App
    app_secret_key: str = "dev-secret"
    frontend_url: str = "http://localhost:5173"
    documentary_price_inr: int = 299

    # JWT
    jwt_secret: str = "dev-jwt-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    class Config:
        env_file = str(_APP_DIR / ".env")
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()