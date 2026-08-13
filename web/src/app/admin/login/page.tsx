import type { Metadata } from 'next';

import { isConfigured } from '@/app/admin/_lib/session';
import { LoginForm } from '@/components/admin/LoginForm';
import { param, type SearchParams } from '@/lib/admin';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Staff sign in',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const ERROR_MESSAGES: Record<string, string> = {
  not_staff:
    'That account is signed in but is not on the staff list. Ask an administrator to add you, then try again.',
  not_configured:
    'This deployment has no Supabase credentials, so the dashboard cannot sign anyone in. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on the host.',
};

/**
 * Only same-origin dashboard paths are honoured, so a crafted ?next= can
 * never bounce a signed-in staff member off to another site.
 */
function safeNext(value: string): string {
  return /^\/admin(?:\/[^/\\]|$)/.test(value) && !value.startsWith('/admin/login')
    ? value
    : '/admin';
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const search = await searchParams;
  const notice = ERROR_MESSAGES[param(search, 'error')];
  const configured = isConfigured();

  return (
    // A <main> landmark, so the page is not one unlabelled region to
    // assistive tech. The dashboard proper gets one from its own layout.
    <main className="mx-auto max-w-md pt-8">
      <p className="text-xs uppercase tracking-[0.28em] opacity-70">{SITE.name}</p>
      <h1 className="mt-3 text-4xl leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
        Staff sign in
      </h1>
      <p className="mt-3 text-sm leading-relaxed opacity-70">
        For the cafe team. Reservations, enquiries and the menu live behind this door.
      </p>

      {notice && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-[var(--hairline)] bg-[color-mix(in_srgb,var(--alert)_12%,transparent)] px-4 py-3 text-sm leading-relaxed"
        >
          {notice}
        </p>
      )}

      <div className="mt-6">
        <LoginForm next={safeNext(param(search, 'next'))} configured={configured} />
      </div>
    </main>
  );
}
