import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8000';

type Params = Promise<{ path: string[] }>;

/* Transparent proxy — forwards all CMS API calls to FastAPI at port 8000 */
async function proxy(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  const { path } = await params;
  const targetUrl = `${BACKEND}/api/cms/${path.join('/')}${req.nextUrl.search}`;

  const fwdHeaders: HeadersInit = {};
  const ct = req.headers.get('content-type');
  if (ct) fwdHeaders['content-type'] = ct;
  const auth = req.headers.get('authorization');
  if (auth) fwdHeaders['authorization'] = auth;

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: fwdHeaders,
    body: body && body.byteLength > 0 ? body : undefined,
  });

  const resCt = upstream.headers.get('content-type') ?? '';
  if (resCt.includes('application/json')) {
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  }

  const bytes = await upstream.arrayBuffer();
  return new NextResponse(bytes, {
    status: upstream.status,
    headers: { 'content-type': resCt || 'application/octet-stream' },
  });
}

export const GET    = proxy;
export const POST   = proxy;
export const PUT    = proxy;
export const PATCH  = proxy;
export const DELETE = proxy;
