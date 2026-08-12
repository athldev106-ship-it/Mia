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
  description: `Inside ${SITE.name}, ${SITE.address.locality} — a healthy kitchen with weighed portions and honest macros, proper coffee, fast Wi-Fi and a bright room built for staying a while.`,
};

const VALUES = [
  {
    title: 'Weighed, not guessed',
    body: 'Every bowl is built to a spec on a scale, so the protein number on the menu is the number on your plate. Ask us for the full breakdown on anything and we will give it to you.',
  },
  {
    title: 'Cooked to order',
    body: 'Nothing sits in a warmer waiting for you. Proteins go on the grill when the ticket lands, greens are dressed at the last moment, and the bowl reaches you the way it left the pass.',
  },
  {
    title: 'Bought fresh, daily',
    body: 'Produce comes in each morning and is prepped the same day. We would rather run out of something at nine than serve you yesterday.',
  },
  {
    title: 'A room for staying',
    body: 'Fast Wi-Fi, plug sockets at most tables, and no one hovering over your cup. Come for twenty minutes or the whole afternoon.',
  },
] as const;

/** Placeholder tiles, used until GALLERY_PHOTOS in lib/media.ts is filled in. */
const GALLERY = [
  { label: 'The open kitchen', from: '#46601f', to: '#9dba6e' },
  { label: 'Window seating', from: '#e6eed7', to: '#9dba6e' },
  { label: 'The cold counter', from: '#c8a97c', to: '#e6eed7' },
  { label: 'Communal table', from: '#22301f', to: '#5d7a34' },
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
        title="Eating well should not be a compromise"
        intro="We are a small kitchen in Koramangala with a simple idea: cook food that is genuinely good for you, make it taste like something you would choose anyway, and be straight about what is in it."
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
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-3 pt-10 text-sm text-white">
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
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-3 pt-10 text-sm text-white">
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
