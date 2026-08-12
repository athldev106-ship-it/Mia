-- =====================================================================
-- Seed data for The LeanKafe & The Coffee Society, Koramangala 5th Block.
--
-- Contact details and the address come from the cafe's public Google
-- listing.
--
-- MENU ITEMS AND PRICES BELOW ARE PLACEHOLDERS. They are written to match
-- the cafe's healthy-kitchen positioning and its published ₹200-400-for-two
-- band, but they are not the real menu, and the "High protein" tags are
-- illustrative rather than measured. Replace them from the actual menu card
-- before launch, or edit them in the staff dashboard at /admin/menu --
-- publishing invented nutrition claims as fact would mislead anyone
-- ordering for dietary reasons.
--
-- Keep this file in step with src/lib/menu-fallback.ts, which is what the
-- site shows when no database is connected.
--
-- Run after schema.sql. Safe to re-run.
-- =====================================================================

insert into public.site_settings (
  id, restaurant_name, tagline, address, google_maps_url,
  phone, whatsapp, email, instagram_url, swiggy_url, zomato_url,
  opening_hours, social, is_open
) values (
  1,
  'The LeanKafe',
  'Great food crafted daily',
  'No 310/8, Guava Garden, KHB Colony, Koramangala 5th Block, Bengaluru, Karnataka 560095',
  'https://www.google.com/maps/search/?api=1&query=The+LeanKafe+%26+The+Coffee+Society%2C+Koramangala+5th+Block%2C+Bengaluru',
  '+919955665594',
  '919955665594',
  null,
  -- TODO replace with the cafe's own profile and listing URLs. These are
  -- platform searches: real, working links, but not direct ones.
  'https://www.instagram.com/explore/search/keyword/?q=leankafe',
  'https://www.swiggy.com/search?query=The%20LeanKafe',
  'https://www.zomato.com/bangalore/restaurants?q=The%20LeanKafe',
  -- TODO confirm opening time. The Google listing publishes the 11 PM
  -- close but not the open; 8 AM is assumed and must be checked.
  '{
     "monday":    "8:00 AM - 11:00 PM",
     "tuesday":   "8:00 AM - 11:00 PM",
     "wednesday": "8:00 AM - 11:00 PM",
     "thursday":  "8:00 AM - 11:00 PM",
     "friday":    "8:00 AM - 11:00 PM",
     "saturday":  "8:00 AM - 11:00 PM",
     "sunday":    "8:00 AM - 11:00 PM"
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
-- Menu categories. Food leads; coffee supports.
-- ---------------------------------------------------------------------
insert into public.menu_categories (name, slug, description, sort_order) values
  ('Signature Bowls', 'signature-bowls', 'A whole grain, a protein, and as many vegetables as we can fit. Built to order.', 1),
  ('Breakfast',       'breakfast',       'Served from open until 12:30, every day.',                                        2),
  ('Salads & Sides',  'salads-sides',    'Lighter plates, and the things that go beside them.',                             3),
  ('Coffee',          'coffee',          'Pulled on a double basket. Sugar is on the counter, never in the cup.',           4),
  ('Cold Drinks',     'cold-drinks',     'Cold brew, shakes and coolers. No syrups, no concentrates.',                      5)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Menu items. PLACEHOLDER CONTENT -- see the header note above.
-- ---------------------------------------------------------------------
insert into public.menu_items
  (category_id, name, description, price_paise, is_veg, tags, is_featured, sort_order)
select c.id, v.name, v.description, v.price_paise, v.is_veg, v.tags, v.is_featured, v.sort_order
from (values
  -- Signature Bowls
  ('signature-bowls', 'Grilled Chicken Bowl',     'Brown rice, grilled chicken, charred broccoli, beans and a lemon-herb dressing.',        32000, false, '{"High protein","Gluten free"}'::text[], true,  1),
  ('signature-bowls', 'Paneer Millet Bowl',       'Foxtail millet, tossed paneer, roast pumpkin, spinach and a mint yoghurt drizzle.',      29000, true,  '{"High protein"}'::text[],               true,  2),
  ('signature-bowls', 'Tofu Buddha Bowl',         'Quinoa, sesame tofu, edamame, red cabbage, cucumber and a ginger-soy dressing.',         30000, true,  '{"Vegan","High protein"}'::text[],       false, 3),
  ('signature-bowls', 'Rajma Grain Bowl',         'Brown rice, slow-cooked rajma, kachumber and a coriander chutney.',                      25000, true,  '{"Vegan","Gluten free"}'::text[],        false, 4),
  ('signature-bowls', 'Chicken Tikka Salad Bowl', 'No grain, all greens: chicken tikka, romaine, peppers, olives and a yoghurt dressing.',  31000, false, '{"Low carb","High protein"}'::text[],    false, 5),

  -- Breakfast
  ('breakfast', 'Egg White Scramble',         'Five whites, spinach and tomato, on toasted sourdough with avocado.',      26000, false, '{"High protein"}'::text[],                  true,  1),
  ('breakfast', 'Masala Oats Bowl',           'Steel-cut oats cooked savoury with vegetables, topped with a soft-boiled egg.', 22000, false, '{}'::text[],                            false, 2),
  ('breakfast', 'Overnight Oats',             'Rolled oats soaked in almond milk, chia, banana and toasted seeds.',       21000, true,  '{"Vegan","Contains nuts"}'::text[],         false, 3),
  ('breakfast', 'Greek Yoghurt & Berry Bowl', 'Thick set yoghurt, seasonal fruit, house granola and a spoon of honey.',   24000, true,  '{"High protein","Contains nuts"}'::text[],  false, 4),
  ('breakfast', 'Millet Upma',                'Little millet, curry leaf, vegetables and roasted cashew.',                19000, true,  '{"Vegan","Contains nuts"}'::text[],         false, 5),

  -- Salads & Sides
  ('salads-sides', 'House Greens',             'Seasonal leaves, cucumber, cherry tomato and a cold-pressed olive oil vinaigrette.', 18000, true,  '{"Vegan","Gluten free"}'::text[],     false, 1),
  ('salads-sides', 'Sprout & Chickpea Chaat',  'Moong sprouts, chickpeas, onion, pomegranate and chaat masala.',                     17000, true,  '{"Vegan","High protein"}'::text[],    false, 2),
  ('salads-sides', 'Grilled Chicken Breast',   'A plain 150g breast to add to anything on the menu.',                                16000, false, '{"High protein","Low carb"}'::text[], false, 3),
  ('salads-sides', 'Sweet Potato Wedges',      'Roasted, not fried, with smoked paprika.',                                           15000, true,  '{"Vegan","Gluten free"}'::text[],     false, 4),
  ('salads-sides', 'Two Boiled Eggs',          'Simple as that.',                                                                     8000, false, '{"High protein","Low carb"}'::text[], false, 5),

  -- Coffee
  ('coffee', 'Espresso',           'A short double on our house blend.',                                  15000, true, '{"Vegan"}'::text[],                  false, 1),
  ('coffee', 'Americano',          'Double shot, hot water, nothing else.',                               17000, true, '{"Vegan"}'::text[],                  false, 2),
  ('coffee', 'Flat White',         'Double ristretto under a thin layer of microfoam.',                    22000, true, '{}'::text[],                         false, 3),
  ('coffee', 'Oat Milk Cappuccino','Our cappuccino, built on barista oat milk.',                           24000, true, '{"Vegan"}'::text[],                  false, 4),
  ('coffee', 'Filter Pour-Over',   'Single-estate Chikmagalur, bloomed slow. Ask what is on today.',       18000, true, '{"Vegan","Single origin"}'::text[],  false, 5),

  -- Cold Drinks
  ('cold-drinks', 'Cold Brew',           'Eighteen-hour steep, served long over ice. Unsweetened.',              19000, true, '{"Vegan"}'::text[],                        true,  1),
  ('cold-drinks', 'Whey Protein Shake',  'One scoop, banana and almond milk. Chocolate or vanilla.',             26000, true, '{"High protein","Contains nuts"}'::text[], false, 2),
  ('cold-drinks', 'Green Detox Cooler',  'Cucumber, green apple, spinach, mint and lime, pressed to order.',     22000, true, '{"Vegan","Gluten free"}'::text[],          false, 3),
  ('cold-drinks', 'Iced Matcha Latte',   'Ceremonial-grade matcha, whisked and poured over milk.',               28000, true, '{}'::text[],                               false, 4),
  ('cold-drinks', 'Lime & Mint Soda',    'Fresh lime, mint and soda. No sugar unless you ask.',                  14000, true, '{"Vegan","Gluten free"}'::text[],          false, 5)
) as v(slug, name, description, price_paise, is_veg, tags, is_featured, sort_order)
join public.menu_categories c on c.slug = v.slug
where not exists (
  select 1 from public.menu_items m where m.name = v.name and m.category_id = c.id
);
