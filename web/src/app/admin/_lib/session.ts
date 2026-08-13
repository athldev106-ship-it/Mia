import 'server-only';

import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';
import type { Database, Profile } from '@/lib/types';

/** The request-scoped client, named once so the dashboard can refer to it. */
export type DashboardClient = SupabaseClient<Database>;

async function client(): Promise<DashboardClient> {
  return createClient();
}

export type StaffSession = {
  supabase: DashboardClient;
  userId: string;
  email: string;
  profile: Profile;
};

/** The dashboard is useless without credentials, and must say so plainly. */
export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Distinguishes "nobody is signed in" from "signed in but not staff". */
type LoadResult = StaffSession | 'anonymous' | 'not_staff';

async function load(): Promise<LoadResult> {
  const supabase = await client();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 'anonymous';

  // Membership in `profiles` is what makes a signed-in user staff. RLS lets
  // a user read only their own row, so a missing row genuinely means "not
  // staff" rather than "not visible".
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return 'not_staff';

  return { supabase, userId: user.id, email: user.email ?? '', profile };
}

/**
 * For pages and layouts: bounce to the login screen with a reason rather
 * than rendering an error. Mirrors what middleware.ts already does, so a
 * direct render (or a session that expired mid-visit) behaves the same.
 */
export async function requireStaffPage(): Promise<StaffSession> {
  if (!isConfigured()) redirect('/admin/login?error=not_configured');

  const session = await load();
  if (session === 'anonymous') redirect('/admin/login');
  if (session === 'not_staff') redirect('/admin/login?error=not_staff');
  return session;
}

/**
 * For Server Actions. Every mutation goes through the *user's own* session,
 * never the service-role client, so RLS is what actually enforces staff-only
 * writes -- this check exists to produce a readable message instead of a
 * silent zero-row update.
 */
export async function requireStaffAction(): Promise<StaffSession> {
  if (!isConfigured()) throw new Error('This deployment has no database credentials.');

  const session = await load();
  if (session === 'anonymous') throw new Error('Your session has expired. Sign in again.');
  if (session === 'not_staff') throw new Error('This account is not on the staff list.');
  return session;
}
