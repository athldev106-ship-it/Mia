'use client';

import { useState } from 'react';

import { Reveal } from '@/components/Reveal';
import { BUILD_YOUR_OWN } from '@/lib/menu-fallback';
import { ALLERGENS, formatINR } from '@/lib/types';

import type { AllergenCode, MenuCategoryWithItems, MenuItem } from '@/lib/types';

const ALL = 'all';

const BRAND_LABEL = {
  kitchen: 'The LeanKafe · kitchen',
  coffee: 'The Coffee Society · bar',
} as const;

export function MenuBoard({ categories }: { categories: MenuCategoryWithItems[] }) {
  const [active, setActive] = useState<string>(ALL);

  const shown = active === ALL ? categories : categories.filter((c) => c.slug === active);
  // Build Your Own belongs with the kitchen, so it is shown with the whole
  // menu and when a kitchen chapter is filtered to on its own.
  const showBuild = active === ALL || active === 'build-your-own';

  return (
    <>
      <Reveal>
        <nav aria-label="Menu sections" className="glass glass-sheen mb-12 p-2">
          <ul className="flex flex-wrap gap-1">
            <FilterTab label="All" selected={active === ALL} onSelect={() => setActive(ALL)} />
            {categories.map((category) => (
              <FilterTab
                key={category.slug}
                label={category.name}
                selected={active === category.slug}
                onSelect={() => setActive(category.slug)}
              />
            ))}
            <FilterTab
              label="Build Your Own"
              selected={active === 'build-your-own'}
              onSelect={() => setActive('build-your-own')}
            />
          </ul>
        </nav>
      </Reveal>

      <div className="space-y-16">
        {shown.map((category, index) => {
          // The bar's first chapter gets a rule and a byline, so the two
          // halves of the business read as separately as they do in print.
          const startsBrand = index === 0 || shown[index - 1].brand !== category.brand;

          return (
            <div key={category.id}>
              {startsBrand && (
                <Reveal>
                  <p className="mb-8 border-t border-[var(--hairline)] pt-6 text-xs uppercase tracking-[0.28em] opacity-70">
                    {BRAND_LABEL[category.brand]}
                  </p>
                </Reveal>
              )}

              <Reveal delay={index * 50}>
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
            </div>
          );
        })}

        {showBuild && <BuildYourOwn />}
      </div>

      <AllergenKey />
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
          selected ? 'bg-[var(--accent)] text-[var(--accent-ink)]' : 'hover:bg-[var(--hairline)]'
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
        item.is_available ? '' : 'opacity-70'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <VegMark isVeg={item.is_veg} />
          <h3 className="font-medium">{item.name}</h3>
          {item.is_featured && (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--color-sage)_40%,transparent)] px-2 py-0.5 text-[11px] font-medium">
              Popular
            </span>
          )}
          {!item.is_available && (
            <span className="rounded-full border border-[var(--hairline)] px-2 py-0.5 text-[11px] opacity-70">
              Off today
            </span>
          )}
          <AllergenCodes codes={item.allergens} />
        </div>

        {item.description && (
          <p className="mt-1.5 text-sm leading-relaxed opacity-70">{item.description}</p>
        )}
      </div>

      <Price item={item} />
    </li>
  );
}

/**
 * One price, or the card's "veg / non-veg" pair. The pair is spelled out
 * for a screen reader, which would otherwise hear two numbers and a slash
 * with nothing to say which is which.
 */
function Price({ item }: { item: MenuItem }) {
  if (item.price_nonveg_paise === null) {
    return <p className="shrink-0 font-medium tabular-nums">{formatINR(item.price_paise)}</p>;
  }

  return (
    <p className="shrink-0 text-right font-medium tabular-nums">
      <span className="sr-only">
        {formatINR(item.price_paise)} vegetarian, {formatINR(item.price_nonveg_paise)}{' '}
        non-vegetarian
      </span>
      <span aria-hidden>
        {formatINR(item.price_paise)}
        <span className="mx-1 opacity-40">/</span>
        {formatINR(item.price_nonveg_paise)}
      </span>
    </p>
  );
}

/** The card's short codes, with the full word available on hover and to AT. */
function AllergenCodes({ codes }: { codes: AllergenCode[] }) {
  if (codes.length === 0) return null;
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {codes.map((code) => (
        <abbr
          key={code}
          title={ALLERGENS[code]}
          className="rounded border border-[var(--hairline)] px-1.5 py-0.5 text-[10px] tracking-wider no-underline opacity-70"
        >
          {code}
        </abbr>
      ))}
    </span>
  );
}

function AllergenKey() {
  return (
    <Reveal>
      <div className="glass glass-sheen mt-14 p-6">
        <h2 className="text-xs uppercase tracking-[0.28em] opacity-70">Allergens</h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {(Object.entries(ALLERGENS) as [AllergenCode, string][]).map(([code, name]) => (
            <li key={code} className="flex items-center gap-2">
              <span className="rounded border border-[var(--hairline)] px-1.5 py-0.5 text-[10px] tracking-wider opacity-70">
                {code}
              </span>
              <span className="opacity-80">{name}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed opacity-70">
          Please tell your server about any allergy before ordering — our kitchen handles all
          listed allergens.
        </p>
      </div>
    </Reveal>
  );
}

/** Chapter Nine: a four-step configurator rather than a list of dishes. */
function BuildYourOwn() {
  return (
    <Reveal>
      <section
        aria-labelledby="heading-build-your-own"
        className="scroll-mt-28 rounded-[var(--radius-glass)] p-8 sm:p-10"
        style={{ background: 'var(--color-forest)', color: '#eef1ea' }}
      >
        <h2
          id="heading-build-your-own"
          className="text-3xl sm:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {BUILD_YOUR_OWN.title}
        </h2>
        <p className="mt-2 max-w-lg text-sm opacity-75">{BUILD_YOUR_OWN.intro}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {BUILD_YOUR_OWN.bases.map((base) => (
            <div
              key={base.label}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 px-5 py-4"
            >
              <span className="flex items-center gap-2">
                <VegMark isVeg={base.is_veg} onDark />
                <span>{base.label}</span>
              </span>
              <span className="font-medium tabular-nums">{formatINR(base.price_paise)}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-2 text-sm opacity-75">
          {BUILD_YOUR_OWN.included.text}
          <AllergenCodes codes={[...BUILD_YOUR_OWN.included.allergens]} />
        </p>

        <div className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {BUILD_YOUR_OWN.steps.map((step) => (
            <div key={step.numeral} className="border-t border-white/15 pt-5">
              <p className="flex items-baseline gap-3">
                <span className="text-lg opacity-45" style={{ fontFamily: 'var(--font-display)' }}>
                  {step.numeral}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] opacity-70">{step.title}</span>
              </p>
              <ul className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 leading-relaxed">
                {step.choices.map((choice, i) => (
                  <li key={choice.name} className="flex items-center gap-1.5">
                    <span>{choice.name}</span>
                    {choice.allergens && <AllergenCodes codes={[...choice.allergens]} />}
                    {i < step.choices.length - 1 && (
                      <span aria-hidden className="opacity-35">
                        ·
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {'note' in step && step.note && (
                <p className="mt-2 text-sm opacity-60">{step.note}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

function VegMark({ isVeg, onDark = false }: { isVeg: boolean; onDark?: boolean }) {
  const label = isVeg ? 'Vegetarian' : 'Non-vegetarian';
  const colour = isVeg ? (onDark ? '#7dbf85' : '#15803d') : onDark ? '#e07b6f' : '#a3271f';
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
