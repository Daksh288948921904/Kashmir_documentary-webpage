from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import get_settings
from app.services.supabase_client import get_supabase
from app.services.instagram_service import is_configured, publish_to_instagram

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


class PostUpdate(BaseModel):
    content_type: Optional[str] = None
    caption: Optional[str] = None
    media_url: Optional[str] = None


# ── Config (no auth — frontend needs this before login) ──────────────────────

@router.get("/cms/instagram/config")
def instagram_config():
    return {"configured": is_configured()}


# ── CRUD ─────────────────────────────────────────────────────────────────────

@router.get("/cms/instagram", dependencies=[Depends(verify_cms_token)])
def list_posts(
    content_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    sb = get_supabase()
    offset = (page - 1) * limit
    query = (
        sb.table("instagram_posts")
        .select("*", count="exact")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )
    if content_type and content_type != "all":
        query = query.eq("content_type", content_type)
    if status and status != "all":
        query = query.eq("status", status)
    res = query.execute()
    return {"posts": res.data, "total": res.count or 0}


@router.post("/cms/instagram", dependencies=[Depends(verify_cms_token)])
def create_post(body: PostCreate):
    if body.content_type not in ("post", "story", "reel"):
        raise HTTPException(status_code=400, detail="content_type must be post, story, or reel")
    sb = get_supabase()
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    data["status"] = "draft"
    res = sb.table("instagram_posts").insert(data).execute()
    return res.data[0]


@router.get("/cms/instagram/{post_id}", dependencies=[Depends(verify_cms_token)])
def get_post(post_id: str):
    sb = get_supabase()
    res = sb.table("instagram_posts").select("*").eq("id", post_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return res.data[0]


@router.patch("/cms/instagram/{post_id}", dependencies=[Depends(verify_cms_token)])
def update_post(post_id: str, body: PostUpdate):
    sb = get_supabase()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = sb.table("instagram_posts").update(updates).eq("id", post_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return res.data[0]


@router.delete("/cms/instagram/{post_id}", dependencies=[Depends(verify_cms_token)])
def delete_post(post_id: str):
    sb = get_supabase()
    sb.table("instagram_posts").delete().eq("id", post_id).execute()
    return {"ok": True}


# ── Publish ───────────────────────────────────────────────────────────────────

@router.post("/cms/instagram/{post_id}/publish", dependencies=[Depends(verify_cms_token)])
async def publish_post(post_id: str):
    if not is_configured():
        raise HTTPException(
            status_code=503,
            detail="Instagram API not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID in .env",
        )
    sb = get_supabase()
    res = sb.table("instagram_posts").select("*").eq("id", post_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Post not found")
    post = res.data[0]
    if not post.get("media_url"):
        raise HTTPException(status_code=400, detail="Cannot publish: no media uploaded")

    now = datetime.now(timezone.utc).isoformat()
    try:
        result = await publish_to_instagram(
            media_url=post["media_url"],
            caption=post.get("caption") or "",
            content_type=post["content_type"],
        )
        sb.table("instagram_posts").update({
            "status": "published",
            "ig_media_id": result["ig_media_id"],
            "ig_error": None,
            "published_at": now,
            "updated_at": now,
        }).eq("id", post_id).execute()
        return {"ok": True, "ig_media_id": result["ig_media_id"]}
    except ValueError as e:
        sb.table("instagram_posts").update({
            "status": "failed",
            "ig_error": str(e),
            "updated_at": now,
        }).eq("id", post_id).execute()
        raise HTTPException(status_code=502, detail=str(e))
