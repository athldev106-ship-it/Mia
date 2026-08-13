import type { ReactNode } from 'react';

import { signOut } from '@/app/admin/actions';
import { requireStaffPage } from '@/app/admin/_lib/session';
import { AdminNav } from '@/components/admin/AdminNav';
import { SubmitButton } from '@/components/admin/SubmitButton';

// Every screen reads live data through the visitor's own session, so none
// of this can be prerendered or cached.
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, email } = await requireStaffPage();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="glass glass-sheen mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 p-3">
        <div className="mr-auto pl-1">
          <p className="text-[11px] uppercase tracking-[0.2em] opacity-70">Staff dashboard</p>
          <p className="text-sm">
            {profile.full_name ?? email}
            <span className="ml-2 opacity-70">{profile.role}</span>
          </p>
        </div>
        <AdminNav />
        <form action={signOut}>
          <SubmitButton variant="ghost" pendingLabel="Signing out…">
            Sign out
          </SubmitButton>
        </form>
      </header>

      <main>{children}</main>
    </div>
  );
}
