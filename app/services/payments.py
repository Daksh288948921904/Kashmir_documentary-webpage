import hmac
import hashlib
import razorpay
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.config import get_settings
from app.models.schemas import (
    PaymentCreateRequest,
    PaymentCreateResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
)


def _get_client():
    s = get_settings()
    return razorpay.Client(auth=(s.razorpay_key_id, s.razorpay_key_secret))


def create_order(req: PaymentCreateRequest) -> PaymentCreateResponse:
    s = get_settings()
    client = _get_client()
    order = client.order.create({
        "amount": s.documentary_price_inr * 100,  # paise
        "currency": "INR",
        "payment_capture": 1,
        "notes": {"email": req.email, "name": req.name},
    })
    return PaymentCreateResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        razorpay_key_id=s.razorpay_key_id,
    )


def verify_payment(req: PaymentVerifyRequest) -> PaymentVerifyResponse:
    s = get_settings()
    body = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
    expected = hmac.new(
        s.razorpay_key_secret.encode(),
        body.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, req.razorpay_signature):
        return PaymentVerifyResponse(verified=False, message="Invalid signature")

    expire = datetime.now(timezone.utc) + timedelta(minutes=s.access_token_expire_minutes)
    token = jwt.encode(
        {"sub": req.razorpay_payment_id, "exp": expire},
        s.jwt_secret,
        algorithm=s.jwt_algorithm,
    )
    return PaymentVerifyResponse(verified=True, access_token=token, message="Payment verified")


def verify_access_token(token: str) -> dict | None:
    s = get_settings()
    try:
        return jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_algorithm])
    except JWTError:
        return None
