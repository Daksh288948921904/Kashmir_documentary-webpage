from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import get_settings
from app.services.brevo_service import send_order_notification
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


class OrderItem(BaseModel):
    id: str
    name: str
    weight: Optional[str] = None
    price: float
    qty: int


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    delivery_address: str
    items: List[OrderItem]
    total: float


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


# ── Public ──────────────────────────────────────────────────────────────────

@router.post("/orders")
async def create_order(body: OrderCreate, background_tasks: BackgroundTasks):
    sb = get_supabase()
    data = body.model_dump()
    res = sb.table("orders").insert(data).execute()
    order = res.data[0]
    background_tasks.add_task(send_order_notification, data)
    return {"ok": True, "id": order["id"]}


# ── Admin (requires JWT) ─────────────────────────────────────────────────────

@router.get("/cms/orders", dependencies=[Depends(verify_cms_token)])
def list_orders(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    sb = get_supabase()
    offset = (page - 1) * limit
    query = (
        sb.table("orders")
        .select("*", count="exact")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )
    if status and status != "all":
        query = query.eq("status", status)
    res = query.execute()
    return {"orders": res.data, "total": res.count or 0}


@router.get("/cms/orders/{order_id}", dependencies=[Depends(verify_cms_token)])
def get_order(order_id: str):
    sb = get_supabase()
    res = sb.table("orders").select("*").eq("id", order_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return res.data[0]


@router.patch("/cms/orders/{order_id}", dependencies=[Depends(verify_cms_token)])
def update_order(order_id: str, body: OrderUpdate):
    sb = get_supabase()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = sb.table("orders").update(updates).eq("id", order_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return res.data[0]
