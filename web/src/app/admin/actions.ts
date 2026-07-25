'use server';

import { redirect } from 'next/navigation';

import { isConfigured } from '@/app/admin/_lib/session';
import { createClient } from '@/lib/supabase/server';

/**
 * Clears the Supabase session cookies. Runs as a Server Action so the
 * cookie store is writable -- signing out from a Server Component would
 * silently do nothing.
 */
export async function signOut(): Promise<void> {
  if (isConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect('/admin/login');
}
