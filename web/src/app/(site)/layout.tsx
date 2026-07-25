import type { Metadata } from 'next';
import Script from 'next/script';

import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { getSiteContent } from '@/lib/data';
import { AGGREGATE } from '@/lib/reviews';
import { SITE } from '@/lib/site';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theverandah.example.com';
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
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
  alternates: { canonical: '/' },
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // One query per request, shared with every page below via cache().
  const site = await getSiteContent();

  /**
   * Restaurant structured data, so Google can surface hours, location and
   * rating directly in search and Maps. Built from the live settings so an
   * address or phone change in the dashboard reaches Google too.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: site.name,
    description: SITE.description,
    url: siteUrl,
    telephone: site.phone,
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

      <Nav phone={site.phone} phoneDisplay={site.phoneDisplay} name={site.name} />
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
