'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary. This one catches failures in the root layout
 * itself, which means it replaces that layout entirely and must therefore
 * render its own <html> and <body>.
 *
 * Styles are inlined rather than pulled from globals.css: if the root
 * layout failed, the stylesheet is exactly the thing that may not have
 * loaded, and an unstyled apology on a white page is still better than a
 * stack trace. The small <style> block carries the dark-mode variant,
 * which inline style attributes cannot express.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[site] root layout failed', error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body style={{ margin: 0 }}>
        <style>{`
          .ge-wrap {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            padding: 24px; background: #fbfcf8; color: #1b241a;
            font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          }
          .ge-card { max-width: 30rem; text-align: center; }
          .ge-btn {
            display: inline-block; margin-top: 32px; padding: 12px 24px; border: 0;
            border-radius: 999px; background: #46601f; color: #fff;
            font-size: 14px; font-weight: 500; cursor: pointer;
          }
          @media (prefers-color-scheme: dark) {
            .ge-wrap { background: #161f14; color: #eef2e6; }
            .ge-btn { background: #9dba6e; color: #1a2416; }
          }
        `}</style>

        <div className="ge-wrap">
          <div className="ge-card">
            <h1 style={{ fontSize: 32, lineHeight: 1.2, margin: 0 }}>The LeanKafe</h1>
            <p style={{ marginTop: 16, opacity: 0.75, lineHeight: 1.6 }}>
              Something went badly wrong loading the site. Please try again in a moment.
            </p>
            <button type="button" onClick={reset} className="ge-btn">
              Try again
            </button>
            {error.digest && (
              <p style={{ marginTop: 28, fontSize: 12, opacity: 0.5 }}>
                Reference {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
