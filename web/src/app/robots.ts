import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leankafe.example.com';

/**
 * Served at /robots.txt.
 *
 * The staff dashboard is already noindex via metadata, but that only helps
 * once a crawler has fetched the page. Disallowing it here keeps them off
 * the login entirely, and off the API routes, which have nothing a search
 * result can use.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
