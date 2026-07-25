'use client';

import { useCart } from '@/components/cart/CartProvider';
import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { formatINR, type MenuItem } from '@/lib/types';

export type OrderableCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  items: MenuItem[];
};

function VegMark({ isVeg }: { isVeg: boolean }) {
  const label = isVeg ? 'Vegetarian' : 'Non-vegetarian';
  const colour = isVeg ? '#2f7d32' : '#a3271f';
  return (
    <span
      title={label}
      aria-label={label}
      role="img"
      className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border"
      style={{ borderColor: colour }}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: colour }} />
    </span>
  );
}

function OrderRow({ item }: { item: MenuItem }) {
  const { quantityOf, setQuantity, increment } = useCart();
  const quantity = quantityOf(item.id);

  return (
    <li
      className={`glass glass-sheen flex flex-wrap items-start gap-4 p-5 ${
        item.is_available ? '' : 'opacity-55'
      }`}
    >
      <div className="min-w-[12rem] flex-1">
        <div className="flex items-center gap-2">
          <VegMark isVeg={item.is_veg} />
          <h3 className="font-medium">{item.name}</h3>
          {!item.is_available && (
            <span className="rounded-full border border-[var(--hairline)] px-2 py-0.5 text-[11px] opacity-70">
              Unavailable today
            </span>
          )}
        </div>

        {item.description && (
          <p className="mt-1.5 text-sm leading-relaxed opacity-70">{item.description}</p>
        )}

        {item.tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-[var(--hairline)] px-2 py-0.5 text-[11px] opacity-65"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <p className="tabular-nums">{formatINR(item.price_paise)}</p>

        {/* Sold-out dishes have no add control at all: the server rejects
            them anyway, so offering the button would only waste a tap. */}
        {item.is_available &&
          (quantity === 0 ? (
            <button
              type="button"
              onClick={() => increment(item.id)}
              className="rounded-full border border-[var(--hairline)] px-5 py-2 text-sm transition-colors hover:bg-[var(--hairline)]"
            >
              Add<span className="sr-only"> {item.name} to your order</span>
            </button>
          ) : (
            <QuantityStepper
              label={item.name}
              quantity={quantity}
              onChange={(next) => setQuantity(item.id, next)}
            />
          ))}
      </div>
    </li>
  );
}

export function OrderMenu({ categories }: { categories: OrderableCategory[] }) {
  return (
    <div>
      <nav aria-label="Menu sections" className="glass glass-sheen mb-10 p-2">
        <ul className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <li key={category.id}>
              <a
                href={`#${category.slug}`}
                className="block rounded-full px-4 py-2 text-sm transition-colors hover:bg-[var(--hairline)]"
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-14">
        {categories.map((category) => (
          <section key={category.id} id={category.slug} className="scroll-mt-40">
            <h2 className="text-3xl sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
              {category.name}
            </h2>
            {category.description && (
              <p className="mt-2 max-w-lg text-sm opacity-65">{category.description}</p>
            )}

            <ul className="mt-6 space-y-3">
              {category.items.map((item) => (
                <OrderRow key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-12 text-xs opacity-55">
        All prices in ₹ and exclusive of applicable taxes. Please tell us about any allergies in the
        notes at checkout.
      </p>
    </div>
  );
}
