from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import get_settings
from app.services.supabase_client import get_supabase

router = APIRouter()
_bearer = HTTPBearer()

ALGORITHM = "HS256"


def verify_cms_token(credentials: HTTPAuthorizationCredentials = Security(_bearer)):
    s = get_settings()
    try:
        jwt.decode(credentials.credentials, s.cms_jwt_secret, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class ProductCreate(BaseModel):
    id: Optional[str] = None
    name: str
    subtitle: Optional[str] = None
    region: Optional[str] = None
    weight: Optional[str] = None
    price: float
    category: str
    badge: Optional[str] = None
    description: Optional[str] = None
    hue: Optional[str] = "#9a1f1a"
    img_url: Optional[str] = None
    active: Optional[bool] = True
    sort_order: Optional[int] = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    subtitle: Optional[str] = None
    region: Optional[str] = None
    weight: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    badge: Optional[str] = None
    description: Optional[str] = None
    hue: Optional[str] = None
    img_url: Optional[str] = None
    active: Optional[bool] = None
    sort_order: Optional[int] = None


# ── Public ──────────────────────────────────────────────────────────────────

@router.get("/products")
def list_public_products():
    sb = get_supabase()
    res = sb.table("products").select("*").eq("active", True).order("sort_order").execute()
    return res.data


# ── Admin (requires JWT) ─────────────────────────────────────────────────────

@router.get("/cms/products", dependencies=[Depends(verify_cms_token)])
def list_all_products():
    sb = get_supabase()
    res = sb.table("products").select("*").order("sort_order").execute()
    return res.data


@router.post("/cms/products", dependencies=[Depends(verify_cms_token)])
def create_product(body: ProductCreate):
    sb = get_supabase()
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    res = sb.table("products").insert(data).execute()
    return res.data[0]


@router.get("/cms/products/{product_id}", dependencies=[Depends(verify_cms_token)])
def get_product(product_id: str):
    sb = get_supabase()
    res = sb.table("products").select("*").eq("id", product_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return res.data[0]


@router.patch("/cms/products/{product_id}", dependencies=[Depends(verify_cms_token)])
def update_product(product_id: str, body: ProductUpdate):
    sb = get_supabase()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = sb.table("products").update(updates).eq("id", product_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return res.data[0]


@router.delete("/cms/products/{product_id}", dependencies=[Depends(verify_cms_token)])
def delete_product(product_id: str):
    sb = get_supabase()
    sb.table("products").delete().eq("id", product_id).execute()
    return {"ok": True}
