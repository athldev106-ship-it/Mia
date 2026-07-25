'use client';

import { estimateTotals } from '@/lib/cart';
import { FREE_DELIVERY_ABOVE_PAISE } from '@/lib/pricing';
import { formatINR, type Fulfilment } from '@/lib/types';

/**
 * Subtotal, GST, delivery and total.
 *
 * Every figure here is an estimate computed in the browser from the menu we
 * served. /api/orders recalculates all of it from the database and that is
 * what Razorpay is asked for, so the note below is not boilerplate -- it is
 * the honest description of what the guest is looking at.
 */
export function PriceBreakdown({
  subtotalPaise,
  fulfilment,
  itemCount,
}: {
  subtotalPaise: number;
  fulfilment: Fulfilment;
  itemCount: number;
}) {
  const totals = estimateTotals(subtotalPaise, fulfilment);
  const shortOfFreeDelivery = FREE_DELIVERY_ABOVE_PAISE - subtotalPaise;

  return (
    <div className="rounded-2xl border border-[var(--hairline)] p-5 text-sm">
      <dl className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <dt className="opacity-70">
            Subtotal · {itemCount} item{itemCount === 1 ? '' : 's'}
          </dt>
          <dd className="tabular-nums">{formatINR(totals.subtotal_paise)}</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="opacity-70">GST (5%)</dt>
          <dd className="tabular-nums">{formatINR(totals.tax_paise)}</dd>
        </div>

        {fulfilment === 'delivery' && (
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Delivery</dt>
            <dd className="tabular-nums">
              {totals.delivery_fee_paise === 0 ? 'Free' : formatINR(totals.delivery_fee_paise)}
            </dd>
          </div>
        )}

        <div className="flex justify-between gap-4 border-t border-[var(--hairline)] pt-2 font-medium">
          <dt>Estimated total</dt>
          <dd className="tabular-nums">{formatINR(totals.total_paise)}</dd>
        </div>
      </dl>

      {fulfilment === 'delivery' && shortOfFreeDelivery > 0 && subtotalPaise > 0 && (
        <p className="mt-3 text-xs opacity-65">
          Add {formatINR(shortOfFreeDelivery)} more for free delivery.
        </p>
      )}

      <p className="mt-3 text-xs opacity-55">
        This is an estimate. We re-price your order from today&rsquo;s menu when you pay, and that
        confirmed amount is what you are charged.
      </p>
    </div>
  );
}
