'use client';

import { useState } from 'react';

import { Field, Honeypot, controlClass } from '@/components/Field';
import { PhoneInput } from '@/components/PhoneInput';

type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'error'; message: string }
  | { state: 'done' };

const TYPES = [
  { value: 'general', label: 'General enquiry' },
  { value: 'catering', label: 'Catering' },
  { value: 'events', label: 'Private event or party' },
  { value: 'feedback', label: 'Feedback' },
] as const;

export function EnquiryForm() {
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: 'submitting' });

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/enquiries', {
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
      <div className="glass glass-sheen p-10 text-center">
        <h2 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Thank you
        </h2>
        <p className="mt-4 leading-relaxed opacity-80">
          Your message is with our team and we will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass glass-sheen relative space-y-5 p-7 sm:p-9">
      <Honeypot />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" required>
          <input id="name" name="name" className={controlClass} required />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <input id="email" name="email" type="email" className={controlClass} required />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Mobile" htmlFor="phone">
          <PhoneInput />
        </Field>
        <Field label="What is this about?" htmlFor="type" required>
          <select id="type" name="type" defaultValue="general" className={controlClass} required>
            {TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Message" htmlFor="message" required>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={controlClass}
          required
          minLength={10}
        />
      </Field>

      {status.state === 'error' && (
        <p role="alert" className="text-sm text-[var(--alert)]">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status.state === 'submitting'}
        className="w-full rounded-full bg-[var(--accent)] px-6 py-4 text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {status.state === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
