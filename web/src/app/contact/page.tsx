import type { Metadata } from 'next';

import { EnquiryForm } from '@/components/EnquiryForm';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { SITE, fullAddress } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${SITE.name} at ${SITE.parent}, ${SITE.address.locality}, Bengaluru — enquiries, catering and private events.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        title="Get in touch"
        intro="Catering, a private party, a large table, or simply a question about the menu — we would love to hear from you."
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
                  {fullAddress}
                </address>
                <p className="mt-3 opacity-75">{SITE.hours}</p>
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-block underline underline-offset-4"
                >
                  Get directions
                </a>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="glass glass-sheen p-7">
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Call
                </h2>
                <a
                  href={`tel:${SITE.phone}`}
                  className="mt-3 inline-block text-lg underline underline-offset-4"
                >
                  {SITE.phoneDisplay}
                </a>
                <p className="mt-3 text-sm opacity-65">
                  {SITE.name} is the all-day dining restaurant at {SITE.parent}.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <EnquiryForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
