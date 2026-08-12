'use client';

import { useEffect } from 'react';

/**
 * Catches anything thrown while rendering a public page, so a visitor sees
 * the cafe's own apology and a way onward rather than Next's default error
 * screen.
 *
 * A client component by requirement: React error boundaries only exist on
 * the client. The digest is React's hash of the server-side error; the
 * message itself is deliberately not shown, since it can name internals.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Reaches the platform's logs, where the digest ties back to the
    // server-side stack trace.
    console.error('[site] render failed', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="glass glass-sheen w-full max-w-lg p-9 text-center sm:p-12">
        <p className="text-xs uppercase tracking-[0.28em] opacity-55">Something went wrong</p>

        <h1
          className="mt-5 text-4xl leading-tight sm:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          We dropped that one
        </h1>

        <p className="mt-5 leading-relaxed opacity-75">
          Sorry — this page did not load properly. Trying again usually sorts it.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm transition-colors hover:bg-[var(--hairline)]"
          >
            Back to the cafe
          </a>
        </div>

        {error.digest && (
          <p className="mt-8 border-t border-[var(--hairline)] pt-6 font-mono text-xs opacity-50">
            Reference {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
