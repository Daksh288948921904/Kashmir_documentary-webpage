import io
import logging
import uuid

import httpx
from PIL import Image

from app.config import get_settings
from app.services.supabase_client import get_supabase

log = logging.getLogger(__name__)

AYRSHARE_URL = "https://api.ayrshare.com/api"
BUCKET = "product-images"
MAX_IMAGE_BYTES = 5 * 1024 * 1024

# X only accepts JPEG, PNG, GIF
X_UNSUPPORTED = {".webp", ".avif", ".heic", ".heif", ".bmp", ".tiff", ".tif"}

PLATFORM_MAP = {
    "instagram": "instagram",
    "facebook":  "facebook",
    "x":         "twitter",
}


def is_configured() -> bool:
    return bool(get_settings().ayrshare_api_key)


def _headers(platforms: list[str] | None = None) -> dict:
    s = get_settings()
    headers = {
        "Authorization": f"Bearer {s.ayrshare_api_key}",
        "Content-Type": "application/json",
    }
    if platforms and "x" in platforms and s.x_api_key:
        headers["X-Twitter-OAuth1-Api-Key"]             = s.x_api_key
        headers["X-Twitter-OAuth1-Api-Secret"]          = s.x_api_secret
        headers["X-Twitter-OAuth1-Access-Token"]        = s.x_access_token
        headers["X-Twitter-OAuth1-Access-Token-Secret"] = s.x_access_token_secret
    return headers


def _to_jpeg(data: bytes) -> bytes:
    """Convert image bytes to JPEG, compressed to under 5 MB."""
    img = Image.open(io.BytesIO(data))
    if img.mode in ("RGBA", "LA"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    for quality in (85, 75, 65, 55, 45, 35):
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        out = buf.getvalue()
        if len(out) <= MAX_IMAGE_BYTES:
            return out

    img = img.resize((img.width // 2, img.height // 2), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=55, optimize=True)
    return buf.getvalue()


async def _ensure_x_compatible_url(media_url: str) -> str:
    """
    If the media URL is a format X doesn't support (WebP, AVIF, etc.),
    download it, convert to JPEG, upload to Supabase, and return new URL.
    """
    lower = media_url.lower()
    needs_convert = any(lower.endswith(ext) for ext in X_UNSUPPORTED)
    if not needs_convert:
        return media_url

    log.info("Converting %s to JPEG for X compatibility", media_url)
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(media_url)
        r.raise_for_status()
        original = r.content

    jpeg_bytes = _to_jpeg(original)
    filename = f"{uuid.uuid4()}.jpg"
    sb = get_supabase()
    sb.storage.from_(BUCKET).upload(
        filename,
        jpeg_bytes,
        file_options={"content-type": "image/jpeg"},
    )
    new_url = sb.storage.from_(BUCKET).get_public_url(filename)
    log.info("Uploaded converted JPEG: %s", new_url)
    return new_url


async def get_connected_platforms() -> list[str]:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(f"{AYRSHARE_URL}/user", headers=_headers())
        if not r.is_success:
            return []
        data = r.json()
        connected = set(data.get("activeSocialAccounts", []))
        result = [k for k, v in PLATFORM_MAP.items() if v in connected]
        s = get_settings()
        if s.x_api_key and "x" not in result:
            result.append("x")
        return result


async def publish(
    platforms: list[str],
    caption: str,
    media_url: str | None = None,
) -> dict:
    ayr_platforms = [PLATFORM_MAP[p] for p in platforms if p in PLATFORM_MAP]
    if not ayr_platforms:
        raise ValueError("No valid platforms selected")

    # Convert media to X-compatible format if needed
    if media_url and "x" in platforms:
        media_url = await _ensure_x_compatible_url(media_url)

    body: dict = {"post": caption or "", "platforms": ayr_platforms}
    if media_url:
        body["mediaUrls"] = [media_url]

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{AYRSHARE_URL}/post",
            headers=_headers(platforms),
            json=body,
        )
        data = r.json()

    log.info("Ayrshare response [%s]: %s", r.status_code, data)
    return data
