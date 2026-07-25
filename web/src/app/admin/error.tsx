'use client';

import { useEffect } from 'react';

import { adminButtonClass, adminGhostButtonClass } from '@/components/admin/Panel';

/**
 * Server Actions here throw rather than return on a database refusal, which
 * is what we want -- an RLS rejection is not a form validation message. This
 * catches those so the pass sees a readable page instead of a blank screen.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin]', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg pt-8">
      <div className="glass glass-sheen p-8">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          That did not go through
        </h1>
        <p className="mt-4 text-sm leading-relaxed opacity-75">
          {error.message || 'Something went wrong while talking to the database.'}
        </p>
        <p className="mt-2 text-xs opacity-50">
          If this keeps happening, check that your account is still on the staff list.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className={adminButtonClass}>
            Try again
          </button>
          <a href="/admin" className={adminGhostButtonClass}>
            Back to the dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
