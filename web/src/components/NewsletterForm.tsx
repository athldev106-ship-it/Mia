'use client';

import { useState } from 'react';

import { Honeypot, controlClass } from '@/components/Field';

type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'error'; message: string }
  | { state: 'done' };

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: 'submitting' });

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus({ state: 'error', message: data.error ?? 'Something went wrong.' });
        return;
      }
      setStatus({ state: 'done' });
    } catch {
      setStatus({ state: 'error', message: 'Network error. Please try again.' });
    }
  }

  if (status.state === 'done') {
    return (
      <p role="status" className="text-sm leading-relaxed opacity-80">
        You are on the list. Your 10% code is on its way to your inbox — show it at the counter or
        quote it when you order.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Honeypot />
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={`${controlClass} flex-1`}
        />
        <button
          type="submit"
          disabled={status.state === 'submitting'}
          className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium whitespace-nowrap text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {status.state === 'submitting' ? 'Signing up…' : 'Get my 10%'}
        </button>
      </div>

      {status.state === 'error' && (
        <p role="alert" className="mt-3 text-sm text-[var(--alert)]">
          {status.message}
        </p>
      )}
    </form>
  );
}
