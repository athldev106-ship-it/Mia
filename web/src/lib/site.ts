/**
 * Static site facts. Anything the restaurant may want to change without a
 * deploy lives in site_settings in the database instead; this is the
 * fallback used before that row is read, and for build-time metadata.
 */
export const SITE = {
  name: 'The Verandah',
  parent: 'Grand Mercure Bengaluru',
  tagline: 'Exquisite flavours and memorable experiences',
  description:
    'All-day dining at Grand Mercure Bengaluru. A sunlit outdoor verandah and a green-walled indoor room in Koramangala 3rd Block, serving South Indian, Asian and Western plates from an open kitchen.',
  address: {
    line: 'Grand Mercure Bangalore, 12th Main Road',
    locality: 'Koramangala 3rd Block',
    city: 'Bengaluru',
    pincode: '560034',
  },
  phone: '+918045121212',
  phoneDisplay: '+91 80 4512 1212',
  mapsUrl: 'https://share.google/4REskNYKgssYDIUQS',
  hours: 'Open daily, 6:30 AM – 11:00 PM',
  rating: { value: 4.3, count: 259 },
} as const;

export const NAV = [
  { href: '/menu', label: 'Menu' },
  { href: '/buffet', label: 'Buffet & Brunch' },
  { href: '/reserve', label: 'Reserve' },
  { href: '/contact', label: 'Contact' },
] as const;

export const fullAddress = `${SITE.address.line}, ${SITE.address.locality}, ${SITE.address.city} ${SITE.address.pincode}`;
