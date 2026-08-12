# The LeanKafe

Website for **The LeanKafe & The Coffee Society**, Koramangala 5th Block,
Bengaluru — a healthy kitchen and coffee house.

Next.js (App Router) + Tailwind CSS v4, with an optional Supabase backend for
reservations, enquiries, the newsletter list and a staff dashboard.

Design follows the logo: a deep forest green ground with a sage-green bowl.
Sage is too light to carry text on white, so the interface uses a darkened
sage for anything that must be legible and keeps true sage for fills, icons
and the dark theme. The homepage's three pillars mirror the logo's grain,
strength and heart marks.

---

## Running locally

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

The public site runs with **no environment variables at all**: the menu falls
back to a built-in copy and contact details come from `src/lib/site.ts`. Set
the variables below to turn on the forms, email alerts and `/admin`.

```bash
npm run build        # production build
npm run typecheck    # tsc --noEmit
```

---

## Deploying to Vercel

The Next.js app lives in the **`web/` subdirectory**, not at the repository
root — Vercel needs to be told this or the build will not find a project.

1. Go to [vercel.com/new](https://vercel.com/new) and import
   `athldev106-ship-it/Mia`.
2. Set **Root Directory** to `web`.
3. Leave the framework as the auto-detected *Next.js*.
4. Add any environment variables you want (see below) — all are optional.
5. Deploy.

Every push to the branch then redeploys automatically, and pull requests get
their own preview URL.

---

## Environment variables

All optional. Copy `.env.example` to `.env.local` for local development, and
set the same keys in the Vercel project settings.

| Variable | What it enables |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Database-backed menu, forms and `/admin` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staff sign-in |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side writes. **Never expose to the browser** |
| `NEXT_PUBLIC_SITE_URL` | Absolute URLs in metadata and emails |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO_RESTAURANT` | Email alerts for reservations and enquiries |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |

### Setting up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor, then `supabase/seed.sql`.
3. Create a user under **Authentication → Users**, then insert a matching row
   into `profiles` with `role = 'admin'` to make them staff.
4. Sign in at `/admin`.

Customer data is staff-only at the database level (row level security); the
public site reads nothing but the menu and site settings.

---

## Adding the cafe's own artwork

Everything visual has a built-in placeholder, so nothing breaks while assets
are outstanding.

1. Drop files into `web/public/media/`.
2. Point the slots in `web/src/lib/media.ts` at them:

```ts
export const INTERIOR_PHOTOS = [
  { src: '/media/counter.jpg', alt: 'The espresso counter' },
  // six or more reads best in the scrolling strip
];

export const GALLERY_PHOTOS = [
  { src: '/media/room-wide.jpg', alt: 'The main room' }, // first one renders large
];

export const HERO_MEDIA = { image: '/media/hero.jpg' };
// or a clip: { video: '/media/hero.mp4', poster: '/media/hero.jpg' }
```

The placeholder tiles and the gradient hero disappear automatically as each
slot is filled.

### The logo

Already in place. The cafe supplied a circular badge as a JPEG on a white
page; `public/media/` holds two cuts of it, neither redrawn:

| File | What it is | Used by |
| --- | --- | --- |
| `logo-original.jpg` | the file exactly as supplied | source of truth |
| `logo-mark.png` | the icon discs and bowl, no wordmark | the nav, the favicon set, the share card |

A third cut — the whole badge masked to its circle — was dropped: nothing
referenced it, and it was 150 KB sitting in every deploy. Recut it from
`logo-original.jpg` if a print or social-profile asset is ever wanted.

The nav pairs `logo-mark.png` with the cafe's name set in the site's own
type, rather than using the full badge. The badge carries its own wordmark,
which at the 30px the nav allows would be an illegible smudge — and showing
it beside the text would print the name twice.

Two things worth knowing:

- **It is raster, and only as sharp as the 320px badge it came from.** That
  is ample at nav and favicon sizes. If a vector original ever turns up,
  drop it in and point `LOGO` at it — everything else follows.
- The transparency was cut by flooding the background inward from the
  border, so the forest green *inside* the icon discs survives while the
  ground around them goes clear. Re-cutting it by keying out the colour
  would hollow the icons.

The brand colours in `globals.css` were sampled from this artwork:
`#1f2a22` for the ground and `#94a76f` for the sage. They are deliberately
different hues — 136 and 80 — and keeping that split is what stops the
palette reading as one green merely tinted light and dark.

---

## Performance notes

Most of this cafe's customers arrive on mobile data, so page weight was
measured rather than assumed. Two findings are worth not re-deriving.

**Font weights are pinned to what is actually drawn.** Headings never carry
a font-weight utility, so the display face is only ever seen at 400, and
body text uses 400 and `font-medium`. Adding a heavier weight means adding
it in `layout.tsx` *and* in the markup — otherwise the browser synthesises
it and a synthesised serif bold looks smeared.

**The ₹ sign used to cost 83 KB.** Prices are the only thing on the site
using a character outside Latin-1, and `₹` (U+20B9) sits in Inter's
*latin-ext* range — so every page showing a price downloaded that whole
subset to draw one glyph.

`subsets: ['latin']` does not prevent this: that option only decides which
files are eagerly preloaded, and removes no `@font-face` or `unicode-range`
rule. next/font offers no supported way to switch it off.

The fix is at the bottom of `globals.css`: two `@font-face` rules for
family `Inter`, one per weight in use, covering `unicode-range: U+20B9`
only, sourced entirely from `local()` system fonts. Where two faces of one
family overlap, the last declared wins, so these take the rupee sign and
Inter's latin-ext file is never requested. Verified: it disappears from the
network panel on `/menu`, and the glyph still sits correctly beside the
`tabular-nums` digits.

Two things to know if you touch it:

- **Declare the weights separately.** A single rule with a `400 500` range
  does not win the match — next/font declares exact weights, and an exact
  weight beats a range. That version silently did nothing.
- **It degrades safely.** If a device has none of the listed system fonts,
  the face has no usable source, the browser skips it and falls through to
  Inter's latin-ext exactly as before. The worst case is the old 83 KB, not
  a missing glyph.

If a self-hosted subsetted font is ever adopted for other reasons, cutting
one file with `pyftsubset` makes all of this unnecessary.

---

## Before this goes live

- [ ] **The whole menu is a placeholder.** Dishes, prices and the "High
      protein" tags are written to match the healthy-kitchen positioning and
      the listing's ₹200–400-for-two band, but none of it is the cafe's real
      menu and no macro has been measured. Replace it in `supabase/seed.sql`
      and `src/lib/menu-fallback.ts`, or edit it in `/admin/menu` once
      Supabase is connected. Publishing invented nutrition claims as fact
      would mislead anyone ordering for dietary reasons — this one matters
      more than the others on this list.
- [ ] **Confirm the opening time.** Only the 11 PM close is published; 8 AM is
      assumed. It appears in `src/lib/site.ts` (`SITE.hours` and
      `OPENING_HOURS`), `supabase/seed.sql` and `src/app/(site)/contact/page.tsx`.
- [ ] **Replace the ordering and social links.** `EXTERNAL_LINKS` in
      `src/lib/site.ts` currently points at platform *searches* for the cafe —
      real, working links, but not direct ones. Swap in the actual Swiggy,
      Zomato and Instagram URLs (or set them in `/admin/settings`).
- [ ] **Google reviews.** `src/lib/reviews.ts` quotes real public reviews.
      Republishing scraped Google review text is against Google's terms — move
      to the Google Places API or to testimonials the cafe collects itself.
- [ ] Add real photography (see above). The logo is already in.

---

## Project layout

```
web/src/
  app/(site)/      public pages: home, menu, order, ambience, reserve, contact
  app/admin/       staff dashboard (auth-gated by middleware.ts)
  app/api/         reservations, enquiries, newsletter
  components/      shared UI
  lib/site.ts      name, address, phone, hours, external links
  lib/media.ts     logo and photography slots
  lib/data.ts      Supabase reads, each degrading to a safe fallback
supabase/          schema.sql and seed.sql
```
