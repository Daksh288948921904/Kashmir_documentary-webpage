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

      /* Customer confirmation */
      if (email) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: { name: 'Kashmir Harvest', email: brevoFrom },
            to: [{ email, name }],
            subject: `Your order is confirmed — Kashmir Harvest`,
            htmlContent: `
              <p>Dear ${name},</p>
              <p>Thank you for your order! We've received it and will be in touch soon to confirm delivery.</p>
              <br>
              <b>Order Summary</b><br>${itemsList}
              <br><br><b>Total: ₹${body.total}</b>
              <br><br><b>Delivery address:</b> ${address}
              <br><br>If you have any questions, reply to this email or contact us.
              <br><br>— Kashmir Harvest Team
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
