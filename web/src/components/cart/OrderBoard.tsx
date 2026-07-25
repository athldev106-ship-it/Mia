'use client';

import { useEffect, useMemo, useState } from 'react';

import { CartBar } from '@/components/cart/CartBar';
import { CartPanel } from '@/components/cart/CartPanel';
import { useCart } from '@/components/cart/CartProvider';
import { OrderMenu, type OrderableCategory } from '@/components/cart/OrderMenu';
import { resolveCart } from '@/lib/cart';

/**
 * The /order page proper: menu on the left, running cart on the right.
 *
 * This is also where a cart from an earlier visit meets today's menu. A dish
 * that has since been delisted or sold out is dropped and the guest is told,
 * rather than being left to discover it when the server rejects the order.
 */
export function OrderBoard({ categories }: { categories: OrderableCategory[] }) {
  const { lines, fulfilment, hydrated, replace } = useCart();
  const [droppedNotice, setDroppedNotice] = useState(0);

  const items = useMemo(() => categories.flatMap((category) => category.items), [categories]);
  const cart = useMemo(() => resolveCart(lines, items), [lines, items]);

  useEffect(() => {
    if (!hydrated || cart.droppedCount === 0) return;
    // Never reconcile against a menu that failed to load; that would clear a
    // perfectly good cart on a transient error.
    if (items.length === 0) return;
    setDroppedNotice(cart.droppedCount);
    replace(cart.lines);
  }, [hydrated, cart, items.length, replace]);

  return (
    <>
      <CartBar
        itemCount={cart.itemCount}
        subtotalPaise={cart.subtotalPaise}
        fulfilment={fulfilment}
        hydrated={hydrated}
      />

      <div className="mx-auto max-w-6xl px-6 pb-24">
        {droppedNotice > 0 && (
          <p
            role="status"
            className="mb-8 rounded-2xl border border-[var(--hairline)] p-4 text-sm opacity-80"
          >
            {droppedNotice} item{droppedNotice === 1 ? '' : 's'} from your last visit{' '}
            {droppedNotice === 1 ? 'is' : 'are'} no longer available today, so we have removed{' '}
            {droppedNotice === 1 ? 'it' : 'them'} from your order.
          </p>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
          <OrderMenu categories={categories} />

          <aside id="your-order" className="lg:sticky lg:top-44">
            <CartPanel cart={cart} hydrated={hydrated} />
          </aside>
        </div>
      </div>
    </>
  );
}
