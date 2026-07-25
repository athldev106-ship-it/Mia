import Link from 'next/link';

import { Foliage } from '@/components/Foliage';
import { AGGREGATE } from '@/lib/reviews';
import { SITE } from '@/lib/site';

/**
 * Opening frame of the walkthrough: sunlit verandah, glass panel floating
 * over foliage.
 *
 * The cinematic background is wired but not yet fed. Drop the generated
 * walkthrough at public/media/verandah-walkthrough.mp4 with a still at
 * public/media/verandah-poster.jpg and set HAS_WALKTHROUGH to true; until
 * then the CSS foliage scene stands in, so the page is never waiting on an
 * asset that does not exist.
 */
const HAS_WALKTHROUGH = false;

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden px-6 pt-28 pb-16">
      {HAS_WALKTHROUGH ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          // Autoplaying video is decorative here; it must never carry meaning.
          aria-hidden
          poster="/media/verandah-poster.jpg"
        >
          <source src="/media/verandah-walkthrough.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 75% 8%, color-mix(in srgb, var(--color-rattan) 34%, transparent), transparent 58%),' +
              'linear-gradient(158deg, color-mix(in srgb, var(--color-moss) 58%, transparent) 0%, color-mix(in srgb, var(--color-frond) 34%, transparent) 38%, transparent 62%),' +
              'linear-gradient(18deg, color-mix(in srgb, var(--color-wood) 40%, transparent), transparent 55%)',
          }}
        />
      )}

      <Foliage />

      {/* Keeps the headline legible whichever backdrop is behind it. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, var(--surface) 0%, color-mix(in srgb, var(--surface) 70%, transparent) 18%, transparent 45%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="glass glass-sheen max-w-2xl p-8 sm:p-12">
          <p className="text-xs uppercase tracking-[0.28em] opacity-60">
            All-day dining · {SITE.address.locality}
          </p>

          <h1
            className="mt-5 text-5xl leading-[1.05] tracking-tight sm:text-7xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {SITE.name}
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed opacity-80 sm:text-lg">
            A sunlit verandah under hanging ferns, a green-walled room within, and an open kitchen
            between them. {SITE.tagline}.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/buffet"
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Book the buffet
            </Link>
            <Link
              href="/reserve"
              className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm transition-colors hover:bg-[var(--hairline)]"
            >
              Reserve a table
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--hairline)] pt-6 text-sm">
            <span className="flex items-center gap-2">
              <span aria-hidden className="text-[var(--color-rattan)]">
                ★
              </span>
              <span className="font-medium">{AGGREGATE.value}</span>
              <span className="opacity-60">
                on {AGGREGATE.source} · {AGGREGATE.count} reviews
              </span>
            </span>
            <span className="opacity-60">{SITE.hours}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
