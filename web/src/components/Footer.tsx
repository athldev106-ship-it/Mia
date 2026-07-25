import Link from 'next/link';

import { NAV, SITE, fullAddress } from '@/lib/site';

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-[var(--hairline)] px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <p className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
            {SITE.name}
          </p>
          <p className="mt-1 text-sm opacity-70">at {SITE.parent}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-70">{SITE.tagline}</p>
        </div>

        <div className="text-sm">
          <h2 className="mb-3 text-xs uppercase tracking-[0.18em] opacity-50">Visit</h2>
          <address className="not-italic leading-relaxed opacity-80">{fullAddress}</address>
          <p className="mt-3 opacity-80">{SITE.hours}</p>
          <a href={`tel:${SITE.phone}`} className="mt-3 inline-block underline underline-offset-4">
            {SITE.phoneDisplay}
          </a>
          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 block underline underline-offset-4"
          >
            Get directions
          </a>
        </div>

        <div className="text-sm">
          <h2 className="mb-3 text-xs uppercase tracking-[0.18em] opacity-50">Explore</h2>
          <ul className="space-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="opacity-80 hover:opacity-100">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-[var(--hairline)] pt-6 text-xs opacity-50">
        <p>
          © {new Date().getFullYear()} {SITE.name}, {SITE.parent}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
