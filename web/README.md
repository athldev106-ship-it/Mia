# LeanKafe

Website for **The LeanKafe & The Coffee Society**, Koramangala 5th Block, Bengaluru.

Next.js (App Router) + Tailwind CSS v4, with an optional Supabase backend for
reservations, enquiries, the newsletter list and a staff dashboard.

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
export const LOGO = { src: '/media/logo.svg', width: 132, height: 32 };

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

The drawn cup mark, the placeholder tiles and the gradient hero disappear
automatically as each slot is filled.

---

## Before this goes live

- [ ] **Menu prices are placeholders.** They sit inside the listing's published
      ₹200–400-for-two band but are not the cafe's real menu. Replace them in
      `supabase/seed.sql` and `src/lib/menu-fallback.ts`, or edit them in
      `/admin/menu` once Supabase is connected.
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
- [ ] Add real photography and the logo (see above).

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
