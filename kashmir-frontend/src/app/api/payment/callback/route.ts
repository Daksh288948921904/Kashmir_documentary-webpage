import { NextResponse } from 'next/server';
import { verifyAirpayCallback, verifyRazorpayPayment } from '@/server/payments';
import { getServerSettings } from '@/server/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* POST /api/payment/callback
   - Airpay: form POST redirect from Airpay gateway
   - Razorpay: JSON from frontend with razorpay_payment_id, razorpay_order_id, razorpay_signature
*/
export async function POST(request: Request) {
  const s = getServerSettings();
  const contentType = request.headers.get('content-type') ?? '';

  let result;

  if (contentType.includes('application/json')) {
    // Razorpay verification — called by frontend JS after modal success
    const body = await request.json() as {
      razorpay_order_id:   string;
      razorpay_payment_id: string;
      razorpay_signature:  string;
    };
    result = await verifyRazorpayPayment(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
    );
    // Return JSON so frontend can store the token and redirect itself
    if (result.verified && result.access_token) {
      return NextResponse.json({ success: true, token: result.access_token });
    }
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  // Airpay — form POST redirect
  const formData = await request.formData();
  const data: Record<string, string> = {};
  formData.forEach((value, key) => { data[key] = String(value); });

  result = await verifyAirpayCallback(data);

  if (result.verified && result.access_token) {
    return NextResponse.redirect(
      `${s.frontendUrl}/?payment=success&token=${result.access_token}#watch`,
      { status: 303 },
    );
  }

  return NextResponse.redirect(
    `${s.frontendUrl}/?payment=failed#watch`,
    { status: 303 },
  );
}
