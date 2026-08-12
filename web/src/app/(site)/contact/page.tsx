import type { Metadata } from 'next';

import { EnquiryForm } from '@/components/EnquiryForm';
import { OpenStatus } from '@/components/OpenStatus';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { getSiteContent } from '@/lib/data';
import { SITE, fullAddress } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact & location',
  description: `Get in touch with ${SITE.name} in ${SITE.address.locality}, Bengaluru — hours, directions, catering and private hire.`,
};

const HOURS = [
  { day: 'Monday', time: '8:00 AM – 11:00 PM' },
  { day: 'Tuesday', time: '8:00 AM – 11:00 PM' },
  { day: 'Wednesday', time: '8:00 AM – 11:00 PM' },
  { day: 'Thursday', time: '8:00 AM – 11:00 PM' },
  { day: 'Friday', time: '8:00 AM – 11:00 PM' },
  { day: 'Saturday', time: '8:00 AM – 11:00 PM' },
  { day: 'Sunday', time: '8:00 AM – 11:00 PM' },
] as const;

export default async function ContactPage() {
  const site = await getSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        title="Find us, or write to us"
        intro="Catering, a private morning, a large table, or simply a question about what is on the grinder — we would love to hear from you."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-5">
            <Reveal>
              <div className="glass glass-sheen p-7">
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Visit
                </h2>
                <address className="mt-3 not-italic leading-relaxed opacity-75">
                  {site.address}
                </address>
                <div className="mt-4">
                  <OpenStatus />
                </div>
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-block rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-ink)]"
                >
                  Get directions
                </a>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className="glass glass-sheen p-7">
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Opening hours
                </h2>
                <dl className="mt-4 space-y-1.5 text-sm">
                  {HOURS.map((entry) => (
                    <div key={entry.day} className="flex justify-between gap-4">
                      <dt className="opacity-75">{entry.day}</dt>
                      <dd className="tabular-nums">{entry.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="glass glass-sheen p-7">
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Talk to us
                </h2>
                <a
                  href={`tel:${site.phone}`}
                  className="mt-3 inline-block text-lg underline underline-offset-4"
                >
                  {site.phoneDisplay}
                </a>
                <a
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 block underline underline-offset-4"
                >
                  Message us on WhatsApp
                </a>
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 block underline underline-offset-4"
                >
                  Follow us on Instagram
                </a>
              </div>
            </Reveal>
          </div>

          <div className="space-y-5">
            <Reveal delay={100}>
              <EnquiryForm />
            </Reveal>

            <Reveal delay={160}>
              <div className="glass glass-sheen overflow-hidden">
                <iframe
                  title={`Map showing ${SITE.name} in ${SITE.address.locality}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                  width="100%"
                  height="320"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block border-0"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
