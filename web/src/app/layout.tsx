import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

import './globals.css';

import { SITE } from '@/lib/site';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leankafe.example.com';

/**
 * Self-hosted at build time. Fetching these from Google's CDN at runtime
 * made the display face a render-blocking third-party request that simply
 * fails on restricted networks -- and when it does, the page silently falls
 * back to Georgia, which is not the typography anyone signed off.
 */
const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display-family',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans-family',
  display: 'swap',
});

/**
 * Document shell only. The public site's chrome (nav, footer, structured
 * data, analytics) lives in app/(site)/layout.tsx so the dashboard under
 * /admin does not inherit it.
 *
 * Metadata here is deliberately built from constants rather than from
 * site_settings: it is evaluated at build time, and making it dynamic would
 * force every page out of static rendering for a title that changes maybe
 * once a year. Rename the restaurant and lib/site.ts needs a deploy.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} — Coffee & bakery in ${SITE.address.locality}, Bengaluru`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  robots: { index: true, follow: true },
  /**
   * Declared explicitly rather than left to file-convention discovery, so
   * the SVG is offered first and /favicon.ico stays available for the
   * browsers and crawlers that request it by that path regardless.
   */
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* Marks the document as scripted before first paint, which is what
            switches the scroll reveals on. Content stays visible for anyone
            this script does not reach. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.setAttribute('data-js','');",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
