import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* POST /api/orders — save new shop order to Supabase */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const db = getSupabaseAdmin();
    const { data, error } = await db.from('orders').insert({
      customer_name:    body.customer_name    ?? body.name,
      customer_email:   body.customer_email   ?? body.email,
      customer_phone:   body.customer_phone   ?? body.phone,
      delivery_address: body.delivery_address ?? body.address,
      items:            body.items,
      total:            body.total,
      status:           'new',
    }).select().single();

    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });

    /* Send Brevo notification if configured */
    const brevoKey   = process.env.BREVO_API_KEY;
    const brevoTo   = process.env.BREVO_ADMIN_EMAIL ?? process.env.BREVO_TEAM_EMAIL;
    const brevoFrom = process.env.BREVO_FROM_EMAIL  ?? brevoTo;
    if (brevoKey && brevoTo && brevoFrom) {
      const name    = body.customer_name    ?? body.name    ?? '';
      const email   = body.customer_email   ?? body.email   ?? '';
      const phone   = body.customer_phone   ?? body.phone   ?? '';
      const address = body.delivery_address ?? body.address ?? '';
      const itemsList = (body.items ?? [])
        .map((i: { name: string; qty: number; price: number }) => `${i.name} ×${i.qty} — ₹${i.price}`)
        .join('<br>');
      /* Admin notification */
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Kashmir Harvest', email: brevoFrom },
          to: [{ email: brevoTo }],
          subject: `New Order — ${name}`,
          htmlContent: `<b>Customer:</b> ${name}<br><b>Email:</b> ${email}<br><b>Phone:</b> ${phone}<br><b>Address:</b> ${address}<br><br><b>Items:</b><br>${itemsList}<br><br><b>Total: ₹${body.total}</b>`,
        }),
      }).catch((e) => { console.error('[Brevo] fetch error:', e); return null; });
      if (brevoRes) {
        const brevoBody = await brevoRes.json().catch(() => null);
        console.log('[Brevo] status:', brevoRes.status, 'body:', JSON.stringify(brevoBody));
      }

      /* Customer confirmation with UPI QR */
      if (email) {
        const upiLink = `upi://pay?pa=dakshsingh791@okaxis&pn=Daksh+Singh&am=${body.total}&cu=INR&tn=Kashmir+Harvest+Order`;
        const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: { name: 'Kashmir Harvest', email: brevoFrom },
            to: [{ email, name }],
            subject: `Your order is confirmed — Kashmir Harvest`,
            htmlContent: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
                <h2 style="color:#1a1a1a;">Order Confirmed</h2>
                <p>Dear ${name},</p>
                <p>Thank you for your order from Kashmir Harvest. Please complete your payment using the UPI QR below.</p>

                <table style="border:1px solid #eee;border-radius:8px;padding:20px;width:100%;margin:20px 0;">
                  <tr><td colspan="2" style="font-weight:bold;padding-bottom:10px;border-bottom:1px solid #eee;">Order Summary</td></tr>
                  ${(body.items ?? []).map((i: { name: string; qty: number; price: number }) =>
                    `<tr><td style="padding:6px 0;">${i.name} ×${i.qty}</td><td style="text-align:right;">₹${i.price * i.qty}</td></tr>`
                  ).join('')}
                  <tr style="border-top:1px solid #eee;">
                    <td style="padding-top:10px;font-weight:bold;">Total</td>
                    <td style="padding-top:10px;font-weight:bold;text-align:right;">₹${body.total}</td>
                  </tr>
                </table>

                <div style="text-align:center;background:#f9f9f9;border-radius:8px;padding:24px;margin:20px 0;">
                  <p style="margin:0 0 12px;font-weight:bold;font-size:16px;">Pay ₹${body.total} via UPI</p>
                  <img src="${qrUrl}" alt="UPI QR Code" width="200" height="200" style="display:block;margin:0 auto 12px;" />
                  <p style="margin:0;color:#555;font-size:13px;">UPI ID: <b>dakshsingh791@okaxis</b></p>
                  <p style="margin:4px 0 0;color:#888;font-size:12px;">Scan with any UPI app — GPay, PhonePe, Paytm, BHIM</p>
                </div>

                <p><b>Delivery address:</b> ${address}</p>
                <p style="color:#555;font-size:13px;">Once payment is done, your order will be dispatched within 1–2 business days. For queries, reply to this email.</p>
                <p>— Kashmir Harvest Team</p>
              </div>
            `,
          }),
        }).catch(() => null);
      }
    }

    return NextResponse.json({ success: true, order_id: data.id });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
