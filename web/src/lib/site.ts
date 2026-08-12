/**
 * Static site facts. Anything the cafe may want to change without a deploy
 * lives in site_settings in the database instead; this is the fallback used
 * before that row is read, and for build-time metadata.
 */
export const SITE = {
  name: 'LeanKafe',
  fullName: 'The LeanKafe & The Coffee Society',
  tagline: 'Crafted coffee and fresh bakery, every day',
  description:
    'A boutique coffee house in Koramangala 5th Block, Bengaluru. Small-batch espresso, cold brew, and bakery baked through the morning, served in a bright green-and-white room built for staying a while.',
  address: {
    line: 'No 310/8, Guava Garden, KHB Colony',
    locality: 'Koramangala 5th Block',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560095',
  },
  /** Dialable form; `phoneDisplay` is what a human reads. */
  phone: '+919955665594',
  phoneDisplay: '099556 65594',
  /** WhatsApp click-to-chat wants the number without +, spaces or dashes. */
  whatsapp: '919955665594',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+LeanKafe+%26+The+Coffee+Society%2C+Koramangala+5th+Block%2C+Bengaluru',
  hours: 'Open daily, 8:00 AM – 11:00 PM',
  priceRange: '₹200–400 for two',
  rating: { value: 4.9, count: 34 },
} as const;

/**
 * Opening and closing minute-of-day per ISO weekday (1 = Monday .. 7 = Sunday),
 * used by the live open/closed badge. Kept alongside the human-readable
 * `SITE.hours` string above -- if you change one, change the other.
 */
export const OPENING_HOURS: Record<number, { open: string; close: string }> = {
  1: { open: '08:00', close: '23:00' },
  2: { open: '08:00', close: '23:00' },
  3: { open: '08:00', close: '23:00' },
  4: { open: '08:00', close: '23:00' },
  5: { open: '08:00', close: '23:00' },
  6: { open: '08:00', close: '23:00' },
  7: { open: '08:00', close: '23:00' },
};

/**
 * Off-site ordering and social. These are placeholders pointing at each
 * platform's search for the cafe: replace with the cafe's own listing and
 * profile URLs once they are to hand -- every one of them is a real,
 * working link today, just not a direct one.
 */
export const EXTERNAL_LINKS = {
  swiggy: 'https://www.swiggy.com/search?query=The%20LeanKafe',
  zomato: 'https://www.zomato.com/bangalore/restaurants?q=The%20LeanKafe',
  instagram: 'https://www.instagram.com/explore/search/keyword/?q=leankafe',
  /** Prefilled so the first message already says what it is about. */
  whatsapp: `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    "Hi LeanKafe! I'd like to place an order.",
  )}`,
} as const;

/** The ordering page, which the nav promotes to a button rather than a link. */
export const ORDER_HREF = '/order';

export const NAV = [
  { href: '/menu', label: 'Menu' },
  { href: ORDER_HREF, label: 'Order Online' },
  { href: '/ambience', label: 'Ambience' },
  { href: '/reserve', label: 'Reserve' },
  { href: '/contact', label: 'Contact' },
] as const;

export const fullAddress = `${SITE.address.line}, ${SITE.address.locality}, ${SITE.address.city}, ${SITE.address.state} ${SITE.address.pincode}`;
