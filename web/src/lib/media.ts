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
 *   export const GALLERY_PHOTOS = [{ src: '/media/room.jpg', alt: 'The room', width: 1600, height: 1067 }];
 *
 * Photographs want a `width` and `height` so next/image can reserve the
 * space and avoid layout shift, plus an `alt` describing what is shown.
 */

export type Logo = { src: string; width: number; height: number } | null;

export type Photo = { src: string; alt: string; width?: number; height?: number };

/**
 * The mark shown in the nav, beside the wordmark set in the site's own
 * type.
 *
 * This points at the mark alone -- the icon discs and the bowl -- rather
 * than the full circular badge. The badge carries its own "The LeanKafe"
 * wordmark, which at the 30px the nav gives it would be an illegible
 * smudge, and showing it beside the text wordmark would print the name
 * twice. Both files are cuts of the same supplied artwork:
 *
 *   /media/logo.png        the full badge, on a transparent circle
 *   /media/logo-mark.png   the mark alone, for small sizes
 *   /media/logo-original.jpg  the file as supplied, kept as the source
 *
 * Replace with an SVG if a vector version ever turns up; the raster is
 * only as sharp as the 320px badge it was cut from.
 */
export const LOGO: Logo = { src: '/media/logo-mark.png', width: 160, height: 140 };

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
