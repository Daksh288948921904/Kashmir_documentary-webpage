import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8000';

/* POST /api/auth/login — forwards to the FastAPI CMS backend untouched */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.arrayBuffer();
  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
  } catch {
    return NextResponse.json(
      { detail: 'CMS backend is not running. Start it on port 8000.' },
      { status: 502 },
    );
  }
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
