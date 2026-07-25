'use client';

import Link from 'next/link';

import { estimateTotals } from '@/lib/cart';
import { formatINR, type Fulfilment } from '@/lib/types';

/**
 * The small cart indicator that rides in the /order header: how many items
 * are in the cart and roughly what they come to. The count and total sit in
 * a live region so a screen reader hears the cart change without having to
 * go looking for it.
 */
export function CartBar({
  itemCount,
  subtotalPaise,
  fulfilment,
  hydrated,
}: {
  itemCount: number;
  subtotalPaise: number;
  fulfilment: Fulfilment;
  hydrated: boolean;
}) {
  const totals = estimateTotals(subtotalPaise, fulfilment);
  const empty = itemCount === 0;

  return (
    <div className="sticky top-24 z-30 mx-auto mb-10 max-w-6xl px-6">
      <div className="glass glass-sheen flex items-center gap-4 px-5 py-3">
        <span aria-hidden className="text-lg leading-none">
          🧺
        </span>

        <p role="status" className="min-w-0 flex-1 text-sm">
          {!hydrated ? (
            <span className="opacity-60">Your order</span>
          ) : empty ? (
            <span className="opacity-65">Your order is empty</span>
          ) : (
            <>
              <span className="font-medium">
                {itemCount} item{itemCount === 1 ? '' : 's'}
              </span>
              <span aria-hidden className="mx-2 opacity-40">
                ·
              </span>
              <span className="tabular-nums">{formatINR(totals.total_paise)}</span>
              <span className="ml-2 text-xs opacity-55">estimated</span>
            </>
          )}
        </p>

        {hydrated && !empty && (
          <Link
            href="/order/checkout"
            className="shrink-0 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--accent-ink)]"
          >
            Checkout
          </Link>
        )}
      </div>
    </div>
  );
}
