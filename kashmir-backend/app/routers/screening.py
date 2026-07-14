import os

from fastapi import APIRouter, HTTPException, Request
from jose import JWTError, jwt

from app.config import get_settings
from app.services.screening_service import get_session

router = APIRouter()


def _extract_jwt_claims(token: str) -> dict:
    """Decode the ue_access JWT without verifying expiry for claim extraction.
    Full verification is done by checking signature with our secret."""
    s = get_settings()
    try:
        return jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_algorithm])
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid access token: {e}")


@router.get("/screening/dev-session")
async def dev_screening_session():
    """Dev-only endpoint — no auth required. Disabled in production."""
    if os.getenv("ENV", "development") == "production":
        raise HTTPException(status_code=404, detail="Not found")
    try:
        session = await get_session(user_ref="dev-preview", email="dev@kashmirharvest.in", ttl=3600)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return session


@router.get("/screening/session")
async def screening_session(request: Request):
    """
    Called by the frontend after payment. Verifies the ue_access JWT then
    exchanges it for a Rig360 playback session (playbackUrl + keyToken).
    """
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")

    token = auth.removeprefix("Bearer ")
    claims = _extract_jwt_claims(token)

    user_ref = str(claims.get("sub") or claims.get("order_id") or "unknown")
    email    = str(claims.get("email") or "viewer@kashmirharvest.in")

    try:
        session = await get_session(user_ref=user_ref, email=email)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return session
