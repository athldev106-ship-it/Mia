import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/types';

/**
 * Service-role client. Bypasses RLS entirely, so it is only ever used from
 * route handlers that have already validated their input -- never from
 * anything that can reach the browser bundle.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
