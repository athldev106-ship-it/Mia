'use client';

import { useEffect, useRef, useState } from 'react';

import { SITE } from '@/lib/site';

/**
 * An embedded map of the cafe, from OpenStreetMap.
 *
 * OSM rather than Google Maps: the Google embed needs a billed API key,
 * and this has to work on a deploy with no environment variables at all.
 * It is also far lighter and sets no advertising cookies.
 *
 * The iframe is guarded. A blocked or slow embed otherwise leaves the
 * browser's own error page sitting in the panel -- a grey box with a torn
 * document on it -- which looks like a broken site rather than a map that
 * did not load. If it has not reported itself loaded within a few seconds,
 * the panel falls back to the address and the directions link, which is
 * what someone actually needs from this card anyway.
 *
 * The "Open in Google Maps" link is always present, iframe or not: an
 * embedded map is awkward with a keyboard or a screen reader, and that
 * link is what opens turn-by-turn navigation on a phone.
 */

/** A tight box around Guava Garden, KHB Colony, Koramangala 5th Block. */
const BBOX = '77.6180,12.9310,77.6280,12.9385';
const MARKER = '12.9348,77.6230';
const GIVE_UP_AFTER_MS = 5000;

export function LocationMap() {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const settled = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!settled.current) setState('failed');
    }, GIVE_UP_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  const src =
    `https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}` +
    `&layer=mapnik&marker=${MARKER}`;

  return (
    <figure className="glass glass-sheen overflow-hidden p-0">
      {state !== 'failed' ? (
        <iframe
          src={src}
          title={`Map showing ${SITE.fullName}, ${SITE.address.locality}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => {
            settled.current = true;
            setState('ready');
          }}
          className="block h-[320px] w-full border-0"
        />
      ) : (
        <div
          className="flex h-[320px] w-full items-center justify-center px-6 text-center"
          style={{
            background:
              'radial-gradient(70% 70% at 50% 40%, color-mix(in srgb, var(--color-sage) 26%, transparent), transparent 72%),' +
              'color-mix(in srgb, var(--color-sage-pale) 50%, transparent)',
          }}
        >
          <p className="max-w-xs text-sm leading-relaxed opacity-75">
            We are on the corner of Guava Garden, in KHB Colony. Tap through for directions.
          </p>
        </div>
      )}

      <figcaption className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
        <span className="opacity-75">
          {SITE.address.line}, {SITE.address.locality}
        </span>
        <a
          href={SITE.mapsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="underline underline-offset-4"
        >
          Open in Google Maps
        </a>
      </figcaption>
    </figure>
  );
}
