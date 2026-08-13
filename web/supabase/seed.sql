-- =====================================================================
-- Seed data for The LeanKafe & The Coffee Society, Koramangala 5th Block.
--
-- Contact details and the address come from the cafe's public Google
-- listing.
--
-- The menu below is the cafe's real card, transcribed from the printed
-- menu: nine kitchen chapters and the five Coffee Society sections, with
-- allergen codes and the veg / non-veg pasta pricing as printed.
--
-- It is generated from src/lib/menu-fallback.ts rather than typed twice --
-- that module is what the site falls back to with no database attached, and
-- the two must agree. Regenerate rather than hand-editing this half.
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
-- Menu categories, in the order the printed card runs them.
-- ---------------------------------------------------------------------
insert into public.menu_categories (name, slug, description, brand, sort_order) values
  ('Breakfast', 'breakfast', 'Served all day.', 'kitchen', 1),
  ('Pastas', 'pastas', 'Grilled chicken, smoked chicken or herb paneer. Priced veg / non-veg.', 'kitchen', 2),
  ('Smoothie Bowls', 'smoothie-bowls', 'Built on yogurt and oats. Add mass gainer or protein powder to any bowl.', 'kitchen', 3),
  ('Chia Pudding', 'chia-pudding', 'Soaked overnight, topped with seeds.', 'kitchen', 4),
  ('Salads', 'salads', 'Add grilled chicken or herb paneer.', 'kitchen', 5),
  ('Soups', 'soups', 'Served with a sourdough cracker.', 'kitchen', 6),
  ('Wraps & Sandwiches', 'wraps-sandwiches', 'Whole wheat tortilla or sourdough.', 'kitchen', 7),
  ('Shakes', 'shakes', 'Low-fat milk. Add mass gainer or protein.', 'kitchen', 8),
  ('Black', 'black', 'Espresso based, no milk.', 'coffee', 9),
  ('White', 'white', 'Espresso and milk. All contain dairy.', 'coffee', 10),
  ('Filter', 'filter', 'Traditional and manual brews.', 'coffee', 11),
  ('Green', 'green', 'Matcha and infused teas. All contain dairy.', 'coffee', 12),
  ('Purple', 'purple', 'House speciality — the Ube collection. All contain dairy.', 'coffee', 13)
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  brand       = excluded.brand,
  sort_order  = excluded.sort_order;

-- ---------------------------------------------------------------------
-- Menu items.
-- ---------------------------------------------------------------------
insert into public.menu_items
  (category_id, name, description, price_paise, price_nonveg_paise,
   is_veg, allergens, is_featured, sort_order)
select c.id, v.name, v.description, v.price_paise, v.price_nonveg_paise,
       v.is_veg, v.allergens, v.is_featured, v.sort_order
from (values
  ('breakfast', 'Eggs Your Way', 'Sunny side, scrambled or over easy — add cheese, or make it a mushroom omelette.', 10900, null, false, '{"E","D"}'::text[], false, 1),
  ('breakfast', 'Classic Cream Cheese Toast', 'House-made cream cheese on sourdough.', 11900, null, true, '{"D","G"}'::text[], false, 2),
  ('breakfast', 'Guacamole Toast', 'Creamy Mexican-style avocado dip on sourdough.', 19900, null, true, '{"G"}'::text[], true, 3),
  ('breakfast', 'Mediterranean Hummus Toast', 'House hummus on sourdough.', 19900, null, true, '{"G","Se"}'::text[], false, 4),
  ('breakfast', 'Island Muesli Bowl', 'Rolled oats with grains, nuts, fresh fruit and low-fat milk.', 13900, null, true, '{"G","N","D"}'::text[], false, 5),
  ('breakfast', 'Overnight Oats, Banana & Papaya', 'Rolled oats soaked in low-fat milk, topped with fresh fruit.', 13900, null, true, '{"G","D"}'::text[], false, 6),
  ('pastas', 'Pesto Penne', 'Subtle basil and cream sauce.', 24900, 26900, true, '{"G","D","N"}'::text[], false, 1),
  ('pastas', 'Arrabiata Spirali', 'Fiery tomato sauce.', 24900, 26900, true, '{"G"}'::text[], false, 2),
  ('pastas', 'Al Funghi Spaghetti', 'House mushroom and cream sauce.', 24900, 26900, true, '{"G","D"}'::text[], false, 3),
  ('pastas', 'Alfredo Macaroni', 'Simple, creamy cheese sauce.', 24900, 26900, true, '{"G","D"}'::text[], false, 4),
  ('smoothie-bowls', 'Triple Berry', 'Strawberry, blueberry and raspberry with low-fat milk and overnight oats.', 28900, null, true, '{"D","G"}'::text[], true, 1),
  ('smoothie-bowls', 'Fresh Coconut Chill', 'Chunks of tender coconut blended with low-fat milk.', 28900, null, true, '{"D","Co"}'::text[], false, 2),
  ('smoothie-bowls', 'Tropical Mango', 'Alphonso mango and tender coconut with low-fat milk.', 28900, null, true, '{"D","Co"}'::text[], false, 3),
  ('smoothie-bowls', 'Citrus Glow', 'Fresh carrot purée and orange nectar with overnight oats.', 26900, null, true, '{"G","D"}'::text[], false, 4),
  ('chia-pudding', 'Oats & Date Chia Crunch', 'Chia and low-fat milk with oats, pumpkin seeds and dates.', 14900, null, true, '{"D","G"}'::text[], false, 1),
  ('chia-pudding', 'Kiwi Chia Crunch', 'Chia and low-fat milk with diced kiwi and pumpkin seeds.', 14900, null, true, '{"D"}'::text[], false, 2),
  ('chia-pudding', 'Fig & Guava Super Bowl', 'Chia and guava nectar with figs and pumpkin seeds.', 14900, null, true, '{}'::text[], false, 3),
  ('chia-pudding', 'Tropical Chia Crunch', 'Chia and low-fat milk with papaya and pumpkin seeds.', 14900, null, true, '{"D"}'::text[], false, 4),
  ('salads', 'House Salad', 'Romaine, white onion and black olives — house cream cheese dressing or honey mustard.', 23900, null, true, '{"D"}'::text[], false, 1),
  ('salads', 'Watermelon & Feta', 'Seedless watermelon, feta and fresh mint.', 21900, null, true, '{"D"}'::text[], false, 2),
  ('salads', 'Egg Salad', 'Whole egg or egg white, your choice.', 21900, null, false, '{"E"}'::text[], false, 3),
  ('salads', 'Kidney Bean & Corn', 'Kidney beans, chickpea and sweet corn with honey mustard vinaigrette.', 17900, null, true, '{}'::text[], false, 4),
  ('soups', 'Roasted Pumpkin', 'Pumpkin purée with low-fat milk and coconut milk.', 17900, null, true, '{"D","Co","G"}'::text[], false, 1),
  ('soups', 'Creamy Broccoli', 'Broccoli purée with low-fat milk and coconut milk.', 17900, null, true, '{"D","Co","G"}'::text[], false, 2),
  ('soups', 'Smokey Mexican Bean', 'Warm tomato bisque with fibre-rich beans.', 17900, null, true, '{"G"}'::text[], false, 3),
  ('wraps-sandwiches', 'Grilled Chicken & Hummus', 'Pan-fried chicken with a generous spread of hummus.', 28900, null, false, '{"G","Se"}'::text[], true, 1),
  ('wraps-sandwiches', 'Chicken Pesto', 'Pan-fried chicken with subtly flavoured basil sauce.', 29900, null, false, '{"G","D","N"}'::text[], false, 2),
  ('wraps-sandwiches', 'Teriyaki Glazed Chicken', 'Glossy savoury-sweet teriyaki with honey mustard.', 28900, null, false, '{"G","So"}'::text[], false, 3),
  ('wraps-sandwiches', 'Zesty Chicken', 'Fiery aromatic chicken with delicate house cream cheese.', 28900, null, false, '{"G","D"}'::text[], false, 4),
  ('wraps-sandwiches', 'Zesty Paneer & Hummus', 'Fiery aromatic paneer with a generous spread of hummus.', 25900, null, true, '{"G","D","Se"}'::text[], false, 5),
  ('wraps-sandwiches', 'Herb Paneer & Hummus', 'Paneer tossed in a herb blend with hummus.', 25900, null, true, '{"G","D","Se"}'::text[], false, 6),
  ('wraps-sandwiches', 'Grilled Paneer & Pesto', 'Pan-fried paneer with a light basil sauce.', 25900, null, true, '{"G","D","N"}'::text[], false, 7),
  ('wraps-sandwiches', 'Mushroom & Onion Al Funghi', 'Stir-fried mushroom and onion with mushroom pâté.', 25900, null, true, '{"G","D"}'::text[], false, 8),
  ('shakes', 'Figs & Dates', null, 23900, null, true, '{"D"}'::text[], false, 1),
  ('shakes', 'Mixed Berry', null, 23900, null, true, '{"D"}'::text[], false, 2),
  ('shakes', 'Avocado', null, 23900, null, true, '{"D"}'::text[], false, 3),
  ('shakes', 'Carrot & Orange', null, 23900, null, true, '{"D"}'::text[], false, 4),
  ('shakes', 'Peanut Butter', 'Peanut butter, sweet or salted.', 23900, null, true, '{"D","N"}'::text[], false, 5),
  ('shakes', 'Lychee', null, 23900, null, true, '{"D"}'::text[], false, 6),
  ('shakes', 'Mango & Coconut', null, 23900, null, true, '{"D","Co"}'::text[], false, 7),
  ('black', 'Espresso', null, 13200, null, true, '{}'::text[], false, 1),
  ('black', 'Espresso Doppio', null, 18000, null, true, '{}'::text[], false, 2),
  ('black', 'Iced Espresso', null, 16900, null, true, '{}'::text[], false, 3),
  ('black', 'Long Black, Hot', null, 18000, null, true, '{}'::text[], false, 4),
  ('black', 'Long Black, Iced', null, 18000, null, true, '{}'::text[], false, 5),
  ('black', 'Americano, Hot', null, 18000, null, true, '{}'::text[], false, 6),
  ('black', 'Americano, Iced', null, 18000, null, true, '{}'::text[], false, 7),
  ('black', 'Cold Brew Black', null, 24100, null, true, '{}'::text[], true, 8),
  ('black', 'Coconut Cold Brew', null, 27100, null, true, '{"Co"}'::text[], false, 9),
  ('black', 'Cold Brew & Diet Coke', null, 25600, null, true, '{}'::text[], false, 10),
  ('black', 'Cold Brew & Ginger Ale', null, 27100, null, true, '{}'::text[], false, 11),
  ('white', 'Cappuccino, Hot', null, 27100, null, true, '{"D"}'::text[], false, 1),
  ('white', 'Cappuccino, Iced', null, 25600, null, true, '{"D"}'::text[], false, 2),
  ('white', 'Latte, Hot', null, 21100, null, true, '{"D"}'::text[], false, 3),
  ('white', 'Latte, Iced', null, 24100, null, true, '{"D"}'::text[], false, 4),
  ('white', 'Flat White', null, 27100, null, true, '{"D"}'::text[], false, 5),
  ('white', 'Cortado', null, 24100, null, true, '{"D"}'::text[], false, 6),
  ('white', 'Mocha', null, 24100, null, true, '{"D"}'::text[], false, 7),
  ('white', 'Iced Mocha', null, 27100, null, true, '{"D"}'::text[], false, 8),
  ('white', 'Caramel Macchiato', null, 26300, null, true, '{"D"}'::text[], false, 9),
  ('white', 'Iced Caramel Macchiato', null, 26300, null, true, '{"D"}'::text[], false, 10),
  ('white', 'Vietnamese Coffee', null, 27100, null, true, '{"D"}'::text[], false, 11),
  ('white', 'Spanish Latte', null, 27100, null, true, '{"D"}'::text[], false, 12),
  ('white', 'Iced Spanish Latte', null, 23700, null, true, '{"D"}'::text[], false, 13),
  ('filter', 'Pour Over, Hot', null, 24100, null, true, '{}'::text[], false, 1),
  ('filter', 'Pour Over, Iced', null, 24100, null, true, '{}'::text[], false, 2),
  ('filter', 'Chemex, Hot', null, 24100, null, true, '{}'::text[], false, 3),
  ('filter', 'Chemex, Iced', null, 24100, null, true, '{}'::text[], false, 4),
  ('filter', 'Aeropress', null, 24100, null, true, '{}'::text[], false, 5),
  ('filter', 'Siphon', null, 24100, null, true, '{}'::text[], false, 6),
  ('filter', 'Indian Filter Coffee', null, 19500, null, true, '{"D"}'::text[], false, 7),
  ('green', 'Matcha Latte', null, 25400, null, true, '{"D"}'::text[], false, 1),
  ('green', 'Iced Matcha', null, 25600, null, true, '{"D"}'::text[], false, 2),
  ('green', 'Matcha Frappé', null, 26800, null, true, '{"D"}'::text[], false, 3),
  ('green', 'Coconut Matcha', null, 25900, null, true, '{"D","Co"}'::text[], false, 4),
  ('purple', 'Ube Latte', null, 38700, null, true, '{"D"}'::text[], true, 1),
  ('purple', 'Ube Iced Latte', null, 37700, null, true, '{"D"}'::text[], false, 2),
  ('purple', 'Ube Iced Espresso', null, 34500, null, true, '{"D"}'::text[], false, 3),
  ('purple', 'Ube Coconut Cloud', null, 36500, null, true, '{"D","Co"}'::text[], false, 4),
  ('purple', 'Ube Cheesecake Latte', null, 41000, null, true, '{"D"}'::text[], false, 5),
  ('purple', 'Ube Iced Matcha', null, 41000, null, true, '{"D"}'::text[], false, 6),
  ('purple', 'Cherry Ube Refresher', null, 37600, null, true, '{"D"}'::text[], false, 7),
  ('purple', 'Ube Iced Chocolate', null, 35600, null, true, '{"D"}'::text[], false, 8),
  ('purple', 'Ube Frappé', null, 31000, null, true, '{"D"}'::text[], false, 9)
) as v(slug, name, description, price_paise, price_nonveg_paise,
       is_veg, allergens, is_featured, sort_order)
join public.menu_categories c on c.slug = v.slug
where not exists (
  select 1 from public.menu_items m where m.name = v.name and m.category_id = c.id
);
