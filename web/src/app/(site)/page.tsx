import Link from 'next/link';

import { AmbienceStrip } from '@/components/AmbienceStrip';
import { Foliage } from '@/components/Foliage';
import { Hero } from '@/components/Hero';
import { OrderLinks } from '@/components/OrderLinks';
import { Reveal } from '@/components/Reveal';
import { Reviews } from '@/components/Reviews';
import { getSiteContent } from '@/lib/data';

const HIGHLIGHTS = [
  {
    name: 'Filter & Pour-Over',
    note: 'Single-estate Chikmagalur, bloomed slow',
    price: '₹180',
  },
  {
    name: 'Cardamom Latte',
    note: 'Double shot, steamed milk, green cardamom',
    price: '₹250',
  },
  {
    name: 'Overnight Cold Brew',
    note: 'Eighteen hours, served over a big cube',
    price: '₹220',
  },
  {
    name: 'Butter Croissant',
    note: 'Laminated overnight, baked at six',
    price: '₹160',
  },
] as const;

const PROMISES = [
  {
    eyebrow: 'Sourcing',
    title: 'Beans bought honestly, from growers we know',
    body: 'Single-estate lots from Chikmagalur and Coorg, paid for above the commodity rate. Every bag on the shelf names the farm and the harvest it came from.',
  },
  {
    eyebrow: 'Roasting',
    title: 'Small batches, roasted close to home',
    body: 'We roast weekly rather than shipping in months ahead, and nothing stays on the grinder more than fourteen days past its roast date. It is the difference you taste first.',
  },
  {
    eyebrow: 'The room',
    title: 'Fast Wi-Fi, real plug sockets, no hovering',
    body: 'Come for twenty minutes or the whole afternoon. There are sockets at most tables, the Wi-Fi holds up to a video call, and nobody will clear your cup to move you along.',
  },
] as const;

export default async function HomePage() {
  const site = await getSiteContent();

  return (
    <>
      <Hero site={site} />

      {/* ---- What we stand for ---- */}
      <section className="relative px-6 py-24">
        <Foliage className="opacity-40" />
        <div className="relative mx-auto max-w-6xl space-y-6">
          {PROMISES.map((promise, index) => (
            <Reveal key={promise.title} delay={index * 80}>
              <article
                className={`glass glass-sheen max-w-2xl p-8 sm:p-10 ${
                  index % 2 === 1 ? 'ml-auto' : ''
                }`}
              >
                <p className="text-xs uppercase tracking-[0.28em] opacity-55">{promise.eyebrow}</p>
                <h2
                  className="mt-4 text-3xl leading-tight sm:text-4xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {promise.title}
                </h2>
                <p className="mt-4 leading-relaxed opacity-80">{promise.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- From the bar ---- */}
      <section className="tinted relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] opacity-55">From the bar</p>
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
              More about the room and where our beans come from
            </Link>
          </p>
        </Reveal>
      </section>

      <Reviews />

      {/* ---- Order ---- */}
      <section className="tinted relative px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] opacity-55">Delivery & pickup</p>
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
                <p className="text-xs uppercase tracking-[0.28em] opacity-55">Find us</p>
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
