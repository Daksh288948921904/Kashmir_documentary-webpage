import { NextResponse } from 'next/server';
import { createAirpayOrder, createRazorpayOrder } from '@/server/payments';
import { getServerSettings } from '@/server/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* POST /api/payment/create-order  body: { email, name, phone, address?, city?, state?, pin_code? } */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = {
      email:    body.email,
      name:     body.name,
      phone:    body.phone,
      address:  body.address,
      city:     body.city,
      state:    body.state,
      country:  body.country,
      pin_code: body.pin_code,
    };

    const { paymentGateway } = getServerSettings();
    const result = paymentGateway === 'razorpay'
      ? await createRazorpayOrder(input)
      : await createAirpayOrder(input);

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { detail: `Failed to create order: ${(e as Error).message}` },
      { status: 500 },
    );
  }
}
