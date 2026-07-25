import type { Metadata } from 'next';
import Script from 'next/script';

import './globals.css';

import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { AGGREGATE } from '@/lib/reviews';
import { SITE } from '@/lib/site';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theverandah.example.com';
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} — All-day dining in ${SITE.address.locality}, Bengaluru`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'restaurant Koramangala',
    'buffet Bengaluru',
    'Sunday brunch Bangalore',
    'Grand Mercure Bengaluru',
    'all day dining Koramangala',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

/**
 * Restaurant structured data, so Google can surface hours, location and
 * rating directly in search and Maps.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: SITE.name,
  description: SITE.description,
  url: siteUrl,
  telephone: SITE.phone,
  servesCuisine: ['South Indian', 'Asian', 'Chinese', 'Continental'],
  priceRange: '₹₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${SITE.address.line}, ${SITE.address.locality}`,
    addressLocality: SITE.address.city,
    addressRegion: 'Karnataka',
    postalCode: SITE.address.pincode,
    addressCountry: 'IN',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: '06:30',
    closes: '23:00',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: AGGREGATE.value,
    reviewCount: AGGREGATE.count,
  },
  parentOrganization: { '@type': 'Hotel', name: SITE.parent },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        {/* Self-hosting would be better, but these two families are what the
            brief's editorial mood needs and Google Fonts is preconnected. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@400;500;600&display=swap"
        />
        {/* Marks the document as scripted before first paint, which is what
            switches the scroll reveals on. Content stays visible for anyone
            this script does not reach. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.setAttribute('data-js','');",
          }}
        />
        <script
          type="application/ld+json"
          // Generated from our own constants, never user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--accent)] focus:px-5 focus:py-3 focus:text-[var(--accent-ink)]"
        >
          Skip to content
        </a>

        <Nav />
        <main id="main">{children}</main>
        <Footer />

        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
                gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
