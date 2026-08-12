import type { MetadataRoute } from 'next';

import { NAV } from '@/lib/site';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leankafe.example.com';

/**
 * Served at /sitemap.xml.
 *
 * Built from NAV so a new page in the navigation reaches Google without
 * anyone remembering to edit a second list. Only the public site is
 * listed -- /admin is noindex and disallowed in robots.ts.
 *
 * changeFrequency and priority are hints Google largely ignores now, but
 * they cost nothing and other crawlers still read them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...NAV.map((item) => ({
      url: `${siteUrl}${item.href}`,
      lastModified: now,
      // The menu changes most often and is what people search for.
      changeFrequency: (item.href === '/menu' ? 'weekly' : 'monthly') as
        | 'weekly'
        | 'monthly',
      priority: item.href === '/menu' ? 0.9 : 0.7,
    })),
  ];
}
