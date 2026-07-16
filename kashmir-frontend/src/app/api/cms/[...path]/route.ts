import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = Promise<{ path: string[] }>;

/* ── Auth ─────────────────────────────────────────────────────────────── */
function cmsSecret() {
  return new TextEncoder().encode(
    process.env.CMS_JWT_SECRET ?? process.env.JWT_SECRET ?? 'dev-cms-secret',
  );
}

async function authed(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return false;
  try {
    await jwtVerify(auth.slice(7), cmsSecret(), { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

const unauth = () => NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

/* ── Products ─────────────────────────────────────────────────────────── */
async function products(req: NextRequest, path: string[]): Promise<NextResponse> {
  const db = getSupabaseAdmin();
  const id = path[1];

  if (req.method === 'GET' && !id) {
    const { data, error } = await db.from('products').select('*').order('created_at', { ascending: true });
    if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (req.method === 'GET' && id) {
    const { data, error } = await db.from('products').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const { data, error } = await db.from('products').insert(body).select().single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  }

  if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
    const body = await req.json();
    const { data, error } = await db
      .from('products')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  if (req.method === 'DELETE' && id) {
    const { error } = await db.from('products').delete().eq('id', id);
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ detail: 'Not found' }, { status: 404 });
}

/* ── Orders ───────────────────────────────────────────────────────────── */
async function orders(req: NextRequest, path: string[]): Promise<NextResponse> {
  const db = getSupabaseAdmin();
  const id = path[1];

  if (req.method === 'GET' && !id) {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    let q = db.from('orders').select('*').order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (req.method === 'GET' && id) {
    const { data, error } = await db.from('orders').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
    const body = await req.json();
    const { data, error } = await db
      .from('orders')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ detail: 'Not found' }, { status: 404 });
}

/* ── Image upload ─────────────────────────────────────────────────────── */
async function upload(req: NextRequest): Promise<NextResponse> {
  const db = getSupabaseAdmin();
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ detail: 'No file uploaded' }, { status: 400 });

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await db.storage.from('product-images').upload(filename, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });

  const { data: { publicUrl } } = db.storage.from('product-images').getPublicUrl(filename);
  return NextResponse.json({ url: publicUrl });
}

/* ── Instagram posts ──────────────────────────────────────────────────── */
async function instagram(req: NextRequest, path: string[]): Promise<NextResponse> {
  const db = getSupabaseAdmin();
  const segment = path[1];
  const action  = path[2];

  if (req.method === 'GET' && segment === 'config') {
    const configured = !!(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID);
    return NextResponse.json({ configured });
  }

  if (req.method === 'GET' && !segment) {
    const url = new URL(req.url);
    const type   = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    let q = db.from('instagram_posts').select('*').order('created_at', { ascending: false });
    if (type)   q = q.eq('content_type', type);
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (req.method === 'POST' && !segment) {
    const body = await req.json();
    const { data, error } = await db.from('instagram_posts').insert(body).select().single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  }

  if (req.method === 'GET' && segment) {
    const { data, error } = await db.from('instagram_posts').select('*').eq('id', segment).single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  if (req.method === 'PATCH' && segment && !action) {
    const body = await req.json();
    const { data, error } = await db
      .from('instagram_posts')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', segment).select().single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  if (req.method === 'DELETE' && segment && !action) {
    const { error } = await db.from('instagram_posts').delete().eq('id', segment);
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (req.method === 'POST' && segment && action === 'publish') {
    const igToken     = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    if (!igToken || !igAccountId) {
      return NextResponse.json({ detail: 'Instagram API not configured' }, { status: 503 });
    }
    const { data: post, error: fetchErr } = await db
      .from('instagram_posts').select('*').eq('id', segment).single();
    if (fetchErr) return NextResponse.json({ detail: 'Post not found' }, { status: 404 });
    if (!post.media_url) return NextResponse.json({ detail: 'No media URL' }, { status: 400 });

    try {
      const cRes = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: post.media_url, caption: post.caption ?? '', access_token: igToken }),
      });
      const container = await cRes.json();
      if (!container.id) throw new Error(container.error?.message ?? 'Container failed');

      const pRes = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: container.id, access_token: igToken }),
      });
      const published = await pRes.json();
      if (!published.id) throw new Error(published.error?.message ?? 'Publish failed');

      const { data, error } = await db.from('instagram_posts').update({
        status: 'published', ig_media_id: published.id,
        published_at: new Date().toISOString(), ig_error: null,
        updated_at: new Date().toISOString(),
      }).eq('id', segment).select().single();
      if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
      return NextResponse.json(data);
    } catch (e) {
      await db.from('instagram_posts').update({
        status: 'failed', ig_error: String(e), updated_at: new Date().toISOString(),
      }).eq('id', segment);
      return NextResponse.json({ detail: String(e) }, { status: 502 });
    }
  }

  return NextResponse.json({ detail: 'Not found' }, { status: 404 });
}

/* ── Router ───────────────────────────────────────────────────────────── */
async function handler(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  if (!(await authed(req))) return unauth();

  const { path } = await params;
  const resource = path[0];

  if (resource === 'products')  return products(req, path);
  if (resource === 'orders')    return orders(req, path);
  if (resource === 'upload')    return upload(req);
  if (resource === 'instagram') return instagram(req, path);

  return NextResponse.json({ detail: `Unknown resource: ${resource}` }, { status: 404 });
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const PATCH  = handler;
export const DELETE = handler;
