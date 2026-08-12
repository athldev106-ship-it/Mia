import { cache } from 'react';

import { WEEKDAYS } from '@/lib/format';
import { FALLBACK_MENU } from '@/lib/menu-fallback';
import { EXTERNAL_LINKS, SITE, fullAddress } from '@/lib/site';
import { createAdminClient } from '@/lib/supabase/admin';

import type { MenuCategoryWithItems, SiteContent } from '@/lib/types';

/**
 * Read helpers for public pages.
 *
 * Every one of these degrades to empty rather than throwing: before
 * Supabase is wired up, and if it is ever briefly unreachable, the site
 * should still render its copy, hours and contact details instead of
 * showing an error page to a hungry guest.
 */
function configured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * The menu, from the database when there is one and from the built-in
 * fallback when there is not -- a preview deploy with no credentials
 * still shows a complete menu rather than an apology.
 *
 * A connected database always wins, including when staff have emptied a
 * category on purpose: only a total absence of items falls back.
 */
export async function getMenu(): Promise<MenuCategoryWithItems[]> {
  const fromDatabase = await readMenu();
  const hasItems = fromDatabase.some((category) => category.items.length > 0);
  return hasItems ? fromDatabase : FALLBACK_MENU;
}

async function readMenu(): Promise<MenuCategoryWithItems[]> {
  if (!configured()) return [];

  try {
    const supabase = createAdminClient();

    const [{ data: categories }, { data: items }] = await Promise.all([
      supabase.from('menu_categories').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('menu_items').select('*').order('sort_order'),
    ]);

    if (!categories) return [];

    return categories.map((category) => ({
      ...category,
      items: (items ?? []).filter((item) => item.category_id === category.id),
    }));
  } catch (error) {
    console.error('[data] getMenu failed', error);
    return [];
  }
}

/**
 * Public-facing restaurant details, merged from the database over the
 * build-time constants in lib/site.ts.
 *
 * This is what makes /admin/settings meaningful: without it the dashboard
 * would write a site_settings row that nothing on the public site reads.
 * Constants remain the fallback so the site still renders correct contact
 * details before Supabase is connected, or if it is briefly unreachable.
 *
 * cache() dedupes this to one query per request, however many components
 * ask for it.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const fallback: SiteContent = {
    name: SITE.name,
    tagline: SITE.tagline,
    address: fullAddress,
    mapsUrl: SITE.mapsUrl,
    phone: SITE.phone,
    phoneDisplay: SITE.phoneDisplay,
    whatsappUrl: EXTERNAL_LINKS.whatsapp,
    instagramUrl: EXTERNAL_LINKS.instagram,
    swiggyUrl: EXTERNAL_LINKS.swiggy,
    zomatoUrl: EXTERNAL_LINKS.zomato,
    email: null,
    hours: SITE.hours,
    isOpen: true,
  };

  if (!configured()) return fallback;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (!data) return fallback;

    return {
      name: data.restaurant_name || fallback.name,
      tagline: data.tagline || fallback.tagline,
      address: data.address || fallback.address,
      mapsUrl: data.google_maps_url || fallback.mapsUrl,
      phone: data.phone || fallback.phone,
      phoneDisplay: data.phone ? formatPhone(data.phone) : fallback.phoneDisplay,
      whatsappUrl: data.whatsapp ? whatsappLink(data.whatsapp) : fallback.whatsappUrl,
      instagramUrl: data.instagram_url || fallback.instagramUrl,
      swiggyUrl: data.swiggy_url || fallback.swiggyUrl,
      zomatoUrl: data.zomato_url || fallback.zomatoUrl,
      email: data.email,
      hours: formatOpeningHours(data.opening_hours) ?? fallback.hours,
      isOpen: data.is_open,
    };
  } catch (error) {
    console.error('[data] getSiteContent failed', error);
    return fallback;
  }
});

/** Builds a wa.me link from whatever shape the number was saved in. */
function whatsappLink(number: string): string {
  const digits = number.replace(/[^\d]/g, '');
  // A bare 10-digit Indian mobile needs the country code wa.me requires.
  const withCountry = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(
    "Hi LeanKafe! I'd like to place an order.",
  )}`;
}

/** "+918045121212" -> "+91 80 4512 1212"; anything unexpected is left alone. */
function formatPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    const rest = digits.slice(2);
    // Mobile numbers are a flat 10 digits; landlines carry an STD code.
    return /^[6-9]/.test(rest)
      ? `+91 ${rest.slice(0, 5)} ${rest.slice(5)}`
      : `+91 ${rest.slice(0, 2)} ${rest.slice(2, 6)} ${rest.slice(6)}`;
  }
  return phone;
}

/**
 * Collapses the opening_hours map into one line when every day is the same,
 * which is the case here, and lists the exceptions when it is not.
 */
function formatOpeningHours(hours: Record<string, string> | null): string | null {
  if (!hours) return null;

  const entries = WEEKDAYS.map(
    (day) => [day as string, hours[day.toLowerCase()]] as [string, string | undefined],
  ).filter((entry): entry is [string, string] => Boolean(entry[1]));
  if (entries.length === 0) return null;

  const unique = new Set(entries.map(([, value]) => value));
  if (unique.size === 1 && entries.length === 7) {
    return `Open daily, ${entries[0][1]}`;
  }

  return entries.map(([day, value]) => `${day.slice(0, 3)} ${value}`).join(' · ');
}
