'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { adminButtonClass, adminControlClass } from '@/components/admin/Panel';
import { Field } from '@/components/Field';
import { createClient } from '@/lib/supabase/client';

type Status = { state: 'idle' } | { state: 'working' } | { state: 'error'; message: string };

export function LoginForm({ next, configured }: { next: string; configured: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: 'working' });

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        setStatus({
          state: 'error',
          message: 'That email and password did not match. Please try again.',
        });
        return;
      }

      // Signing in is not the same as being staff. A profiles row is what
      // grants access, and RLS lets a user read their own row -- so a miss
      // here is a real "not staff" rather than a permissions artefact.
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.auth.signOut();
        setStatus({
          state: 'error',
          message:
            'This account is not set up for staff access. Ask an administrator to add you.',
        });
        return;
      }

      // refresh() re-runs the middleware and the dashboard's server render
      // against the cookies that were just written.
      router.replace(next);
      router.refresh();
    } catch {
      setStatus({ state: 'error', message: 'Could not reach the server. Please try again.' });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass glass-sheen space-y-5 p-7 sm:p-8">
      <Field label="Email" htmlFor="email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          className={adminControlClass}
          disabled={!configured}
          required
        />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className={adminControlClass}
          disabled={!configured}
          required
        />
      </Field>

      {status.state === 'error' && (
        <p role="alert" className="text-sm text-[var(--alert)]">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={!configured || status.state === 'working'}
        className={`${adminButtonClass} w-full py-3`}
      >
        {status.state === 'working' ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
