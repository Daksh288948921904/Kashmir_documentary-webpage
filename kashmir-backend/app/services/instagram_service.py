import httpx
from app.config import get_settings

GRAPH_BASE = "https://graph.facebook.com/v19.0"


def is_configured() -> bool:
    s = get_settings()
    return bool(s.instagram_access_token and s.instagram_business_account_id)


async def publish_to_instagram(media_url: str, caption: str, content_type: str) -> dict:
    """
    Publishes media to Instagram via the Graph API.
    Returns {"ig_media_id": str} on success.
    Raises ValueError with a human-readable message on failure.
    """
    s = get_settings()
    token = s.instagram_access_token
    account_id = s.instagram_business_account_id

    params: dict = {"access_token": token, "caption": caption or ""}

    if content_type == "reel":
        params["media_type"] = "REELS"
        params["video_url"] = media_url
    elif content_type == "story":
        is_video = any(media_url.lower().endswith(ext) for ext in (".mp4", ".mov", ".m4v"))
        if is_video:
            params["media_type"] = "VIDEO"
            params["video_url"] = media_url
        else:
            params["media_type"] = "IMAGE"
            params["image_url"] = media_url
    else:
        params["image_url"] = media_url

    async with httpx.AsyncClient(timeout=30) as client:
        r1 = await client.post(f"{GRAPH_BASE}/{account_id}/media", params=params)
        d1 = r1.json()
        if "id" not in d1:
            raise ValueError(d1.get("error", {}).get("message", str(d1)))

        r2 = await client.post(
            f"{GRAPH_BASE}/{account_id}/media_publish",
            params={"creation_id": d1["id"], "access_token": token},
        )
        d2 = r2.json()
        if "id" not in d2:
            raise ValueError(d2.get("error", {}).get("message", str(d2)))

        return {"ig_media_id": d2["id"]}
