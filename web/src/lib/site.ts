/**
 * Static site facts. Anything the cafe may want to change without a deploy
 * lives in site_settings in the database instead; this is the fallback used
 * before that row is read, and for build-time metadata.
 */
export const SITE = {
  name: 'The LeanKafe',
  fullName: 'The LeanKafe & The Coffee Society',
  /** From the logo. Keep these two in step with the artwork. */
  tagline: 'Great food crafted daily',
  description:
    'A healthy kitchen and speciality coffee bar in Koramangala 5th Block, Bengaluru. All-day breakfast, pastas, salads, soups, wraps, smoothie bowls and build-your-own bowls and burritos — with single-origin espresso, matcha and the Ube collection from The Coffee Society.',
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

/**
 * The three marks above the bowl in the logo -- grain, strength, heart --
 * used as the site's recurring pillars so the page and the artwork say the
 * same thing.
 */
export const PILLARS = [
  {
    key: 'grain',
    title: 'Whole grains, not white filler',
    body: 'Millets, brown rice, oats and quinoa carry the plate. Slow carbohydrate that leaves you working rather than napping.',
  },
  {
    key: 'protein',
    title: 'Protein you can count',
    body: 'Every bowl is built to a real protein number, weighed on the line. Grilled chicken, eggs, paneer, tofu and legumes, portioned the same way every time.',
  },
  {
    key: 'heart',
    title: 'Cooked the way it should be',
    body: 'Grilled, steamed and tossed. Cold-pressed oils used sparingly, nothing deep-fried, and no cream hiding in the dressing.',
  },
] as const;

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
