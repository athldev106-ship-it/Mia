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
  -- Hotel reception, the number published on Accor's own site. Chosen over
  -- the Zomato (+91 90083 00446) and magicpin (+91 96116 11772) listings.
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
-- Bookable buffet sittings. Run schema_buffet.sql before this section.
--
-- Prices are ex-tax, as advertised. Only the Sunday Brunch price is
-- public and consistent across sources; the daily buffet prices are
-- TODO and are seeded inactive so nothing wrong can be sold.
--
-- capacity 0 means "no online cap" -- set the real covers per sitting
-- before launch, otherwise the site will never show as sold out.
-- ---------------------------------------------------------------------
insert into public.buffet_sessions
  (name, description, day_of_week, start_time, end_time, price_paise, child_price_paise, capacity, is_active, sort_order)
select v.*
from (values
  ('Sunday Brunch', 'Our flagship Sunday spread. Price excludes taxes.',
   7::smallint, '13:00'::time, '16:00'::time, 239900, null::integer, 0, true, 1),
  ('Sunday Brunch with alcohol', 'Sunday Brunch including alcoholic beverages. Price excludes taxes.',
   7, '13:00', '16:00', 389900, null, 0, true, 2),
  -- TODO price: not published anywhere. Inactive until the restaurant confirms.
  ('Breakfast Buffet', 'Served daily.', null, '06:30', '10:30',      0, null, 0, false, 3),
  ('Lunch Buffet',     'Served daily.', null, '12:30', '15:30',      0, null, 0, false, 4),
  ('Dinner Buffet',    'Served daily.', null, '19:00', '23:00',      0, null, 0, false, 5)
) as v(name, description, day_of_week, start_time, end_time, price_paise, child_price_paise, capacity, is_active, sort_order)
where not exists (
  select 1 from public.buffet_sessions s where s.name = v.name
);
