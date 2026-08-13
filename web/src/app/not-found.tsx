import Link from 'next/link';

import { SITE } from '@/lib/site';

/**
 * Shown for any URL that does not exist. Without this, Next serves its own
 * unstyled 404, which on a business site reads as a broken deployment
 * rather than a mistyped address.
 *
 * The site's nav and footer are rendered by the (site) layout, which a
 * root-level not-found does not sit inside, so this page carries its own
 * way back rather than relying on chrome that is not there.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="glass glass-sheen w-full max-w-lg p-9 text-center sm:p-12">
        <p className="text-xs uppercase tracking-[0.28em] opacity-70">Page not found</p>

        <h1
          className="mt-5 text-4xl leading-tight sm:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          That page has left the pass
        </h1>

        <p className="mt-5 leading-relaxed opacity-75">
          The link may be out of date, or the address slightly off. The menu and everything else
          are still where you left them.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            Back to the cafe
          </Link>
          <Link
            href="/menu"
            className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm transition-colors hover:bg-[var(--hairline)]"
          >
            See the menu
          </Link>
        </div>

        <p className="mt-8 border-t border-[var(--hairline)] pt-6 text-sm opacity-70">
          Looking for us in person?{' '}
          <a href={`tel:${SITE.phone}`} className="underline underline-offset-4">
            {SITE.phoneDisplay}
          </a>
        </p>
      </div>
    </main>
  );
}
