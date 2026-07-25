'use client';

import Link from 'next/link';

import { useCart } from '@/components/cart/CartProvider';
import { FulfilmentToggle } from '@/components/cart/FulfilmentToggle';
import { PriceBreakdown } from '@/components/cart/PriceBreakdown';
import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { formatINR } from '@/lib/types';

import type { ResolvedCart } from '@/lib/cart';

/** The running summary beside the menu: what is in the cart and what it costs. */
export function CartPanel({ cart, hydrated }: { cart: ResolvedCart; hydrated: boolean }) {
  const { fulfilment, setFulfilment, setQuantity } = useCart();

  return (
    <div className="glass glass-sheen p-6">
      <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
        Your order
      </h2>

      {!hydrated ? (
        <p className="mt-4 text-sm opacity-60">Loading your order…</p>
      ) : cart.entries.length === 0 ? (
        <p className="mt-4 text-sm leading-relaxed opacity-70">
          Nothing here yet. Add a dish from the menu and it will appear, ready to pay for.
        </p>
      ) : (
        <>
          <ul className="mt-5 space-y-4">
            {cart.entries.map((entry) => (
              <li key={entry.item.id} className="border-b border-[var(--hairline)] pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-medium">{entry.item.name}</p>
                  <p className="shrink-0 text-sm tabular-nums">{formatINR(entry.lineTotalPaise)}</p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <QuantityStepper
                    label={entry.item.name}
                    quantity={entry.quantity}
                    onChange={(next) => setQuantity(entry.item.id, next)}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(entry.item.id, 0)}
                    className="text-xs underline underline-offset-4 opacity-65 transition-opacity hover:opacity-100"
                  >
                    Remove<span className="sr-only"> {entry.item.name} from your order</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-5">
            <FulfilmentToggle value={fulfilment} onChange={setFulfilment} />

            <PriceBreakdown
              subtotalPaise={cart.subtotalPaise}
              fulfilment={fulfilment}
              itemCount={cart.itemCount}
            />

            <Link
              href="/order/checkout"
              className="block rounded-full bg-[var(--accent)] px-6 py-4 text-center text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
