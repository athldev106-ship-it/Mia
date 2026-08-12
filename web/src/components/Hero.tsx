import Image from 'next/image';
import Link from 'next/link';

import { Foliage } from '@/components/Foliage';
import { OpenStatus } from '@/components/OpenStatus';
import { HERO_MEDIA } from '@/lib/media';
import { SITE } from '@/lib/site';

import type { SiteContent } from '@/lib/types';

export function Hero({ site }: { site: SiteContent }) {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden px-6 pt-28 pb-16">
      {/* The gradient wash stands in until real footage of the room exists. */}
      {HERO_MEDIA.video ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          // Decorative background; it must never carry meaning.
          aria-hidden
          poster={HERO_MEDIA.poster}
        >
          <source src={HERO_MEDIA.video} type="video/mp4" />
        </video>
      ) : HERO_MEDIA.image ? (
        <Image
          src={HERO_MEDIA.image}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 70% at 82% 2%, color-mix(in srgb, var(--color-sage) 85%, transparent), transparent 62%),' +
              'radial-gradient(70% 60% at 8% 92%, color-mix(in srgb, var(--color-olive) 38%, transparent), transparent 66%),' +
              'linear-gradient(152deg, color-mix(in srgb, var(--color-olive) 34%, transparent) 0%, color-mix(in srgb, var(--color-sage-pale) 92%, transparent) 44%, transparent 72%)',
          }}
        />
      )}

      {!HERO_MEDIA.image && !HERO_MEDIA.video && <Foliage />}

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
            Healthy kitchen &amp; coffee · {SITE.address.locality}
          </p>

          <h1
            className="mt-5 text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Great Food Crafted Daily
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed opacity-80 sm:text-lg">
            Grain bowls, high-protein plates and clean breakfasts, cooked to order and portioned
            honestly. Proper coffee alongside, and a bright room you are welcome to sit in.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <OpenStatus />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/menu"
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Explore Menu
            </Link>
            <Link
              href="/order"
              className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm transition-colors hover:bg-[var(--hairline)]"
            >
              Order Pickup
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--hairline)] pt-6 text-sm">
            <span className="flex items-center gap-2">
              <span aria-hidden className="text-[var(--color-olive)]">
                ★
              </span>
              <span className="font-medium">{SITE.rating.value}</span>
              <span className="opacity-65">on Google · {SITE.rating.count} reviews</span>
            </span>
            <span className="opacity-65">{SITE.priceRange}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
