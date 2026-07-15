import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getServerSettings } from '@/server/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RIG360_URL = 'https://screening.rig360media.com/api/partner/session';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  const s = getServerSettings();
  const token = auth.slice(7);

  // Verify the payment JWT
  let userRef = 'viewer';
  let email   = 'viewer@kashmirharvest.in';
  try {
    const key = new TextEncoder().encode(s.jwtSecret);
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    userRef = String(payload.sub ?? payload.order_id ?? 'viewer');
    email   = String(payload.email ?? 'viewer@kashmirharvest.in');
  } catch {
    return NextResponse.json({ detail: 'Invalid access token' }, { status: 401 });
  }

  if (!s.screeningPartnerKey) {
    return NextResponse.json({ detail: 'Screening not configured' }, { status: 503 });
  }

  const r = await fetch(RIG360_URL, {
    method: 'POST',
    headers: { 'X-Partner-Key': s.screeningPartnerKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userRef, email, ttl: 21600 }),
  });

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
