import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* GET /api/products — public shop catalogue from Supabase */
export async function GET(): Promise<NextResponse> {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });
    if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
