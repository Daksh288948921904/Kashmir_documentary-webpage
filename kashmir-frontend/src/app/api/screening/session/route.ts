import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  const upstream = await fetch(`${BACKEND}/api/screening/session`, {
    headers: { authorization: auth },
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
