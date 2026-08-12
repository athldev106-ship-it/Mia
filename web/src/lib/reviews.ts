/**
 * Guest reviews shown on the site.
 *
 * These are real, publicly posted Google reviews quoted with attribution.
 * Two things to settle before launch:
 *
 *  1. Republishing review text scraped from Google is against their terms.
 *     The supported route is the Google Places API, which returns reviews
 *     with the attribution and profile links Google requires. Swap
 *     `REVIEWS` for that feed, or replace it with first-party testimonials
 *     the cafe collects itself.
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
  value: 4.9,
  count: 34,
  source: 'Google',
} as const;

export const REVIEWS: Review[] = [
  {
    quote:
      'Amazing food, with good interacting staff and a friendly vibe. Highly recommended — service was really good.',
    author: 'Nishel Serao',
    rating: 5,
    source: 'Google',
  },
  {
    quote: 'Amazing food and prices!',
    author: 'Abraham Jeeboy',
    rating: 5,
    source: 'Google',
  },
  {
    quote: 'Good food and great ambience.',
    author: 'Megha Cloud',
    rating: 5,
    source: 'Google',
  },
];
