from datetime import datetime, timedelta, timezone
from hmac import compare_digest

from fastapi import APIRouter, HTTPException
from jose import jwt
from pydantic import BaseModel

from app.config import get_settings

router = APIRouter()

ALGORITHM = "HS256"
EXPIRES_HOURS = 8


def _create_cms_token() -> str:
    s = get_settings()
    payload = {
        "role": "cms",
        "exp": datetime.now(timezone.utc) + timedelta(hours=EXPIRES_HOURS),
    }
    return jwt.encode(payload, s.cms_jwt_secret, algorithm=ALGORITHM)


class LoginBody(BaseModel):
    password: str


@router.post("/auth/login")
def cms_login(body: LoginBody):
    s = get_settings()
    if not s.cms_password:
        raise HTTPException(status_code=500, detail="CMS_PASSWORD not configured")
    if not compare_digest(body.password, s.cms_password):
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"token": _create_cms_token()}
