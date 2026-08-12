/**
 * Where the cafe's own artwork and photography plug in.
 *
 * Everything here is optional. While a slot is null the site draws its
 * built-in placeholder instead, so the design never depends on an asset
 * that has not arrived yet.
 *
 * To use a real asset: drop the file into `public/media/`, then point the
 * slot at it, e.g.
 *
 *   export const LOGO = { src: '/media/logo.svg', width: 132, height: 32 };
 *
 * Photographs want a `width` and `height` so next/image can reserve the
 * space and avoid layout shift, plus an `alt` describing what is shown.
 */

export type Logo = { src: string; width: number; height: number } | null;

export type Photo = { src: string; alt: string; width?: number; height?: number };

/** Replaces the drawn cup mark and wordmark in the nav when set. */
export const LOGO: Logo = null;

/**
 * The interior shots that scroll past on the home and ambience pages.
 * Six or more works best; fewer than four makes the loop feel short.
 * Leave empty to keep the drawn placeholder tiles.
 */
export const INTERIOR_PHOTOS: Photo[] = [];

/**
 * The gallery grid on /ambience. The first entry is rendered large, so
 * lead with the widest, most establishing shot of the room.
 */
export const GALLERY_PHOTOS: Photo[] = [];

/**
 * Optional hero background. A still frame or a short looping clip of the
 * room, shown behind the headline instead of the gradient wash.
 */
export const HERO_MEDIA: { image?: string; video?: string; poster?: string } = {};
