import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8000';

/* GET /api/products — public shop catalogue, forwarded to the FastAPI backend */
export async function GET(): Promise<NextResponse> {
  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND}/api/products`);
  } catch {
    return NextResponse.json(
      { detail: 'Shop backend is not running. Start it on port 8000.' },
      { status: 502 },
    );
  }
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
