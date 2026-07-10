from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


_APP_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    # Apify
    apify_api_token: str = ""

    # Airpay
    airpay_merchant_id: str = ""
    airpay_username: str = ""
    airpay_password: str = ""
    airpay_api_key: str = ""
    airpay_client_id: str = ""
    airpay_secret_key: str = ""
    airpay_is_test: bool = True
    airpay_base_url: str = "https://payments.airpay.co.in/pay/index.php"

    # News
    news_api_key: str = ""

    # App
    app_secret_key: str = "dev-secret"
    frontend_url: str = "http://localhost:3000"
    documentary_price_inr: int = 1

    # JWT
    jwt_secret: str = "dev-jwt-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # Kashmir Harvest CMS
    cms_password: str = ""
    cms_jwt_secret: str = "cms-dev-secret"

    # Brevo email
    brevo_api_key: str = ""
    brevo_from_email: str = "harvest@kashmirharvest.in"
    brevo_admin_email: str = ""

    # Ayrshare (social media publishing)
    ayrshare_api_key: str = ""

    # X / Twitter BYOK credentials (passed as headers to Ayrshare)
    x_api_key: str = ""
    x_api_secret: str = ""
    x_access_token: str = ""
    x_access_token_secret: str = ""

    class Config:
        env_file = str(_APP_DIR / ".env")
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()