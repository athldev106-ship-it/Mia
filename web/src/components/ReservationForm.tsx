'use client';

import { useState } from 'react';

import { Field, Honeypot, controlClass } from '@/components/Field';

type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'error'; message: string }
  | { state: 'done' };

function todayIST() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export function ReservationForm() {
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: 'submitting' });

    const form = new FormData(event.currentTarget);
    const date = String(form.get('date'));
    const time = String(form.get('time'));

    // IST is fixed at +05:30 and observes no daylight saving, so composing
    // the offset by hand is safe and avoids shipping a timezone library.
    const reservedAt = `${date}T${time}:00+05:30`;

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          phone: form.get('phone'),
          email: form.get('email'),
          party_size: form.get('party_size'),
          reserved_at: reservedAt,
          occasion: form.get('occasion'),
          notes: form.get('notes'),
          company: form.get('company'),
        }),
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
          Request received
        </h2>
        <p className="mt-4 leading-relaxed opacity-80">
          Our team will call you shortly to confirm your table. If you gave us an email, a copy is
          already on its way.
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
        <Field label="Mobile" htmlFor="phone" required>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="9XXXXXXXXX"
            className={controlClass}
            required
          />
        </Field>
      </div>

      <Field label="Email" htmlFor="email" hint="Optional, for a written confirmation.">
        <input id="email" name="email" type="email" className={controlClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Date" htmlFor="date" required>
          <input
            id="date"
            name="date"
            type="date"
            min={todayIST()}
            className={controlClass}
            required
          />
        </Field>
        <Field label="Time" htmlFor="time" required>
          <input id="time" name="time" type="time" className={controlClass} required />
        </Field>
        <Field label="Guests" htmlFor="party_size" required>
          <input
            id="party_size"
            name="party_size"
            type="number"
            min={1}
            max={40}
            defaultValue={2}
            className={controlClass}
            required
          />
        </Field>
      </div>

      <Field label="Occasion" htmlFor="occasion" hint="Birthday, anniversary, a business lunch…">
        <input id="occasion" name="occasion" className={controlClass} />
      </Field>

      <Field label="Anything we should know?" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Allergies, seating preference, a high chair…"
          className={controlClass}
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
        {status.state === 'submitting' ? 'Sending…' : 'Request a table'}
      </button>

      <p className="text-center text-xs opacity-70">
        A reservation is confirmed once our team calls you back.
      </p>
    </form>
  );
}
