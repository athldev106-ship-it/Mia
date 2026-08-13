import type { Metadata } from 'next';
import Link from 'next/link';

import { MenuBoard } from '@/components/MenuBoard';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { getMenu } from '@/lib/data';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Menu',
  description: `The full menu at ${SITE.fullName}, ${SITE.address.locality} — all-day breakfast, pastas, salads, wraps, smoothie bowls and build-your-own, with single-origin espresso from The Coffee Society.`,
};

// The menu changes from the dashboard, so re-read it periodically rather
// than baking it into the build.
export const revalidate = 300;

export default async function MenuPage() {
  const menu = await getMenu();
  const withItems = menu.filter((category) => category.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Nine chapters, two kitchens"
        title="The menu"
        intro="Breakfast served all day, pastas, salads, soups, wraps and bowls you build yourself — and a full bar of single-origin espresso from The Coffee Society next to it."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <MenuBoard categories={withItems} />

          <Reveal>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/order"
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                Order online
              </Link>
              <Link
                href="/reserve"
                className="rounded-full border border-[var(--hairline)] px-6 py-3 text-sm transition-colors hover:bg-[var(--hairline)]"
              >
                Reserve a table
              </Link>
            </div>
            <p className="mt-8 text-center text-xs opacity-70">
              All prices in ₹ and inclusive of taxes.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
