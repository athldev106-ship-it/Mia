'use client';

import { useState } from 'react';

import { Reveal } from '@/components/Reveal';
import { formatINR } from '@/lib/types';

import type { MenuCategoryWithItems, MenuItem } from '@/lib/types';

const ALL = 'all';

export function MenuBoard({ categories }: { categories: MenuCategoryWithItems[] }) {
  const [active, setActive] = useState<string>(ALL);

  const shown = active === ALL ? categories : categories.filter((c) => c.slug === active);

  return (
    <>
      <Reveal>
        <nav aria-label="Menu sections" className="glass glass-sheen mb-12 p-2">
          <ul className="flex flex-wrap gap-1">
            <FilterTab
              label="All"
              selected={active === ALL}
              onSelect={() => setActive(ALL)}
            />
            {categories.map((category) => (
              <FilterTab
                key={category.slug}
                label={category.name}
                selected={active === category.slug}
                onSelect={() => setActive(category.slug)}
              />
            ))}
          </ul>
        </nav>
      </Reveal>

      <div className="space-y-16">
        {shown.map((category, index) => (
          <Reveal key={category.id} delay={index * 60}>
            <section aria-labelledby={`heading-${category.slug}`} className="scroll-mt-28">
              <h2
                id={`heading-${category.slug}`}
                className="text-3xl sm:text-4xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {category.name}
              </h2>
              {category.description && (
                <p className="mt-2 max-w-lg text-sm opacity-70">{category.description}</p>
              )}

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {category.items.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
    </>
  );
}

function FilterTab({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`block rounded-full px-4 py-2 text-sm transition-colors ${
          selected
            ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
            : 'hover:bg-[var(--hairline)]'
        }`}
      >
        {label}
      </button>
    </li>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <li
      className={`glass glass-sheen flex gap-4 p-5 transition-transform duration-300 hover:-translate-y-0.5 ${
        item.is_available ? '' : 'opacity-55'
      }`}
    >
      <ItemThumb name={item.name} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <VegMark isVeg={item.is_veg} />
          <h3 className="font-medium">{item.name}</h3>
          {item.is_featured && (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--color-lime)_28%,transparent)] px-2 py-0.5 text-[11px] font-medium">
              Popular
            </span>
          )}
          {!item.is_available && (
            <span className="rounded-full border border-[var(--hairline)] px-2 py-0.5 text-[11px] opacity-70">
              Off today
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
                className="rounded-full border border-[var(--hairline)] px-2 py-0.5 text-[11px] opacity-70"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="shrink-0 font-medium tabular-nums">{formatINR(item.price_paise)}</p>
    </li>
  );
}

/**
 * Stands in for a dish photo until the cafe's own photography arrives.
 * The gradient is derived from the name so each item keeps the same
 * colour across renders instead of flickering between them.
 */
function ItemThumb({ name }: { name: string }) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  const hue = 100 + (hash % 60); // Held inside the green half of the wheel.

  return (
    <span
      aria-hidden
      className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-xl sm:flex"
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 55% 62%), hsl(${hue + 25} 70% 82%))`,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white/85">
        <path d="M4 10h12a3 3 0 0 1 0 6h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M4 10v5a4 4 0 0 0 4 4h3a4 4 0 0 0 4-4v-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function VegMark({ isVeg }: { isVeg: boolean }) {
  const label = isVeg ? 'Vegetarian' : 'Non-vegetarian';
  const colour = isVeg ? '#15803d' : '#a3271f';
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
