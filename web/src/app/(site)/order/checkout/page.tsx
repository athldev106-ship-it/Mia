import type { Metadata } from 'next';

import { Checkout } from '@/components/cart/Checkout';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { getMenu } from '@/lib/data';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Checkout',
  description: `Pay for your takeaway or delivery order from ${SITE.name}.`,
  // A checkout page has nothing to offer a search result.
  robots: { index: false, follow: true },
};

export const revalidate = 300;

export default async function CheckoutPage() {
  const menu = await getMenu();
  // The menu is served here too, so the cart can be re-priced for display and
  // checked against what we can actually cook right now.
  const items = menu.flatMap((category) => category.items);

  return (
    <>
      <PageHeader
        eyebrow="Almost there"
        title="Checkout"
        intro="Tell us where this is going and pay securely. We confirm the price against today's menu before anything is charged."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Checkout items={items} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
