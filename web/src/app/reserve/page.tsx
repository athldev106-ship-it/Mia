import type { Metadata } from 'next';

import { PageHeader } from '@/components/PageHeader';
import { ReservationForm } from '@/components/ReservationForm';
import { Reveal } from '@/components/Reveal';
import { SITE, fullAddress } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Reserve a table',
  description: `Reserve a table at ${SITE.name}, ${SITE.address.locality}, Bengaluru. Indoor and verandah seating, open daily.`,
};

export default function ReservePage() {
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
                  {fullAddress}
                </address>
                <p className="mt-3 opacity-75">{SITE.hours}</p>
                <a
                  href={SITE.mapsUrl}
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
                  Booking the buffet?
                </h2>
                <p className="mt-3 leading-relaxed opacity-75">
                  Buffet and Sunday Brunch tables are booked and paid for online, so your seat is
                  held the moment you finish.
                </p>
                <a
                  href="/buffet"
                  className="mt-4 inline-block rounded-full border border-[var(--hairline)] px-5 py-2.5 text-sm"
                >
                  Buffet & brunch
                </a>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="glass glass-sheen p-7">
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Prefer to call?
                </h2>
                <a
                  href={`tel:${SITE.phone}`}
                  className="mt-3 inline-block text-lg underline underline-offset-4"
                >
                  {SITE.phoneDisplay}
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
