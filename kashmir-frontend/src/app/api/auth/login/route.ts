import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { password } = await req.json();

  const cmsPassword = process.env.CMS_PASSWORD;
  if (!cmsPassword) {
    return NextResponse.json({ detail: 'CMS_PASSWORD not configured' }, { status: 503 });
  }

  if (password !== cmsPassword) {
    return NextResponse.json({ detail: 'Invalid password' }, { status: 401 });
  }

  const secret = process.env.CMS_JWT_SECRET ?? process.env.JWT_SECRET ?? 'dev-cms-secret';
  const key = new TextEncoder().encode(secret);

  const token = await new SignJWT({ role: 'cms' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(key);

  return NextResponse.json({ token });
}
