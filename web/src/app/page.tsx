import Link from 'next/link';

import { Foliage } from '@/components/Foliage';
import { Hero } from '@/components/Hero';
import { Reveal } from '@/components/Reveal';
import { Reviews } from '@/components/Reviews';
import { SITE, fullAddress } from '@/lib/site';

/**
 * The homepage follows the walkthrough: verandah, then the glide indoors,
 * then the open kitchen, then a seat at the table.
 */

const SCENES = [
  {
    eyebrow: 'The verandah',
    title: 'Under the ferns, in the open air',
    body: 'Hanging ferns and areca palms, wooden tables under white linen, ceiling fans turning slowly. Sunlight comes through the leaves in patches and moves across the floor all afternoon.',
  },
  {
    eyebrow: 'Indoors',
    title: 'Through the doors, into the green',
    body: 'A living wall of moss and fern, warm terracotta underfoot, rattan pendants glowing low. Cooler and quieter than the verandah, and a few steps away from it.',
  },
  {
    eyebrow: 'The open kitchen',
    title: 'Watch it come together',
    body: 'Our chefs work in full view: egg ghee roast on the plancha, Burmese noodles tossed to order, a veg lasagna coming out of the oven. Steam, herbs, and the sound of a kitchen mid-service.',
  },
] as const;

const DISHES = [
  { name: 'Egg Ghee Roast', note: 'South Indian · from the live counter' },
  { name: 'Burmese Khow Suey', note: 'Asian · tossed to order' },
  { name: 'Veg Lasagna', note: 'Western · from the oven' },
  { name: 'Sunday Brunch', note: 'Live grills, crab and prawn, cocktails' },
] as const;

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* ---- The three scenes, told as a slow scroll ---- */}
      <section className="relative px-6 py-24">
        <Foliage className="opacity-40" />
        <div className="relative mx-auto max-w-6xl space-y-6">
          {SCENES.map((scene, i) => (
            <Reveal key={scene.title} delay={i * 80}>
              <article
                className={`glass glass-sheen max-w-2xl p-8 sm:p-10 ${
                  i % 2 === 1 ? 'ml-auto' : ''
                }`}
              >
                <p className="text-xs uppercase tracking-[0.28em] opacity-50">{scene.eyebrow}</p>
                <h2
                  className="mt-4 text-3xl leading-tight sm:text-4xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {scene.title}
                </h2>
                <p className="mt-4 leading-relaxed opacity-80">{scene.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- What's cooking ---- */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] opacity-50">From the pass</p>
            <h2
              className="mt-4 max-w-lg text-4xl leading-tight sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              South Indian, Asian and Western, on one menu
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DISHES.map((dish, i) => (
              <Reveal key={dish.name} delay={i * 80}>
                <div className="glass glass-sheen flex h-full flex-col p-6">
                  <h3 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {dish.name}
                  </h3>
                  <p className="mt-2 text-sm opacity-60">{dish.note}</p>
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
                href="/buffet"
                className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm transition-colors hover:bg-[var(--hairline)]"
              >
                Buffet & brunch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Reviews />

      {/* ---- Visit ---- */}
      <section className="relative px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="glass glass-sheen grid gap-8 p-8 sm:p-12 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] opacity-50">Find us</p>
                <h2
                  className="mt-4 text-4xl leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Koramangala 3rd Block
                </h2>
                <address className="mt-5 not-italic leading-relaxed opacity-80">
                  {fullAddress}
                </address>
                <p className="mt-4 opacity-80">{SITE.hours}</p>
              </div>

              <div className="flex flex-col justify-center gap-3">
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-center text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Get directions
                </a>
                <a
                  href={`tel:${SITE.phone}`}
                  className="rounded-full border border-[var(--hairline)] px-6 py-3 text-center text-sm transition-colors hover:bg-[var(--hairline)]"
                >
                  Call {SITE.phoneDisplay}
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
