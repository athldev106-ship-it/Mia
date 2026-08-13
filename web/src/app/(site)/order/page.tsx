import type { Metadata } from 'next';
import Link from 'next/link';

import { OpenStatus } from '@/components/OpenStatus';
import { OrderLinks } from '@/components/OrderLinks';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { getSiteContent } from '@/lib/data';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Order online',
  description: `Order grain bowls, breakfast and coffee from ${SITE.name}, ${SITE.address.locality} — delivery on Swiggy and Zomato, or message us on WhatsApp for pickup.`,
};

export default async function OrderPage() {
  const site = await getSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Delivery & pickup"
        title="Order online"
        intro="We take orders through Swiggy and Zomato for delivery, and directly over WhatsApp or the phone for pickup. Everything is made once you order."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="glass glass-sheen mb-8 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <OpenStatus />
              <Link href="/menu" className="text-sm underline underline-offset-4 opacity-75">
                See what we are serving
              </Link>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <OrderLinks site={site} />
          </Reveal>

          <Reveal delay={160}>
            <div className="glass glass-sheen mt-8 p-7">
              <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                Picking up?
              </h2>
              <p className="mt-3 leading-relaxed opacity-75">
                We are at {site.address}. Message us when you set off and we will time your coffee
                so it is still hot when you get here.
              </p>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-5 inline-block rounded-full border border-[var(--hairline)] px-5 py-2.5 text-sm transition-colors hover:bg-[var(--hairline)]"
              >
                Get directions
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
