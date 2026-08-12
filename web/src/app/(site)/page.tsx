import Link from 'next/link';

import { AmbienceStrip } from '@/components/AmbienceStrip';
import { Foliage } from '@/components/Foliage';
import { Hero } from '@/components/Hero';
import { OrderLinks } from '@/components/OrderLinks';
import { PillarIcon } from '@/components/PillarIcon';
import { Reveal } from '@/components/Reveal';
import { Reviews } from '@/components/Reviews';
import { getSiteContent } from '@/lib/data';
import { PILLARS } from '@/lib/site';

const HIGHLIGHTS = [
  {
    name: 'Grilled Chicken Bowl',
    note: 'Brown rice, greens, 42g protein',
    price: '₹320',
  },
  {
    name: 'Paneer Millet Bowl',
    note: 'Foxtail millet, tossed paneer, 28g protein',
    price: '₹290',
  },
  {
    name: 'Egg White Breakfast',
    note: 'Five whites, sourdough, avocado',
    price: '₹260',
  },
  {
    name: 'Cold Brew',
    note: 'Eighteen hours, no sugar',
    price: '₹190',
  },
] as const;

export default async function HomePage() {
  const site = await getSiteContent();

  return (
    <>
      <Hero site={site} />

      {/* ---- The three pillars from the logo ---- */}
      <section className="relative px-6 py-24">
        <Foliage className="opacity-40" />
        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] opacity-70">What lean means here</p>
            <h2
              className="mt-4 max-w-xl text-4xl leading-tight sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Food that does something for you
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar.key} delay={index * 90}>
                <article className="glass glass-sheen flex h-full flex-col p-7">
                  <PillarIcon name={pillar.key} />
                  <h3
                    className="mt-5 text-xl leading-snug"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="mt-3 leading-relaxed opacity-75">{pillar.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- From the kitchen ---- */}
      <section className="tinted relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] opacity-70">From the kitchen</p>
            <h2
              className="mt-4 max-w-lg text-4xl leading-tight sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              What people come back for
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((item, index) => (
              <Reveal key={item.name} delay={index * 80}>
                <div className="glass glass-sheen flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1">
                  <h3 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm opacity-65">{item.note}</p>
                  <p className="mt-4 text-sm font-medium tabular-nums text-[var(--accent)]">
                    {item.price}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                See the full menu
              </Link>
              <Link
                href="/order"
                className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm transition-colors hover:bg-[var(--hairline)]"
              >
                Order online
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- A pass through the room ---- */}
      <section className="py-8">
        <Reveal>
          <AmbienceStrip />
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-6xl px-6 text-center">
            <Link href="/ambience" className="text-sm underline underline-offset-4 opacity-75">
              More about the room and how we cook
            </Link>
          </p>
        </Reveal>
      </section>

      <Reviews />

      {/* ---- Order ---- */}
      <section className="tinted relative px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] opacity-70">Delivery & pickup</p>
            <h2
              className="mt-4 mb-10 max-w-lg text-4xl leading-tight sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Have it your way
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <OrderLinks site={site} />
          </Reveal>
        </div>
      </section>

      {/* ---- Visit ---- */}
      <section className="relative px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="glass glass-sheen grid gap-8 p-8 sm:p-12 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] opacity-70">Find us</p>
                <h2
                  className="mt-4 text-4xl leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Koramangala 5th Block
                </h2>
                <address className="mt-5 not-italic leading-relaxed opacity-80">
                  {site.address}
                </address>
                <p className="mt-4 opacity-75">{site.hours}</p>
              </div>

              <div className="flex flex-col justify-center gap-3">
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-center text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Get directions
                </a>
                <a
                  href={`tel:${site.phone}`}
                  className="rounded-full border border-[var(--hairline)] px-6 py-3 text-center text-sm transition-colors hover:bg-[var(--hairline)]"
                >
                  Call {site.phoneDisplay}
                </a>
                <Link
                  href="/reserve"
                  className="rounded-full border border-[var(--hairline)] px-6 py-3 text-center text-sm transition-colors hover:bg-[var(--hairline)]"
                >
                  Reserve a table
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
