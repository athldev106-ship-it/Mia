import type { Metadata } from 'next';
import Script from 'next/script';

import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { getSiteContent } from '@/lib/data';
import { AGGREGATE } from '@/lib/reviews';
import { SITE } from '@/lib/site';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leankafe.example.com';
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  keywords: [
    'cafe Koramangala',
    'coffee shop Bengaluru',
    'best coffee Koramangala 5th Block',
    'bakery Bangalore',
    'work friendly cafe Bengaluru',
    'LeanKafe',
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
  alternates: { canonical: '/' },
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // One query per request, shared with every page below via cache().
  const site = await getSiteContent();

  /**
   * Structured data, so Google can surface hours, location and rating
   * directly in search and Maps. Built from the live settings so an
   * address or phone change in the dashboard reaches Google too.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: SITE.fullName,
    alternateName: SITE.name,
    description: SITE.description,
    url: siteUrl,
    telephone: site.phone,
    servesCuisine: ['Coffee', 'Bakery', 'Breakfast'],
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${SITE.address.line}, ${SITE.address.locality}`,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
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
      opens: '08:00',
      closes: '23:00',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: AGGREGATE.value,
      reviewCount: AGGREGATE.count,
    },
    sameAs: [site.instagramUrl, site.swiggyUrl, site.zomatoUrl],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Built from our own data, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--accent)] focus:px-5 focus:py-3 focus:text-[var(--accent-ink)]"
      >
        Skip to content
      </a>

      <Nav name={site.name} />
      <main id="main">{children}</main>
      <Footer site={site} />

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
    </>
  );
}
