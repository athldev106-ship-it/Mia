import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { AmbienceStrip } from '@/components/AmbienceStrip';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { getSiteContent } from '@/lib/data';
import { GALLERY_PHOTOS } from '@/lib/media';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Ambience & our story',
  description: `Inside ${SITE.name}, ${SITE.address.locality} — ethically sourced beans roasted locally, fast Wi-Fi, and a bright room built for staying a while.`,
};

const VALUES = [
  {
    title: 'Beans we can name',
    body: 'Single-estate lots from Chikmagalur and Coorg, bought through growers we have actually met and paid above the commodity rate. The bag on the shelf tells you the farm and the harvest.',
  },
  {
    title: 'Roasted down the road',
    body: 'Small batches, roasted locally every week rather than shipped in months ahead. Nothing is on the grinder more than fourteen days past its roast date.',
  },
  {
    title: 'A room for staying',
    body: 'Fast Wi-Fi, plug sockets at most tables, and no one hovering over your cup. Come for twenty minutes or the whole afternoon.',
  },
  {
    title: 'Baked each morning',
    body: 'Croissants laminated overnight, cakes and bakes out of the oven before we open. What does not sell goes to staff and neighbours, not into tomorrow.',
  },
] as const;

/** Placeholder tiles, used until GALLERY_PHOTOS in lib/media.ts is filled in. */
const GALLERY = [
  { label: 'The espresso bar', from: '#16a34a', to: '#4ade80' },
  { label: 'Window seating', from: '#dcfce7', to: '#4ade80' },
  { label: 'Bakery case', from: '#c8a27a', to: '#dcfce7' },
  { label: 'Communal table', from: '#15803d', to: '#16a34a' },
] as const;

/** The first tile leads at double width and height; the rest sit in one cell. */
const SPANS = ['sm:col-span-2 sm:row-span-2', '', '', 'sm:col-span-2'] as const;

function spanFor(index: number) {
  return SPANS[index] ?? '';
}

export default async function AmbiencePage() {
  const site = await getSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Ambience & story"
        title="A bright room and a short supply chain"
        intro="We are a small coffee house in Koramangala with a simple idea: buy good beans honestly, roast them close by, bake in the morning, and give people somewhere pleasant to sit."
      />

      {/* ---- The 360-style pan through the room ---- */}
      <section className="pb-20">
        <Reveal>
          <AmbienceStrip />
        </Reveal>
        <p className="mx-auto mt-4 max-w-6xl px-6 text-center text-xs opacity-55">
          A continuous pass through the room. Swap these tiles for the cafe&rsquo;s own 360°
          photography when it is shot.
        </p>
      </section>

      {/* ---- What we stand for ---- */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2
              className="max-w-lg text-3xl leading-tight sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              What we care about
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {VALUES.map((value, index) => (
              <Reveal key={value.title} delay={index * 80}>
                <article className="glass glass-sheen h-full p-7">
                  <h3 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {value.title}
                  </h3>
                  <p className="mt-3 leading-relaxed opacity-75">{value.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Gallery ---- */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2
              className="max-w-lg text-3xl leading-tight sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Around the cafe
            </h2>
          </Reveal>

          <div className="mt-10 grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-4">
            {GALLERY_PHOTOS.length > 0
              ? GALLERY_PHOTOS.map((photo, index) => (
                  <Reveal key={photo.src} delay={index * 70} className={spanFor(index)}>
                    <figure className="relative h-full overflow-hidden rounded-2xl border border-[var(--hairline)]">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-10 text-sm text-white">
                        {photo.alt}
                      </figcaption>
                    </figure>
                  </Reveal>
                ))
              : GALLERY.map((tile, index) => (
                  <Reveal key={tile.label} delay={index * 70} className={spanFor(index)}>
                    <figure className="relative h-full overflow-hidden rounded-2xl border border-[var(--hairline)]">
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(150deg, ${tile.from}, ${tile.to})` }}
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-10 text-sm text-white">
                        {tile.label}
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
          </div>

          {GALLERY_PHOTOS.length === 0 && (
            <p className="mt-4 text-xs opacity-55">
              Placeholders. Drop the cafe&rsquo;s photography into <code>public/media/</code> and
              list it in <code>src/lib/media.ts</code>.
            </p>
          )}
        </div>
      </section>

      {/* ---- Visit ---- */}
      <section className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="glass glass-sheen grid gap-8 p-8 sm:p-12 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] opacity-55">Come and sit</p>
                <h2
                  className="mt-4 text-3xl leading-tight sm:text-4xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {SITE.address.locality}
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
