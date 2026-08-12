import Link from 'next/link';

import { NewsletterForm } from '@/components/NewsletterForm';
import { NAV, SITE } from '@/lib/site';

import type { SiteContent } from '@/lib/types';

const SOCIALS = [
  { key: 'instagram', label: 'Instagram', href: (site: SiteContent) => site.instagramUrl },
  { key: 'whatsapp', label: 'WhatsApp', href: (site: SiteContent) => site.whatsappUrl },
  { key: 'swiggy', label: 'Swiggy', href: (site: SiteContent) => site.swiggyUrl },
  { key: 'zomato', label: 'Zomato', href: (site: SiteContent) => site.zomatoUrl },
] as const;

export function Footer({ site }: { site: SiteContent }) {
  return (
    <footer className="relative mt-32 border-t border-[var(--hairline)] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="glass glass-sheen mb-14 grid gap-8 p-8 sm:p-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Get 10% off your first order
            </h2>
            <p className="mt-3 text-sm leading-relaxed opacity-75">
              One email a month: new bowls on the menu, what is good this season, and the occasional
              thing worth knowing about eating well. No more than that.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
              {site.name}
            </p>
            <p className="mt-1 text-sm opacity-70">{SITE.fullName}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-70">{site.tagline}</p>
          </div>

          <div className="text-sm">
            <h3 className="mb-3 text-xs uppercase tracking-[0.18em] opacity-55">Visit</h3>
            <address className="not-italic leading-relaxed opacity-80">{site.address}</address>
            <p className="mt-3 opacity-80">{site.hours}</p>
            <a href={`tel:${site.phone}`} className="mt-3 inline-block underline underline-offset-4">
              {site.phoneDisplay}
            </a>
            {site.email && (
              <a href={`mailto:${site.email}`} className="mt-2 block underline underline-offset-4">
                {site.email}
              </a>
            )}
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 block underline underline-offset-4"
            >
              Get directions
            </a>
          </div>

          <div className="text-sm">
            <h3 className="mb-3 text-xs uppercase tracking-[0.18em] opacity-55">Explore</h3>
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

          <div className="text-sm">
            <h3 className="mb-3 text-xs uppercase tracking-[0.18em] opacity-55">Find us on</h3>
            <ul className="space-y-2">
              {SOCIALS.map((social) => (
                <li key={social.key}>
                  <a
                    href={social.href(site)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="opacity-80 hover:opacity-100"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--hairline)] pt-6 text-xs opacity-55">
          <p>
            © {new Date().getFullYear()} {SITE.fullName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
