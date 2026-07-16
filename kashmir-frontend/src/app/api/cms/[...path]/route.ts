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

/* ── Social posts (multi-platform) ───────────────────────────────────── */
async function social(req: NextRequest, path: string[]): Promise<NextResponse> {
  const db = getSupabaseAdmin();
  const segment = path[1];
  const action  = path[2];

  if (req.method === 'GET' && segment === 'config') {
    return NextResponse.json({
      instagram: !!(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID),
      facebook:  !!(process.env.FACEBOOK_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID),
      x: false,
    });
  }

  if (req.method === 'GET' && !segment) {
    const url = new URL(req.url);
    const ct     = url.searchParams.get('content_type');
    const status = url.searchParams.get('status');
    let q = db.from('social_posts').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (ct)     q = q.eq('content_type', ct);
    if (status) q = q.eq('overall_status', status);
    const { data, error, count } = await q;
    if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
    return NextResponse.json({ posts: data ?? [], total: count ?? 0 });
  }

  if (req.method === 'POST' && !segment) {
    const body = await req.json();
    const { data, error } = await db.from('social_posts').insert({
      content_type:   body.content_type,
      caption:        body.caption ?? null,
      media_url:      body.media_url ?? null,
      platforms:      body.platforms ?? [],
      publish_status: {},
      overall_status: 'draft',
    }).select().single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  }

  if (req.method === 'GET' && segment && !action) {
    const { data, error } = await db.from('social_posts').select('*').eq('id', segment).single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  if (req.method === 'PATCH' && segment && !action) {
    const body = await req.json();
    const { data, error } = await db.from('social_posts')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', segment).select().single();
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  if (req.method === 'DELETE' && segment && !action) {
    const { error } = await db.from('social_posts').delete().eq('id', segment);
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (req.method === 'POST' && segment && action === 'publish') {
    const { data: post, error: fetchErr } = await db.from('social_posts').select('*').eq('id', segment).single();
    if (fetchErr) return NextResponse.json({ detail: 'Post not found' }, { status: 404 });

    const publishStatus: Record<string, { status: string; id?: string; error?: string | null }> = {};
    const results = { published: [] as string[], failed: [] as string[], skipped: [] as string[] };

    for (const platform of (post.platforms as string[])) {
      if (platform === 'instagram') {
        const igToken     = process.env.INSTAGRAM_ACCESS_TOKEN;
        const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
        if (!igToken || !igAccountId || !post.media_url) {
          publishStatus.instagram = { status: 'skipped', error: igToken ? 'No media URL' : 'Not configured' };
          results.skipped.push('instagram'); continue;
        }
        try {
          const cRes = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: post.media_url, caption: post.caption ?? '', access_token: igToken }),
          });
          const container = await cRes.json();
          if (!container.id) throw new Error(container.error?.message ?? 'Container failed');
          const pRes = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media_publish`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creation_id: container.id, access_token: igToken }),
          });
          const pub = await pRes.json();
          if (!pub.id) throw new Error(pub.error?.message ?? 'Publish failed');
          publishStatus.instagram = { status: 'published', id: pub.id };
          results.published.push('instagram');
        } catch (e) {
          publishStatus.instagram = { status: 'failed', error: String(e) };
          results.failed.push('instagram');
        }
      }

      if (platform === 'facebook') {
        const fbToken  = process.env.FACEBOOK_ACCESS_TOKEN;
        const fbPageId = process.env.FACEBOOK_PAGE_ID;
        if (!fbToken || !fbPageId) {
          publishStatus.facebook = { status: 'skipped', error: 'Not configured' };
          results.skipped.push('facebook'); continue;
        }
        try {
          const endpoint = post.media_url
            ? `https://graph.facebook.com/v18.0/${fbPageId}/photos`
            : `https://graph.facebook.com/v18.0/${fbPageId}/feed`;
          const fbBody = post.media_url
            ? { url: post.media_url, caption: post.caption ?? '', access_token: fbToken }
            : { message: post.caption ?? '', access_token: fbToken };
          const fRes = await fetch(endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fbBody),
          });
          const fb = await fRes.json();
          if (!fb.id && !fb.post_id) throw new Error(fb.error?.message ?? 'Facebook publish failed');
          publishStatus.facebook = { status: 'published', id: String(fb.id ?? fb.post_id) };
          results.published.push('facebook');
        } catch (e) {
          publishStatus.facebook = { status: 'failed', error: String(e) };
          results.failed.push('facebook');
        }
      }
    }

    const overallStatus = results.failed.length > 0 && results.published.length === 0 ? 'failed'
      : results.failed.length > 0 || results.skipped.length > 0 ? 'partial'
      : results.published.length > 0 ? 'published'
      : 'draft';

    const { data: updated, error: updateErr } = await db.from('social_posts')
      .update({ publish_status: publishStatus, overall_status: overallStatus, updated_at: new Date().toISOString() })
      .eq('id', segment).select().single();
    if (updateErr) return NextResponse.json({ detail: updateErr.message }, { status: 500 });
    return NextResponse.json({ ...updated, results, publish_status: publishStatus });
  }

  return NextResponse.json({ detail: 'Not found' }, { status: 404 });
}

/* ── Router ───────────────────────────────────────────────────────────── */
async function handler(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  try {
    if (!(await authed(req))) return unauth();

    const { path } = await params;
    const resource = path[0];

    if (resource === 'products')  return products(req, path);
    if (resource === 'orders')    return orders(req, path);
    if (resource === 'upload')    return upload(req);
    if (resource === 'instagram') return instagram(req, path);
    if (resource === 'social')    return social(req, path);

    return NextResponse.json({ detail: `Unknown resource: ${resource}` }, { status: 404 });
  } catch (e) {
    console.error('[CMS API]', e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const PATCH  = handler;
export const DELETE = handler;
