from fastapi import APIRouter, HTTPException, Depends, Header
from app.models.schemas import (
    PaymentCreateRequest,
    PaymentCreateResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
)
from app.services.payments import create_order, verify_payment, verify_access_token

router = APIRouter(prefix="/payment", tags=["Payment"])


@router.post("/create-order", response_model=PaymentCreateResponse)
async def create_payment_order(req: PaymentCreateRequest):
    
    try:
        return create_order(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


@router.post("/verify", response_model=PaymentVerifyResponse)
async def verify_payment_signature(req: PaymentVerifyRequest):
    
    return verify_payment(req)


@router.get("/verify-access")
async def check_access(authorization: str = Header(...)):
    
    token = authorization.replace("Bearer ", "")
    claims = verify_access_token(token)
    if not claims:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    return {"valid": True, "expires": claims.get("exp")}