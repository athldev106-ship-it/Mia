import Image from 'next/image';

import { INTERIOR_PHOTOS } from '@/lib/media';

/**
 * A continuous horizontal pan across the room, standing in for a 360°
 * sweep.
 *
 * Real photographs are used as soon as INTERIOR_PHOTOS in lib/media.ts is
 * filled in; until then the tiles are CSS scenes, so this ships nothing
 * and cannot break on a slow connection. The track renders its tiles
 * twice either way -- the loop relies on the second copy to have no seam.
 */

const PLACEHOLDERS = [
  { label: 'The counter', from: '#16a34a', to: '#4ade80' },
  { label: 'Window seats', from: '#4ade80', to: '#dcfce7' },
  { label: 'The roastery wall', from: '#0f5132', to: '#16a34a' },
  { label: 'Communal table', from: '#c8a27a', to: '#dcfce7' },
  { label: 'Bakery case', from: '#15803d', to: '#4ade80' },
  { label: 'The courtyard', from: '#4ade80', to: '#16a34a' },
] as const;

const TILE = 'relative h-56 w-72 shrink-0 overflow-hidden rounded-2xl border border-[var(--hairline)] sm:h-64 sm:w-96';
const CAPTION = 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-8 text-sm text-white';

export function AmbienceStrip() {
  const photos = INTERIOR_PHOTOS;
  const count = photos.length > 0 ? photos.length : PLACEHOLDERS.length;

  return (
    <div
      className="relative overflow-hidden py-2"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <div className="pan-360 flex w-max gap-5">
        {[0, 1].map((run) => (
          <div key={run} className="flex gap-5" aria-hidden={run === 1}>
            {photos.length > 0
              ? photos.map((photo) => (
                  <figure key={photo.src} className={TILE}>
                    <Image
                      src={photo.src}
                      alt={run === 0 ? photo.alt : ''}
                      fill
                      // The tile is a fixed 288px, 384px from the sm breakpoint.
                      sizes="(min-width: 640px) 384px, 288px"
                      className="object-cover"
                    />
                    <figcaption className={CAPTION}>{photo.alt}</figcaption>
                  </figure>
                ))
              : PLACEHOLDERS.map((scene) => (
                  <figure key={scene.label} className={TILE}>
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(145deg, ${scene.from}, ${scene.to})` }}
                    />
                    <RoomSketch />
                    <figcaption className={CAPTION}>{scene.label}</figcaption>
                  </figure>
                ))}
          </div>
        ))}
      </div>

      {/* One pass should take about as long however many tiles there are. */}
      <style>{`.pan-360 { animation-duration: ${Math.max(30, count * 7)}s; }`}</style>
    </div>
  );
}

/** A loose line drawing of a cafe interior, so a tile is not a bare swatch. */
function RoomSketch() {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      aria-hidden
      className="absolute inset-0 h-full w-full opacity-30"
      preserveAspectRatio="xMidYMid slice"
    >
      <path d="M0 104h200" stroke="#fff" strokeWidth="1.2" />
      <rect x="18" y="70" width="52" height="34" rx="3" stroke="#fff" strokeWidth="1.2" />
      <path d="M24 70V56h40v14" stroke="#fff" strokeWidth="1.2" />
      <circle cx="120" cy="40" r="12" stroke="#fff" strokeWidth="1.2" />
      <path d="M120 52v10M108 62h24" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="150" y="78" width="34" height="26" rx="3" stroke="#fff" strokeWidth="1.2" />
      <path d="M96 104V86h28v18" stroke="#fff" strokeWidth="1.2" />
      <path
        d="M86 30c.8-1.6 0-2.6-.6-3.8M94 30c.8-1.6 0-2.6-.6-3.8"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
