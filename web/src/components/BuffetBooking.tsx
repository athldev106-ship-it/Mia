'use client';

import Script from 'next/script';
import { useMemo, useState } from 'react';

import { Field, Honeypot, controlClass } from '@/components/Field';
import { formatTime } from '@/lib/format';
import { formatINR, type BuffetSession } from '@/lib/types';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'error'; message: string }
  | { state: 'done'; reference: string };

/** Today in IST, as yyyy-mm-dd, so the date picker cannot offer yesterday. */
function todayIST() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export function BuffetBooking({ sessions }: { sessions: BuffetSession[] }) {
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? '');
  const [date, setDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  const session = useMemo(
    () => sessions.find((item) => item.id === sessionId),
    [sessions, sessionId],
  );

  // Shown as a guide only. The server always re-prices from the database,
  // so a wrong estimate here can never become a wrong charge.
  const estimate = useMemo(() => {
    if (!session) return null;
    const childPrice = session.child_price_paise ?? session.price_paise;
    const subtotal = adults * session.price_paise + children * childPrice;
    return { subtotal, tax: Math.round(subtotal * 0.05), total: subtotal + Math.round(subtotal * 0.05) };
  }, [session, adults, children]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: 'submitting' });

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/buffet-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          booking_date: date,
          adults,
          children,
          customer_name: form.get('customer_name'),
          customer_phone: form.get('customer_phone'),
          customer_email: form.get('customer_email'),
          notes: form.get('notes'),
          company: form.get('company'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({ state: 'error', message: data.error ?? 'Something went wrong.' });
        return;
      }

      if (!window.Razorpay) {
        setStatus({
          state: 'error',
          message: 'Payment could not start. Please check your connection and try again.',
        });
        return;
      }

      const checkout = new window.Razorpay({
        key: data.razorpay_key_id,
        order_id: data.razorpay_order_id,
        amount: data.amount,
        currency: data.currency,
        name: 'The Verandah',
        description: session?.name ?? 'Buffet booking',
        prefill: {
          name: form.get('customer_name'),
          contact: form.get('customer_phone'),
          email: form.get('customer_email'),
        },
        theme: { color: '#a04a2a' },
        handler: async (result: Record<string, string>) => {
          const verify = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result),
          });

          if (verify.ok) {
            setStatus({ state: 'done', reference: data.booking_number });
          } else {
            // The webhook still settles this, so never tell the guest the
            // payment failed -- point them at us instead.
            setStatus({
              state: 'error',
              message: `We could not confirm the payment on screen. If you were charged, your booking is ${data.booking_number} — please call us and we will confirm it.`,
            });
          }
        },
        modal: {
          ondismiss: () =>
            setStatus({ state: 'error', message: 'Payment cancelled. Your table was not booked.' }),
        },
      });

      checkout.open();
    } catch {
      setStatus({ state: 'error', message: 'Network error. Please try again.' });
    }
  }

  if (status.state === 'done') {
    return (
      <div className="glass glass-sheen p-10 text-center">
        <h2 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Your table is booked
        </h2>
        <p className="mt-4 leading-relaxed opacity-80">
          Booking reference <strong>{status.reference}</strong>. We have emailed your confirmation —
          show the reference when you arrive.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <form onSubmit={handleSubmit} className="glass glass-sheen relative space-y-5 p-7 sm:p-9">
        <Honeypot />

        <Field label="Which sitting" htmlFor="session" required>
          <select
            id="session"
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            className={controlClass}
            required
          >
            {sessions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {formatTime(item.start_time)}–{formatTime(item.end_time)} ·{' '}
                {formatINR(item.price_paise)}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Date"
          htmlFor="date"
          required
          hint={
            session?.day_of_week
              ? 'This sitting runs on Sundays only.'
              : undefined
          }
        >
          <input
            id="date"
            type="date"
            value={date}
            min={todayIST()}
            onChange={(event) => setDate(event.target.value)}
            className={controlClass}
            required
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Adults" htmlFor="adults" required>
            <input
              id="adults"
              type="number"
              min={1}
              max={40}
              value={adults}
              onChange={(event) => setAdults(Number(event.target.value))}
              className={controlClass}
              required
            />
          </Field>
          <Field label="Children" htmlFor="children">
            <input
              id="children"
              type="number"
              min={0}
              max={40}
              value={children}
              onChange={(event) => setChildren(Number(event.target.value))}
              className={controlClass}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" htmlFor="customer_name" required>
            <input id="customer_name" name="customer_name" className={controlClass} required />
          </Field>
          <Field label="Mobile" htmlFor="customer_phone" required>
            <input
              id="customer_phone"
              name="customer_phone"
              type="tel"
              inputMode="tel"
              placeholder="9XXXXXXXXX"
              className={controlClass}
              required
            />
          </Field>
        </div>

        <Field label="Email" htmlFor="customer_email" hint="For your confirmation.">
          <input
            id="customer_email"
            name="customer_email"
            type="email"
            className={controlClass}
          />
        </Field>

        <Field label="Anything we should know?" htmlFor="notes">
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Allergies, a birthday, seating preference…"
            className={controlClass}
          />
        </Field>

        {estimate && (
          <dl className="space-y-1.5 rounded-2xl border border-[var(--hairline)] p-5 text-sm">
            <div className="flex justify-between">
              <dt className="opacity-70">
                {adults} adult{adults === 1 ? '' : 's'}
                {children > 0 && `, ${children} child${children === 1 ? '' : 'ren'}`}
              </dt>
              <dd className="tabular-nums">{formatINR(estimate.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="opacity-70">GST (5%)</dt>
              <dd className="tabular-nums">{formatINR(estimate.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--hairline)] pt-2 font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatINR(estimate.total)}</dd>
            </div>
          </dl>
        )}

        {status.state === 'error' && (
          <p role="alert" className="text-sm text-[var(--accent)]">
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={status.state === 'submitting'}
          className="w-full rounded-full bg-[var(--accent)] px-6 py-4 text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {status.state === 'submitting' ? 'Just a moment…' : 'Pay and confirm booking'}
        </button>

        <p className="text-center text-xs opacity-55">
          Payment is handled by Razorpay. We never see your card details.
        </p>
      </form>
    </>
  );
}
