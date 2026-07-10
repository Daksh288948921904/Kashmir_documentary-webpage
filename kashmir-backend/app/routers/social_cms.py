from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import get_settings
from app.services.supabase_client import get_supabase
from app.services import ayrshare_service

router = APIRouter()
_bearer = HTTPBearer()
ALGORITHM = "HS256"


def verify_cms_token(credentials: HTTPAuthorizationCredentials = Security(_bearer)):
    s = get_settings()
    try:
        jwt.decode(credentials.credentials, s.cms_jwt_secret, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class PostCreate(BaseModel):
    content_type: str
    caption: Optional[str] = None
    media_url: Optional[str] = None
    platforms: list[str] = []


class PostUpdate(BaseModel):
    content_type: Optional[str] = None
    caption: Optional[str] = None
    media_url: Optional[str] = None
    platforms: Optional[list[str]] = None


# ── Config ────────────────────────────────────────────────────────────────────

@router.get("/cms/social/config")
async def social_config():
    if not ayrshare_service.is_configured():
        return {"instagram": False, "facebook": False, "x": False}
    connected = await ayrshare_service.get_connected_platforms()
    return {
        "instagram": "instagram" in connected,
        "facebook":  "facebook"  in connected,
        "x":         "x"         in connected,
    }


# ── CRUD ─────────────────────────────────────────────────────────────────────

@router.get("/cms/social", dependencies=[Depends(verify_cms_token)])
def list_posts(
    content_type: Optional[str] = Query(None),
    overall_status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    sb = get_supabase()
    offset = (page - 1) * limit
    query = (
        sb.table("social_posts")
        .select("*", count="exact")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )
    if content_type and content_type != "all":
        query = query.eq("content_type", content_type)
    if overall_status and overall_status != "all":
        query = query.eq("overall_status", overall_status)
    res = query.execute()
    return {"posts": res.data, "total": res.count or 0}


@router.post("/cms/social", dependencies=[Depends(verify_cms_token)])
def create_post(body: PostCreate):
    if body.content_type not in ("post", "story", "reel"):
        raise HTTPException(status_code=400, detail="content_type must be post, story, or reel")
    sb = get_supabase()
    data = {
        "content_type": body.content_type,
        "caption": body.caption,
        "media_url": body.media_url,
        "platforms": body.platforms,
        "publish_status": {},
        "overall_status": "draft",
    }
    res = sb.table("social_posts").insert(data).execute()
    return res.data[0]


@router.get("/cms/social/{post_id}", dependencies=[Depends(verify_cms_token)])
def get_post(post_id: str):
    sb = get_supabase()
    res = sb.table("social_posts").select("*").eq("id", post_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return res.data[0]


@router.patch("/cms/social/{post_id}", dependencies=[Depends(verify_cms_token)])
def update_post(post_id: str, body: PostUpdate):
    sb = get_supabase()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = sb.table("social_posts").update(updates).eq("id", post_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return res.data[0]


@router.delete("/cms/social/{post_id}", dependencies=[Depends(verify_cms_token)])
def delete_post(post_id: str):
    sb = get_supabase()
    sb.table("social_posts").delete().eq("id", post_id).execute()
    return {"ok": True}


# ── Publish ───────────────────────────────────────────────────────────────────

@router.post("/cms/social/{post_id}/publish", dependencies=[Depends(verify_cms_token)])
async def publish_post(post_id: str):
    sb = get_supabase()
    res = sb.table("social_posts").select("*").eq("id", post_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Post not found")
    post = res.data[0]

    platforms: list[str] = post.get("platforms") or []
    if not platforms:
        raise HTTPException(status_code=400, detail="No platforms selected")
    if not post.get("media_url") and not post.get("caption"):
        raise HTTPException(status_code=400, detail="Post needs at least a caption or media")

    if not ayrshare_service.is_configured():
        raise HTTPException(status_code=503, detail="Ayrshare API key not configured")

    now = datetime.now(timezone.utc).isoformat()
    publish_status: dict = dict(post.get("publish_status") or {})
    results: dict = {"published": [], "failed": [], "skipped": []}

    data = await ayrshare_service.publish(
        platforms=platforms,
        caption=post.get("caption") or "",
        media_url=post.get("media_url"),
    )

    reverse = {v: k for k, v in ayrshare_service.PLATFORM_MAP.items()}

    # postIds — successful platforms (list of {platform, id, ...} or dict)
    post_ids_raw = data.get("postIds") or []
    if isinstance(post_ids_raw, dict):
        post_ids_raw = [{"platform": k, "id": v} for k, v in post_ids_raw.items()]

    for item in post_ids_raw:
        if not isinstance(item, dict):
            continue
        if item.get("status") != "success":
            continue
        ayr_plat = item.get("platform", "")
        our_key  = reverse.get(ayr_plat, ayr_plat)
        publish_status[our_key] = {
            "status": "published",
            "id": str(item.get("id") or item.get("postId") or ""),
            "error": None,
            "published_at": now,
        }
        results["published"].append(our_key)

    # errors — failed platforms (list of {platform, message, ...} or dict)
    errors_raw = data.get("errors") or []
    if isinstance(errors_raw, dict):
        errors_raw = [{"platform": k, "message": v} for k, v in errors_raw.items()]

    for item in errors_raw:
        if not isinstance(item, dict):
            continue
        ayr_plat = item.get("platform", "")
        our_key  = reverse.get(ayr_plat, ayr_plat)
        if our_key in results["published"]:
            continue  # already counted as success
        msg = item.get("message") or item.get("error") or str(item)
        publish_status[our_key] = {"status": "failed", "error": msg}
        if our_key not in results["failed"]:
            results["failed"].append(our_key)

    # Compute overall status
    if results["failed"] and not results["published"]:
        overall = "failed"
    elif results["failed"] or results["skipped"]:
        overall = "partial"
    elif results["published"]:
        overall = "published"
    else:
        overall = "draft"

    sb.table("social_posts").update({
        "publish_status": publish_status,
        "overall_status": overall,
        "updated_at": now,
    }).eq("id", post_id).execute()

    return {"ok": True, "results": results, "publish_status": publish_status}
