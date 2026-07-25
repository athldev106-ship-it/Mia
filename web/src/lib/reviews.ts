/**
 * Guest reviews shown on the site.
 *
 * These are real, publicly posted reviews quoted with attribution, gathered
 * from aggregator listings. Two caveats worth acting on before launch:
 *
 *  1. Republishing review text scraped from Google or Tripadvisor is against
 *     their terms. The supported route is the Google Places API, which
 *     returns reviews with the attribution and profile links Google
 *     requires. Swap `REVIEWS` for that feed, or replace it with
 *     first-party testimonials the restaurant collects itself.
 *  2. The aggregate below is the genuine public rating, not an average of
 *     the quotes shown. Keep it that way -- quoting only the warmest
 *     reviews while advertising an inflated score is the part that turns
 *     ordinary marketing into a misleading claim.
 */

export type Review = {
  quote: string;
  author: string;
  rating: number;
  source: string;
};

export const AGGREGATE = {
  value: 4.3,
  count: 259,
  source: 'Google',
  /** Zomato reports 4.2 across 426 dining ratings; both are genuine. */
  alternate: { value: 4.2, count: 426, source: 'Zomato' },
} as const;

export const REVIEWS: Review[] = [
  {
    quote:
      'Very nice hospitality by Pallavi, Chirag, Tukuna and many more. Very nicely prepared food, warm service and cozy ambience.',
    author: 'Mohit G.',
    rating: 5,
    source: 'Google',
  },
  {
    quote:
      'Went for lunch here and it was a great experience. The ambience is quiet and welcoming. The service is really good and organized.',
    author: 'Josef M.',
    rating: 4,
    source: 'Tripadvisor',
  },
  {
    quote:
      'The food spread was great. Very, very good standards in terms of taste.',
    author: 'Verified diner',
    rating: 5,
    source: 'Tripadvisor',
  },
  {
    quote:
      'Friendly staff, tasty food and a wide choice at breakfast — the English spread alongside idli and dosa, and the pancakes were delicious.',
    author: 'Verified diner',
    rating: 5,
    source: 'Tripadvisor',
  },
];
