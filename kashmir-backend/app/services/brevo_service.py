import urllib.parse
import httpx
from app.config import get_settings

_UPI_ID = "dakshsingh791@okaxis"
_UPI_NAME = "Kashmir Harvest"


def _upi_qr_url(total: float) -> str:
    upi = f"upi://pay?pa={_UPI_ID}&pn={urllib.parse.quote(_UPI_NAME)}&am={total:.2f}&cu=INR"
    return f"https://api.qrserver.com/v1/create-qr-code/?size=220x220&data={urllib.parse.quote(upi)}"


def _items_html(order: dict) -> str:
    return "".join(
        f"<tr>"
        f"<td style='padding:7px 12px'>{item.get('name','')}</td>"
        f"<td style='padding:7px 12px'>{item.get('weight','')}</td>"
        f"<td style='padding:7px 12px'>×{item.get('qty',1)}</td>"
        f"<td style='padding:7px 12px'>₹{item.get('price',0):,.0f}</td>"
        f"</tr>"
        for item in order.get("items", [])
    )


async def send_order_notification(order: dict) -> None:
    s = get_settings()
    if not s.brevo_api_key:
        return

    total: float = order.get("total", 0)
    customer_name: str = order.get("customer_name", "")
    customer_email: str = order.get("customer_email", "")
    customer_phone: str = order.get("customer_phone", "")
    rows = _items_html(order)

    table_html = f"""
    <table border="1" cellpadding="0" cellspacing="0"
           style="border-collapse:collapse;width:100%;border-color:#ddd;margin:16px 0">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="padding:8px 12px;text-align:left">Item</th>
          <th style="padding:8px 12px;text-align:left">Weight</th>
          <th style="padding:8px 12px;text-align:left">Qty</th>
          <th style="padding:8px 12px;text-align:left">Price</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
    <p style="font-size:1.05em"><b>Total: ₹{total:,.0f}</b></p>
    """

    async with httpx.AsyncClient() as client:
        # ── 1. Admin notification ──────────────────────────────────────────
        if s.brevo_admin_email:
            admin_html = f"""
            <div style="font-family:sans-serif;max-width:600px">
              <h2 style="color:#af6c1e">New Order — {customer_name}</h2>
              <p>
                <b>Email:</b> {customer_email}<br>
                <b>Phone:</b> {customer_phone}<br>
                <b>Address:</b> {order.get('delivery_address','')}
              </p>
              {table_html}
            </div>
            """
            admin_recipients = [
                {"email": e.strip()}
                for e in s.brevo_admin_email.split(",")
                if e.strip()
            ]
            await client.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={"api-key": s.brevo_api_key, "Content-Type": "application/json"},
                json={
                    "sender": {"name": "Kashmir Harvest Orders", "email": s.brevo_from_email},
                    "to": admin_recipients,
                    "subject": f"New Order — {customer_name} (₹{total:,.0f})",
                    "htmlContent": admin_html,
                },
            )

        # ── 2. Customer confirmation ───────────────────────────────────────
        if customer_email:
            qr_url = _upi_qr_url(total)
            customer_html = f"""
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">

              <!-- Header -->
              <div style="background:#0d0f12;padding:28px 24px;text-align:center">
                <h1 style="color:#af6c1e;font-family:Georgia,serif;margin:0;font-size:1.6em">
                  Kashmir Harvest
                </h1>
                <p style="color:#888;font-size:12px;margin:4px 0 0;letter-spacing:0.12em;text-transform:uppercase">
                  Pure from the Valley
                </p>
              </div>

              <!-- Body -->
              <div style="padding:32px 24px;background:#fff">
                <h2 style="color:#1a1a1a;margin-top:0">Thank you, {customer_name}!</h2>
                <p style="color:#444;line-height:1.6">
                  We have received your order. Our team will contact you on
                  <b>WhatsApp at {customer_phone}</b> to confirm shipment details.
                </p>

                <!-- Order summary -->
                {table_html}

                <hr style="border:none;border-top:1px solid #eee;margin:28px 0">

                <!-- Payment section -->
                <h3 style="color:#af6c1e;margin-bottom:6px">Pay via UPI</h3>
                <p style="color:#444;margin-bottom:20px">
                  Scan the QR code below with any UPI app
                  (Google Pay, PhonePe, Paytm) to pay <b>₹{total:,.0f}</b>.
                </p>

                <div style="text-align:center;margin:20px 0">
                  <img src="{qr_url}"
                       alt="UPI Payment QR"
                       width="220" height="220"
                       style="display:inline-block;border:1px solid #ddd;border-radius:10px;padding:10px">
                  <p style="color:#666;font-size:13px;margin:10px 0 0">
                    UPI ID: <b>{_UPI_ID}</b>
                  </p>
                </div>

                <!-- WhatsApp note -->
                <div style="background:#f9f5f0;border-left:4px solid #af6c1e;
                            padding:16px 20px;border-radius:0 8px 8px 0;margin:28px 0">
                  <p style="margin:0;color:#444;font-size:14px;line-height:1.6">
                    After payment, our team will reach out to you on
                    <b>WhatsApp at {customer_phone}</b> to arrange shipment.
                    Please keep your phone handy.
                  </p>
                </div>

                <p style="color:#999;font-size:12px;margin-top:32px;line-height:1.6">
                  Questions? Simply reply to this email.<br>
                  <b>Kashmir Harvest</b> — Saffron, Walnuts &amp; more, straight from the valley.
                </p>
              </div>

            </div>
            """
            await client.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={"api-key": s.brevo_api_key, "Content-Type": "application/json"},
                json={
                    "sender": {"name": "Kashmir Harvest", "email": s.brevo_from_email},
                    "to": [{"email": customer_email, "name": customer_name}],
                    "subject": "Your Order is Confirmed — Kashmir Harvest",
                    "htmlContent": customer_html,
                },
            )
