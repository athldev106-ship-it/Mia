-- =====================================================================
-- Seed data for The Verandah - Grand Mercure, Koramangala 3rd Block.
--
-- Values marked TODO were sourced from public listings (Zomato, EazyDiner,
-- magicpin, Accor) and CONFLICT between them -- confirm with the restaurant
-- before this goes live. Everything else is consistent across sources.
--
-- Run after schema.sql. Safe to re-run.
-- =====================================================================

insert into public.site_settings (
  id, restaurant_name, tagline, address, google_maps_url,
  phone, whatsapp, email, opening_hours, social, is_accepting_orders
) values (
  1,
  'The Verandah',
  'All-day dining at Grand Mercure Bengaluru — global flavours, indoors and out.',
  'Grand Mercure Bangalore, 12th Main Road, Koramangala 3rd Block, Bengaluru 560034',
  'https://share.google/4REskNYKgssYDIUQS',
  -- TODO confirm: listings show +91 90083 00446 (Zomato),
  -- +91 96116 11772 (magicpin) and +91 80 4512 1212 (hotel reception).
  '+918045121212',
  null,
  null,
  -- TODO confirm: sources disagree on both open and close times
  -- (6:00 vs 6:30 AM open; 11:00 vs 11:30 PM close). Using the
  -- narrowest window so the site never over-promises.
  '{
     "monday":    "6:30 AM - 11:00 PM",
     "tuesday":   "6:30 AM - 11:00 PM",
     "wednesday": "6:30 AM - 11:00 PM",
     "thursday":  "6:30 AM - 11:00 PM",
     "friday":    "6:30 AM - 11:00 PM",
     "saturday":  "6:30 AM - 11:00 PM",
     "sunday":    "6:30 AM - 11:00 PM"
   }'::jsonb,
  '{}'::jsonb,
  true
)
on conflict (id) do update set
  restaurant_name = excluded.restaurant_name,
  tagline         = excluded.tagline,
  address         = excluded.address,
  google_maps_url = excluded.google_maps_url,
  updated_at      = now();

-- ---------------------------------------------------------------------
-- Menu categories, matching the cuisines the restaurant is listed under.
-- Items are intentionally NOT seeded: no public listing exposes itemised
-- prices (every platform has the menu as photos), so prices must come
-- from the restaurant rather than be guessed.
-- ---------------------------------------------------------------------
insert into public.menu_categories (name, slug, description, sort_order) values
  ('Buffet & Brunch', 'buffet-brunch', 'Breakfast, lunch and dinner buffets, plus the Sunday Brunch.', 1),
  ('South Indian',    'south-indian',  'Dosa, idli, vada and regional classics.',                        2),
  ('Asian',           'asian',         'Pan-Asian small plates and mains.',                              3),
  ('Chinese',         'chinese',       'Wok classics and Indo-Chinese favourites.',                       4),
  ('Salads & Healthy','salads-healthy','Fresh bowls and lighter plates.',                                 5),
  ('Desserts',        'desserts',      'Patisserie and Indian sweets.',                                   6),
  ('Beverages',       'beverages',     'Coffee, teas and inventive non-alcoholic drinks.',                7)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- The one price public sources agree on: Sunday Brunch.
-- Prices are ex-tax as advertised; stored in paise.
-- ---------------------------------------------------------------------
insert into public.menu_items (category_id, name, description, price_paise, is_veg, sort_order)
select
  c.id, v.name, v.description, v.price_paise, v.is_veg, v.sort_order
from public.menu_categories c
join (values
  ('Sunday Brunch',              'Sunday, 1:00 PM - 4:00 PM. Price excludes taxes.',              239900, true, 1),
  ('Sunday Brunch with alcohol', 'Sunday, 1:00 PM - 4:00 PM. Price excludes taxes.',              389900, true, 2)
) as v(name, description, price_paise, is_veg, sort_order) on true
where c.slug = 'buffet-brunch'
  and not exists (select 1 from public.menu_items m where m.name = v.name);
