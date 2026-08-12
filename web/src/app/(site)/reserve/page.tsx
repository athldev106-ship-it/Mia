import type { Metadata } from 'next';

import { OpenStatus } from '@/components/OpenStatus';
import { PageHeader } from '@/components/PageHeader';
import { ReservationForm } from '@/components/ReservationForm';
import { Reveal } from '@/components/Reveal';
import { getSiteContent } from '@/lib/data';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Reserve a table',
  description: `Reserve a table at ${SITE.name}, ${SITE.address.locality}, Bengaluru. Open daily for coffee, bakery and all-day breakfast.`,
};

export default async function ReservePage() {
  const site = await getSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="Save yourself a seat"
        intro="Tell us when you are coming and how many of you there are. We will call you back to confirm."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-5">
            <Reveal>
              <div className="glass glass-sheen p-7">
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Where to find us
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
                  className="mt-4 inline-block underline underline-offset-4"
                >
                  Open in Google Maps
                </a>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="glass glass-sheen p-7">
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Bringing a group?
                </h2>
                <p className="mt-3 leading-relaxed opacity-75">
                  For eight or more, or for a work session that needs the long table, message us on
                  WhatsApp and we will hold the space properly.
                </p>
                <a
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-block rounded-full border border-[var(--hairline)] px-5 py-2.5 text-sm transition-colors hover:bg-[var(--hairline)]"
                >
                  Message on WhatsApp
                </a>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="glass glass-sheen p-7">
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Prefer to call?
                </h2>
                <a
                  href={`tel:${site.phone}`}
                  className="mt-3 inline-block text-lg underline underline-offset-4"
                >
                  {site.phoneDisplay}
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <ReservationForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
