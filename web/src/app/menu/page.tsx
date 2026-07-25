import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { getMenu } from '@/lib/data';
import { SITE } from '@/lib/site';
import { formatINR } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Menu',
  description: `The full menu at ${SITE.name}, ${SITE.address.locality} — South Indian, Asian, Chinese and Western plates, served all day.`,
};

// The menu changes from the dashboard, so re-read it periodically rather
// than baking it into the build.
export const revalidate = 300;

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

export default async function MenuPage() {
  const menu = await getMenu();
  const withItems = menu.filter((category) => category.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="All day, every day"
        title="The menu"
        intro="Breakfast from 6:30, lunch, and dinner until 11. South Indian and Asian plates alongside Western comfort food, much of it from the open kitchen."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          {withItems.length === 0 ? (
            <Reveal>
              <div className="glass glass-sheen p-10 text-center">
                <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Our menu is being updated
                </h2>
                <p className="mx-auto mt-4 max-w-md leading-relaxed opacity-75">
                  We are putting the full list of dishes and prices online. In the meantime, please
                  call us and we will talk you through what is on today.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <a
                    href={`tel:${SITE.phone}`}
                    className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)]"
                  >
                    Call {SITE.phoneDisplay}
                  </a>
                  <Link
                    href="/buffet"
                    className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm"
                  >
                    See buffet & brunch
                  </Link>
                </div>
              </div>
            </Reveal>
          ) : (
            <>
              <Reveal>
                <nav aria-label="Menu sections" className="glass glass-sheen mb-12 p-2">
                  <ul className="flex flex-wrap gap-1">
                    {withItems.map((category) => (
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
              </Reveal>

              <div className="space-y-16">
                {withItems.map((category, index) => (
                  <Reveal key={category.id} delay={index * 60}>
                    <section id={category.slug} className="scroll-mt-28">
                      <h2
                        className="text-3xl sm:text-4xl"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="mt-2 max-w-lg text-sm opacity-65">{category.description}</p>
                      )}

                      <ul className="mt-7 space-y-3">
                        {category.items.map((item) => (
                          <li
                            key={item.id}
                            className={`glass glass-sheen flex gap-4 p-5 ${
                              item.is_available ? '' : 'opacity-55'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
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
                                <p className="mt-1.5 text-sm leading-relaxed opacity-70">
                                  {item.description}
                                </p>
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
                            <p className="shrink-0 tabular-nums">{formatINR(item.price_paise)}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </Reveal>
                ))}
              </div>

              <Reveal>
                <p className="mt-14 text-center text-xs opacity-55">
                  All prices in ₹ and exclusive of applicable taxes. Please tell your server about
                  any allergies.
                </p>
              </Reveal>
            </>
          )}
        </div>
      </section>
    </>
  );
}
