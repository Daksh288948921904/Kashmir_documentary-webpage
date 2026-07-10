import httpx
from app.config import get_settings

GRAPH_BASE = "https://graph.facebook.com/v19.0"


def is_configured() -> bool:
    s = get_settings()
    return bool(s.facebook_page_id and s.facebook_page_access_token)


async def publish_to_facebook(media_url: str | None, caption: str) -> dict:
    """
    Publishes a post to a Facebook Page.
    Returns {"fb_post_id": str} on success, raises ValueError on failure.
    """
    s = get_settings()
    token = s.facebook_page_access_token
    page_id = s.facebook_page_id

    is_video = bool(media_url and any(media_url.lower().endswith(e) for e in (".mp4", ".mov", ".m4v")))

    async with httpx.AsyncClient(timeout=30) as client:
        if media_url and is_video:
            r = await client.post(
                f"{GRAPH_BASE}/{page_id}/videos",
                params={"access_token": token, "description": caption or "", "file_url": media_url},
            )
        elif media_url:
            r = await client.post(
                f"{GRAPH_BASE}/{page_id}/photos",
                params={"access_token": token, "caption": caption or "", "url": media_url},
            )
        else:
            r = await client.post(
                f"{GRAPH_BASE}/{page_id}/feed",
                params={"access_token": token, "message": caption or ""},
            )

        data = r.json()
        post_id = data.get("id") or data.get("post_id")
        if not post_id:
            raise ValueError(data.get("error", {}).get("message", str(data)))
        return {"fb_post_id": post_id}
