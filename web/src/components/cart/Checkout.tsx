'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useMemo, useState } from 'react';

import { useCart } from '@/components/cart/CartProvider';
import { FulfilmentToggle } from '@/components/cart/FulfilmentToggle';
import { PriceBreakdown } from '@/components/cart/PriceBreakdown';
import { Field, Honeypot, controlClass } from '@/components/Field';
import {
  resolveCart,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutValues,
} from '@/lib/cart';
import { SITE } from '@/lib/site';
import { formatINR, type Fulfilment, type MenuItem } from '@/lib/types';

/**
 * Razorpay Checkout, typed locally rather than by augmenting Window, so this
 * file carries its own contract with the script it loads.
 */
type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

function razorpayConstructor(): RazorpayConstructor | null {
  if (typeof window === 'undefined') return null;
  const ctor = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
  return typeof ctor === 'function' ? ctor : null;
}

type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'error'; message: string }
  | { state: 'done'; reference: string; fulfilment: Fulfilment }
  /** Paid, but we could not confirm it on screen. Never shown as a failure. */
  | { state: 'unconfirmed'; reference: string };

const EMPTY_VALUES: CheckoutValues = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  fulfilment: 'takeaway',
  address_line: '',
  address_landmark: '',
  address_pincode: '',
  notes: '',
};

const FIELDS: CheckoutField[] = [
  'customer_name',
  'customer_phone',
  'customer_email',
  'address_line',
  'address_landmark',
  'address_pincode',
  'notes',
];

/** Turns zod's flattened fieldErrors from /api/orders into per-field messages. */
function serverFieldErrors(issues: unknown): CheckoutErrors {
  if (typeof issues !== 'object' || issues === null) return {};
  const record = issues as Record<string, unknown>;
  const errors: CheckoutErrors = {};
  for (const field of FIELDS) {
    const messages = record[field];
    if (Array.isArray(messages) && typeof messages[0] === 'string') {
      errors[field] = messages[0];
    }
  }
  return errors;
}

export function Checkout({ items }: { items: MenuItem[] }) {
  const { lines, fulfilment, setFulfilment, hydrated, replace, clear } = useCart();
  const [values, setValues] = useState<CheckoutValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  const cart = useMemo(() => resolveCart(lines, items), [lines, items]);

  // Same reconciliation as the order page: a stale cart never reaches the
  // payment step carrying a dish we can no longer cook.
  useEffect(() => {
    if (!hydrated || cart.droppedCount === 0 || items.length === 0) return;
    replace(cart.lines);
  }, [hydrated, cart, items.length, replace]);

  function set<K extends CheckoutField>(field: K, value: CheckoutValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submission: CheckoutValues = { ...values, fulfilment };
    const found = validateCheckout(submission);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus({ state: 'idle' });
      return;
    }

    if (cart.entries.length === 0) {
      setStatus({ state: 'error', message: 'Your order is empty. Add a dish and try again.' });
      return;
    }

    setErrors({});
    setStatus({ state: 'submitting' });

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submission,
          // Ids and quantities only. The server prices the order from the
          // database, so nothing on this page can decide what is charged.
          items: cart.lines,
          company: form.get('company'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const fieldErrors = serverFieldErrors(data?.issues);
        if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);

        const unavailable: string[] = Array.isArray(data?.unavailable) ? data.unavailable : [];
        setStatus({
          state: 'error',
          message:
            unavailable.length > 0
              ? `${unavailable.join(', ')} just went off the menu. Please remove ${
                  unavailable.length === 1 ? 'it' : 'them'
                } and try again.`
              : (data?.error ?? 'Something went wrong.'),
        });
        return;
      }

      const Razorpay = razorpayConstructor();
      // A 200 with no Razorpay order means the request was discarded (the
      // honeypot) or the response was malformed. Either way there is nothing
      // to pay for, so never open an empty checkout.
      if (!Razorpay || !data?.razorpay_order_id) {
        setStatus({
          state: 'error',
          message: 'Payment could not start. Please check your connection and try again.',
        });
        return;
      }

      const checkout = new Razorpay({
        key: data.razorpay_key_id,
        order_id: data.razorpay_order_id,
        // Always the server's amount, never the estimate shown above.
        amount: data.amount,
        currency: data.currency,
        name: SITE.name,
        description: `Order ${data.order_number}`,
        prefill: {
          name: submission.customer_name,
          contact: submission.customer_phone,
          email: submission.customer_email,
        },
        theme: { color: '#a04a2a' },
        handler: async (result: Record<string, string>) => {
          try {
            const verify = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(result),
            });

            if (verify.ok) {
              setStatus({
                state: 'done',
                reference: data.order_number,
                fulfilment: submission.fulfilment,
              });
              // The only place the cart is cleared: a confirmed order.
              clear();
              return;
            }
          } catch {
            /* Falls through to the unconfirmed state below. */
          }

          // The payment webhook still settles this order, so the guest has
          // almost certainly paid. Telling them it failed would invite a
          // second payment -- show the reference and ask them to call.
          setStatus({ state: 'unconfirmed', reference: data.order_number });
        },
        modal: {
          ondismiss: () =>
            setStatus({
              state: 'error',
              message: 'Payment cancelled — you have not been charged. Your order is still here.',
            }),
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
          Order confirmed
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed opacity-80">
          Your order number is <strong>{status.reference}</strong>. We have started on it — please
          quote that number when you{' '}
          {status.fulfilment === 'delivery' ? 'speak to our rider' : 'collect'}.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href={`tel:${SITE.phone}`}
            className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm"
          >
            Call {SITE.phoneDisplay}
          </a>
          <Link
            href="/order"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)]"
          >
            Order something else
          </Link>
        </div>
      </div>
    );
  }

  if (status.state === 'unconfirmed') {
    return (
      <div className="glass glass-sheen p-10 text-center">
        <h2 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          We are checking your payment
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed opacity-80">
          Your order number is <strong>{status.reference}</strong>. We could not confirm the payment
          on screen, but if you were charged the order has reached us. Please call and we will
          confirm it for you — do not pay again.
        </p>
        <a
          href={`tel:${SITE.phone}`}
          className="mt-7 inline-block rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)]"
        >
          Call {SITE.phoneDisplay}
        </a>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="glass glass-sheen p-10 text-center">
        <p className="opacity-60">Loading your order…</p>
      </div>
    );
  }

  if (cart.entries.length === 0) {
    return (
      <div className="glass glass-sheen p-10 text-center">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
          Your order is empty
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed opacity-75">
          {items.length === 0
            ? 'Online ordering is not open just yet. Please call us and we will take your order over the phone.'
            : 'Add a dish or two from the menu and they will show up here, ready to pay for.'}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {items.length > 0 && (
            <Link
              href="/order"
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)]"
            >
              Browse the menu
            </Link>
          )}
          <a
            href={`tel:${SITE.phone}`}
            className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm"
          >
            Call {SITE.phoneDisplay}
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        <form onSubmit={handleSubmit} noValidate className="glass glass-sheen relative space-y-5 p-7 sm:p-9">
          <Honeypot />

          <FulfilmentToggle value={fulfilment} onChange={setFulfilment} />

          {fulfilment === 'delivery' && (
            <>
              <Field
                label="Delivery address"
                htmlFor="address_line"
                required
                error={errors.address_line}
              >
                <textarea
                  id="address_line"
                  rows={2}
                  required
                  aria-invalid={Boolean(errors.address_line)}
                  value={values.address_line}
                  onChange={(event) => set('address_line', event.target.value)}
                  placeholder="Flat, building, street"
                  className={controlClass}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Landmark" htmlFor="address_landmark" error={errors.address_landmark}>
                  <input
                    id="address_landmark"
                    value={values.address_landmark}
                    onChange={(event) => set('address_landmark', event.target.value)}
                    className={controlClass}
                  />
                </Field>
                <Field
                  label="Pincode"
                  htmlFor="address_pincode"
                  required
                  error={errors.address_pincode}
                  hint="6 digits"
                >
                  <input
                    id="address_pincode"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    aria-invalid={Boolean(errors.address_pincode)}
                    value={values.address_pincode}
                    onChange={(event) => set('address_pincode', event.target.value)}
                    placeholder={SITE.address.pincode}
                    className={controlClass}
                  />
                </Field>
              </div>
            </>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name" htmlFor="customer_name" required error={errors.customer_name}>
              <input
                id="customer_name"
                autoComplete="name"
                required
                aria-invalid={Boolean(errors.customer_name)}
                value={values.customer_name}
                onChange={(event) => set('customer_name', event.target.value)}
                className={controlClass}
              />
            </Field>
            <Field label="Mobile" htmlFor="customer_phone" required error={errors.customer_phone}>
              <input
                id="customer_phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                aria-invalid={Boolean(errors.customer_phone)}
                placeholder="9XXXXXXXXX"
                value={values.customer_phone}
                onChange={(event) => set('customer_phone', event.target.value)}
                className={controlClass}
              />
            </Field>
          </div>

          <Field
            label="Email"
            htmlFor="customer_email"
            hint="For your receipt."
            error={errors.customer_email}
          >
            <input
              id="customer_email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.customer_email)}
              value={values.customer_email}
              onChange={(event) => set('customer_email', event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field label="Anything we should know?" htmlFor="notes" error={errors.notes}>
            <textarea
              id="notes"
              rows={3}
              value={values.notes}
              onChange={(event) => set('notes', event.target.value)}
              placeholder="Allergies, less spice, no onion…"
              className={controlClass}
            />
          </Field>

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
            {status.state === 'submitting' ? 'Just a moment…' : 'Pay and place order'}
          </button>

          <p className="text-center text-xs opacity-55">
            Payment is handled by Razorpay. We never see your card details.
          </p>
        </form>

        <aside className="glass glass-sheen p-6 lg:sticky lg:top-28">
          <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
            Your order
          </h2>

          <ul className="mt-5 space-y-3 text-sm">
            {cart.entries.map((entry) => (
              <li key={entry.item.id} className="flex justify-between gap-3">
                <span className="opacity-80">
                  {entry.item.name}
                  <span className="opacity-60"> × {entry.quantity}</span>
                </span>
                <span className="shrink-0 tabular-nums">{formatINR(entry.lineTotalPaise)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <PriceBreakdown
              subtotalPaise={cart.subtotalPaise}
              fulfilment={fulfilment}
              itemCount={cart.itemCount}
            />
          </div>

          <Link
            href="/order"
            className="mt-5 inline-block text-sm underline underline-offset-4 opacity-70 transition-opacity hover:opacity-100"
          >
            Edit your order
          </Link>
        </aside>
      </div>
    </>
  );
}
