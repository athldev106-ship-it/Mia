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
 * The dish photography that scrolls past on the home and ambience pages.
 *
 * These are the cafe's own shots, lifted from the printed menu. They are
 * plates rather than rooms -- no interior photography exists yet -- so the
 * captions name dishes and the surrounding copy talks about the food. If
 * shots of the room ever arrive, they belong here too, and the copy on
 * /ambience should go back to describing the space.
 *
 * Widths are the 1005px the menu artwork provides. That is ample for the
 * strip and the gallery, which never render a tile wider than about 600px
 * on a normal screen, but it is thin for a full-bleed hero -- which is why
 * HERO_MEDIA is still empty.
 */
export const INTERIOR_PHOTOS: Photo[] = [
  { src: '/media/build-your-own.jpg', alt: 'A build-your-own bowl beside two burritos', width: 1005, height: 270 },
  { src: '/media/wraps.jpg', alt: 'Chicken and paneer wraps with a sandwich', width: 1005, height: 363 },
  { src: '/media/pastas.jpg', alt: 'Arrabiata, al funghi and alfredo pastas', width: 1005, height: 360 },
  { src: '/media/smoothie-chia.jpg', alt: 'A berry smoothie bowl and a chia pudding', width: 1005, height: 285 },
  { src: '/media/coffee-lineup.jpg', alt: 'Espresso, cold brew, cappuccino and an iced latte', width: 1005, height: 249 },
  { src: '/media/salad-soup.jpg', alt: 'Watermelon and feta salad with roasted pumpkin soup', width: 1005, height: 270 },
  // Smaller than the rest: this one sits in a column on its menu page
  // rather than running the full width. Worth including anyway -- the Ube
  // collection is the bar's house speciality, and it is the only thing in
  // the set that is not green.
  { src: '/media/ube.jpg', alt: 'An iced ube latte beside an ube cheesecake latte', width: 478, height: 217 },
];

/**
 * The gallery grid on /ambience. The first entry is rendered large and
 * double height, so lead with the tallest, most striking shot.
 */
export const GALLERY_PHOTOS: Photo[] = [
  { src: '/media/shakes.jpg', alt: 'Figs and dates, mixed berry, and mango and coconut shakes', width: 1005, height: 477 },
  { src: '/media/breakfast.jpg', alt: 'Guacamole toast, an island muesli bowl and overnight oats', width: 1005, height: 207 },
  { src: '/media/smoothie-chia.jpg', alt: 'A triple berry smoothie bowl and a tropical chia pudding', width: 1005, height: 285 },
  { src: '/media/build-your-own.jpg', alt: 'A build-your-own bowl beside two burritos', width: 1005, height: 270 },
];

/**
 * Optional hero background. Deliberately empty: the menu photography is
 * 1005px wide, which stretches badly across a full-width hero on a large
 * display. Fill this when a proper wide shot of the room exists.
 */
export const HERO_MEDIA: { image?: string; video?: string; poster?: string } = {};
