import type { Metadata } from 'next';

import { BuffetBooking } from '@/components/BuffetBooking';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { getBuffetSessions } from '@/lib/data';
import { WEEKDAYS, formatTime } from '@/lib/format';
import { SITE } from '@/lib/site';
import { formatINR } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Buffet & Sunday Brunch',
  description: `Book the buffet or the Sunday Brunch at ${SITE.name}, ${SITE.address.locality} — live grills, a spread across South Indian, Asian and Western, and a table held in your name.`,
};

export const revalidate = 300;

export default async function BuffetPage() {
  const sessions = await getBuffetSessions();

  return (
    <>
      <PageHeader
        eyebrow="Buffet & brunch"
        title="Come hungry"
        intro="Live counters, a spread that runs from idli and dosa through to the grill, and a table held in your name. Book and pay online, and simply arrive."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-5">
            <Reveal>
              <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                Our sittings
              </h2>
            </Reveal>

            {sessions.length === 0 ? (
              <Reveal delay={80}>
                <div className="glass glass-sheen p-8">
                  <p className="leading-relaxed opacity-80">
                    Our buffet timings and prices are being confirmed. Please call us on{' '}
                    <a
                      href={`tel:${SITE.phone}`}
                      className="underline underline-offset-4"
                    >
                      {SITE.phoneDisplay}
                    </a>{' '}
                    and we will be glad to help.
                  </p>
                </div>
              </Reveal>
            ) : (
              sessions.map((session, index) => (
                <Reveal key={session.id} delay={index * 80}>
                  <article className="glass glass-sheen p-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                        {session.name}
                      </h3>
                      <p className="tabular-nums">
                        {formatINR(session.price_paise)}
                        <span className="ml-1 text-xs opacity-55">+ taxes</span>
                      </p>
                    </div>

                    <p className="mt-2 text-sm opacity-70">
                      {session.day_of_week ? WEEKDAYS[session.day_of_week - 1] + 's' : 'Daily'} ·{' '}
                      {formatTime(session.start_time)} – {formatTime(session.end_time)}
                    </p>

                    {session.description && (
                      <p className="mt-3 text-sm leading-relaxed opacity-75">
                        {session.description}
                      </p>
                    )}

                    {session.child_price_paise !== null && (
                      <p className="mt-3 text-sm opacity-70">
                        Children {formatINR(session.child_price_paise)} + taxes
                      </p>
                    )}
                  </article>
                </Reveal>
              ))
            )}
          </div>

          <div>
            <Reveal delay={120}>
              {sessions.length === 0 ? (
                <div className="glass glass-sheen p-8">
                  <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                    Booking opens soon
                  </h2>
                  <p className="mt-4 leading-relaxed opacity-75">
                    Online buffet booking will go live once our sittings are confirmed. Until then,
                    please call us to reserve.
                  </p>
                  <a
                    href={`tel:${SITE.phone}`}
                    className="mt-6 inline-block rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white"
                  >
                    Call {SITE.phoneDisplay}
                  </a>
                </div>
              ) : (
                <BuffetBooking sessions={sessions} />
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
