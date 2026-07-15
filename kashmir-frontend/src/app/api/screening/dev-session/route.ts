import { NextResponse } from 'next/server';
import { getServerSettings } from '@/server/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RIG360_URL = 'https://screening.rig360media.com/api/partner/session';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  }

  const s = getServerSettings();
  if (!s.screeningPartnerKey) {
    return NextResponse.json({ detail: 'SCREENING_PARTNER_KEY not set' }, { status: 503 });
  }

  const r = await fetch(RIG360_URL, {
    method: 'POST',
    headers: { 'X-Partner-Key': s.screeningPartnerKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userRef: 'dev-preview', email: 'dev@kashmirharvest.in', ttl: 3600 }),
  });

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
