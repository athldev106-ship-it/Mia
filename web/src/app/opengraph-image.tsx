import { ImageResponse } from 'next/og';

import { SITE } from '@/lib/site';

/**
 * The preview card shown when the site is shared — on WhatsApp, Instagram,
 * Google, or anywhere else that reads Open Graph. Without this, a shared
 * link renders as a bare URL, which reads as broken for a business whose
 * customers arrive through exactly those channels.
 *
 * Rendered at build time by next/og into a real PNG, so nothing here runs
 * for a visitor. Drawn in the logo's colourway: sage on forest.
 *
 * Deliberately not using the site's display font: next/og would need the
 * font file fetched and passed in, and a webfont failure here yields a
 * blank card rather than a fallback. System sans is the safe choice for
 * an image nobody can restyle after the fact.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${SITE.fullName} — ${SITE.tagline}`;

const FOREST = '#22301f';
const SAGE = '#9dba6e';
const PALE = '#e6eed7';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: FOREST,
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        {/* A soft sage bloom, echoing the site's own backdrop. */}
        <div
          style={{
            position: 'absolute',
            top: -260,
            right: -200,
            width: 780,
            height: 780,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(157,186,110,0.34), rgba(34,48,31,0))',
          }}
        />

        {/* The mark: three discs over a bowl, as in the logo. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <svg width="96" height="96" viewBox="0 0 32 32">
            <circle cx="9.5" cy="8" r="2.5" fill={SAGE} />
            <circle cx="16" cy="8" r="2.5" fill={SAGE} />
            <circle cx="22.5" cy="8" r="2.5" fill={SAGE} />
            <path d="M3.5 16.5h25v0.5A12.5 12.5 0 0 1 16 29.5 12.5 12.5 0 0 1 3.5 17Z" fill={SAGE} />
          </svg>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: SAGE,
            }}
          >
            {SITE.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 82,
              lineHeight: 1.05,
              color: PALE,
              fontWeight: 600,
            }}
          >
            {SITE.tagline}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 30,
              color: SAGE,
              maxWidth: 900,
            }}
          >
            Grain bowls, high-protein plates and proper coffee
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontSize: 24,
            color: 'rgba(230,238,215,0.72)',
            borderTop: '1px solid rgba(157,186,110,0.3)',
            paddingTop: 26,
          }}
        >
          <div style={{ display: 'flex' }}>{SITE.address.locality}, {SITE.address.city}</div>
          <div style={{ display: 'flex', color: 'rgba(157,186,110,0.55)' }}>·</div>
          {/* Drawn rather than typed: next/og resolves glyphs against a
              downloadable font, and "★" is outside the system set, so a
              text star fetches a font at build time and renders as tofu
              when that fetch fails. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.45 6.2 20.5l1.1-6.47-4.7-4.58 6.5-.95z"
                fill={SAGE}
              />
            </svg>
            <div style={{ display: 'flex' }}>{SITE.rating.value}</div>
          </div>
          <div style={{ display: 'flex', color: 'rgba(157,186,110,0.55)' }}>·</div>
          <div style={{ display: 'flex' }}>{SITE.hours.replace('Open daily, ', '')}</div>
        </div>
      </div>
    ),
    size,
  );
}
