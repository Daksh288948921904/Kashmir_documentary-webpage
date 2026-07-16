// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use `any` database type — no generated schema in this project.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAdmin(): SupabaseClient<any> {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _client = createClient<any>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _client;
}
