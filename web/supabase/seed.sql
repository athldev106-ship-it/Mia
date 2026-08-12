-- =====================================================================
-- Seed data for The LeanKafe & The Coffee Society, Koramangala 5th Block.
--
-- Contact details and the address come from the cafe's public Google
-- listing. MENU ITEMS AND PRICES BELOW ARE PLACEHOLDERS, written to sit
-- inside the listing's ₹200-400-for-two band -- they are not the cafe's
-- real menu. Replace them from the actual menu card before launch, or
-- edit them in the staff dashboard at /admin/menu.
--
-- Run after schema.sql. Safe to re-run.
-- =====================================================================

insert into public.site_settings (
  id, restaurant_name, tagline, address, google_maps_url,
  phone, whatsapp, email, instagram_url, swiggy_url, zomato_url,
  opening_hours, social, is_open
) values (
  1,
  'LeanKafe',
  'Crafted coffee and fresh bakery, every day',
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
-- Menu categories
-- ---------------------------------------------------------------------
insert into public.menu_categories (name, slug, description, sort_order) values
  ('Espresso & Coffee', 'espresso-coffee', 'Pulled on a double basket from beans roasted this week.', 1),
  ('Cold Drinks',       'cold-drinks',     'Cold brew, iced coffee and house sodas.',                   2),
  ('Artisanal Bakery',  'bakery',          'Laminated overnight, baked before we open.',                3),
  ('Breakfast',         'breakfast',       'Served from open until 12:30, every day.',                  4)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Menu items. PLACEHOLDER PRICES -- see the header note above.
-- ---------------------------------------------------------------------
insert into public.menu_items
  (category_id, name, description, price_paise, is_veg, tags, is_featured, sort_order)
select c.id, v.name, v.description, v.price_paise, v.is_veg, v.tags, v.is_featured, v.sort_order
from (values
  -- Espresso & Coffee
  ('espresso-coffee', 'Espresso',            'A short double, pulled on our house blend.',                          15000, true,  '{}'::text[],                    false, 1),
  ('espresso-coffee', 'Cortado',             'Equal parts espresso and steamed milk, served in glass.',             19000, true,  '{}'::text[],                    false, 2),
  ('espresso-coffee', 'Flat White',          'Double ristretto under a thin layer of microfoam.',                   22000, true,  '{}'::text[],                    true,  3),
  ('espresso-coffee', 'Cardamom Latte',      'Double shot, steamed milk and freshly ground green cardamom.',        25000, true,  '{"House favourite"}'::text[],   true,  4),
  ('espresso-coffee', 'Filter Pour-Over',    'Single-estate Chikmagalur, bloomed slow. Ask what is on today.',      18000, true,  '{"Single origin"}'::text[],     false, 5),
  ('espresso-coffee', 'Oat Milk Cappuccino', 'Our cappuccino, built on barista oat milk.',                          24000, true,  '{"Vegan"}'::text[],             false, 6),

  -- Cold Drinks
  ('cold-drinks', 'Overnight Cold Brew',  'Eighteen-hour steep, served long over a single big cube.',              22000, true, '{"Vegan"}'::text[],            true,  1),
  ('cold-drinks', 'Iced Latte',           'Double shot poured over cold milk and ice.',                            23000, true, '{}'::text[],                   false, 2),
  ('cold-drinks', 'Cold Brew Tonic',      'Cold brew, tonic water and a wedge of lime.',                           26000, true, '{"Vegan"}'::text[],            false, 3),
  ('cold-drinks', 'Iced Matcha Latte',    'Ceremonial-grade matcha, whisked and poured over milk.',                28000, true, '{}'::text[],                   false, 4),
  ('cold-drinks', 'House Lemon Soda',     'Fresh lime, cane sugar and soda. No coffee involved.',                  14000, true, '{"Vegan"}'::text[],            false, 5),

  -- Artisanal Bakery
  ('bakery', 'Butter Croissant',        'Laminated overnight and baked at six.',                                  16000, true,  '{}'::text[],                          true,  1),
  ('bakery', 'Almond Croissant',        'Yesterday''s croissant, frangipane and toasted flaked almonds.',          19000, true,  '{"Contains nuts"}'::text[],           false, 2),
  ('bakery', 'Dark Chocolate Cookie',   'Sea salt, 64% chocolate, deliberately underbaked in the middle.',         12000, true,  '{}'::text[],                          false, 3),
  ('bakery', 'Banana Walnut Loaf',      'A thick slice, warmed on request.',                                       15000, true,  '{"Contains nuts"}'::text[],           false, 4),
  ('bakery', 'Flourless Orange Cake',   'Whole orange, almond flour, no wheat anywhere near it.',                  18000, true,  '{"Gluten free","Contains nuts"}'::text[], false, 5),

  -- Breakfast
  ('breakfast', 'Sourdough & Avocado',   'Smashed avocado, chilli, lemon and olive oil on toasted sourdough.',     29000, true,  '{"Vegan"}'::text[],       true,  1),
  ('breakfast', 'Eggs Your Way',         'Two eggs scrambled, fried or poached, with buttered sourdough.',         25000, false, '{}'::text[],              false, 2),
  ('breakfast', 'Mushroom Toast',        'Garlic butter mushrooms, thyme and parmesan on sourdough.',              30000, true,  '{}'::text[],              false, 3),
  ('breakfast', 'Granola Bowl',          'House granola, yoghurt and whatever fruit is good this week.',           24000, true,  '{"Contains nuts"}'::text[], false, 4),
  ('breakfast', 'Masala Omelette',       'Three eggs, onion, tomato and green chilli, with toast.',                26000, false, '{}'::text[],              false, 5)
) as v(slug, name, description, price_paise, is_veg, tags, is_featured, sort_order)
join public.menu_categories c on c.slug = v.slug
where not exists (
  select 1 from public.menu_items m where m.name = v.name and m.category_id = c.id
);
