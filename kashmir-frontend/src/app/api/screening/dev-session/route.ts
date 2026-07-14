import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  }
  const upstream = await fetch(`${BACKEND}/api/screening/dev-session`);
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
