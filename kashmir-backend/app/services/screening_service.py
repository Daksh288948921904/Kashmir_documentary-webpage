import httpx
from app.config import get_settings

PARTNER_SESSION_URL = "https://screening.rig360media.com/api/partner/session"


async def get_session(user_ref: str, email: str, ttl: int = 21600) -> dict:
    """
    Calls Rig360 Partner API and returns { playbackUrl, keyUrl, keyToken, expiresIn }.
    Raises ValueError on failure.
    """
    s = get_settings()
    if not s.screening_partner_key:
        raise ValueError("SCREENING_PARTNER_KEY not configured")

    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(
            PARTNER_SESSION_URL,
            headers={
                "X-Partner-Key": s.screening_partner_key,
                "Content-Type": "application/json",
            },
            json={"userRef": user_ref, "email": email, "ttl": ttl},
        )

    if not r.is_success:
        raise ValueError(f"Screening API error {r.status_code}: {r.text}")

    return r.json()
