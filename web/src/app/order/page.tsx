import type { Metadata } from 'next';
import Link from 'next/link';

import { OrderBoard } from '@/components/cart/OrderBoard';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { getMenu } from '@/lib/data';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Order online',
  description: `Order takeaway or delivery from ${SITE.name}, ${SITE.address.locality} — South Indian, Asian and Western plates, paid for online and cooked to order.`,
};

// Same cadence as /menu: availability and prices change from the dashboard,
// so the orderable list is re-read rather than baked into the build.
export const revalidate = 300;

export default async function OrderPage() {
  const menu = await getMenu();
  // Sold-out dishes stay on the page, greyed out and without an add button,
  // exactly as on /menu -- a guest looking for one should see that it exists
  // and is simply off today.
  const categories = menu.filter((category) => category.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Takeaway & delivery"
        title="Order online"
        intro="Build your order, pay securely, and collect it from us or have it brought over. Everything is cooked once you order, so nothing sits under a lamp."
      />

      {categories.length === 0 ? (
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <div className="glass glass-sheen p-10 text-center">
                <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Ordering opens soon
                </h2>
                <p className="mx-auto mt-4 max-w-md leading-relaxed opacity-75">
                  We are putting our dishes and prices online so you can order and pay here. Until
                  then, please call us — we will take your order over the phone and have it ready
                  for you.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <a
                    href={`tel:${SITE.phone}`}
                    className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)]"
                  >
                    Call {SITE.phoneDisplay}
                  </a>
                  <Link
                    href="/menu"
                    className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm"
                  >
                    See the menu
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      ) : (
        <OrderBoard categories={categories} />
      )}
    </>
  );
}
