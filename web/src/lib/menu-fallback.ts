import type { MenuCategoryWithItems, MenuItem } from '@/lib/types';

/**
 * The menu the site shows when Supabase is not connected -- which is the
 * case on any preview deploy without credentials.
 *
 * It mirrors supabase/seed.sql so the demo and the seeded database agree.
 *
 * PLACEHOLDER CONTENT: these dishes and prices are written to match the
 * cafe's healthy-kitchen positioning and its published ₹200-400-for-two
 * band, but they are not its real menu, and the protein figures are
 * illustrative rather than measured. Replace both this file and seed.sql
 * from the actual menu card before launch -- publishing invented macros
 * as fact is the part that would genuinely mislead someone ordering for
 * dietary reasons. Database rows always win over this fallback.
 */

type SeedItem = Pick<MenuItem, 'name' | 'description' | 'price_paise' | 'is_veg' | 'tags'> &
  Partial<Pick<MenuItem, 'is_featured'>>;

type SeedCategory = {
  name: string;
  slug: string;
  description: string;
  items: SeedItem[];
};

const SEED: SeedCategory[] = [
  {
    name: 'Signature Bowls',
    slug: 'signature-bowls',
    description: 'A whole grain, a protein, and as many vegetables as we can fit. Built to order.',
    items: [
      { name: 'Grilled Chicken Bowl', description: 'Brown rice, grilled chicken, charred broccoli, beans and a lemon-herb dressing.', price_paise: 32000, is_veg: false, tags: ['High protein', 'Gluten free'], is_featured: true },
      { name: 'Paneer Millet Bowl', description: 'Foxtail millet, tossed paneer, roast pumpkin, spinach and a mint yoghurt drizzle.', price_paise: 29000, is_veg: true, tags: ['High protein'], is_featured: true },
      { name: 'Tofu Buddha Bowl', description: 'Quinoa, sesame tofu, edamame, red cabbage, cucumber and a ginger-soy dressing.', price_paise: 30000, is_veg: true, tags: ['Vegan', 'High protein'] },
      { name: 'Rajma Grain Bowl', description: 'Brown rice, slow-cooked rajma, kachumber and a coriander chutney.', price_paise: 25000, is_veg: true, tags: ['Vegan', 'Gluten free'] },
      { name: 'Chicken Tikka Salad Bowl', description: 'No grain, all greens: chicken tikka, romaine, peppers, olives and a yoghurt dressing.', price_paise: 31000, is_veg: false, tags: ['Low carb', 'High protein'] },
    ],
  },
  {
    name: 'Breakfast',
    slug: 'breakfast',
    description: 'Served from open until 12:30, every day.',
    items: [
      { name: 'Egg White Scramble', description: 'Five whites, spinach and tomato, on toasted sourdough with avocado.', price_paise: 26000, is_veg: false, tags: ['High protein'], is_featured: true },
      { name: 'Masala Oats Bowl', description: 'Steel-cut oats cooked savoury with vegetables, topped with a soft-boiled egg.', price_paise: 22000, is_veg: false, tags: [] },
      { name: 'Overnight Oats', description: 'Rolled oats soaked in almond milk, chia, banana and toasted seeds.', price_paise: 21000, is_veg: true, tags: ['Vegan', 'Contains nuts'] },
      { name: 'Greek Yoghurt & Berry Bowl', description: 'Thick set yoghurt, seasonal fruit, house granola and a spoon of honey.', price_paise: 24000, is_veg: true, tags: ['High protein', 'Contains nuts'] },
      { name: 'Millet Upma', description: 'Little millet, curry leaf, vegetables and roasted cashew.', price_paise: 19000, is_veg: true, tags: ['Vegan', 'Contains nuts'] },
    ],
  },
  {
    name: 'Salads & Sides',
    slug: 'salads-sides',
    description: 'Lighter plates, and the things that go beside them.',
    items: [
      { name: 'House Greens', description: 'Seasonal leaves, cucumber, cherry tomato and a cold-pressed olive oil vinaigrette.', price_paise: 18000, is_veg: true, tags: ['Vegan', 'Gluten free'] },
      { name: 'Sprout & Chickpea Chaat', description: 'Moong sprouts, chickpeas, onion, pomegranate and chaat masala.', price_paise: 17000, is_veg: true, tags: ['Vegan', 'High protein'] },
      { name: 'Grilled Chicken Breast', description: 'A plain 150g breast to add to anything on the menu.', price_paise: 16000, is_veg: false, tags: ['High protein', 'Low carb'] },
      { name: 'Sweet Potato Wedges', description: 'Roasted, not fried, with smoked paprika.', price_paise: 15000, is_veg: true, tags: ['Vegan', 'Gluten free'] },
      { name: 'Two Boiled Eggs', description: 'Simple as that.', price_paise: 8000, is_veg: false, tags: ['High protein', 'Low carb'] },
    ],
  },
  {
    name: 'Coffee',
    slug: 'coffee',
    description: 'Pulled on a double basket. Sugar is on the counter, never in the cup.',
    items: [
      { name: 'Espresso', description: 'A short double on our house blend.', price_paise: 15000, is_veg: true, tags: ['Vegan'] },
      { name: 'Americano', description: 'Double shot, hot water, nothing else.', price_paise: 17000, is_veg: true, tags: ['Vegan'] },
      { name: 'Flat White', description: 'Double ristretto under a thin layer of microfoam.', price_paise: 22000, is_veg: true, tags: [] },
      { name: 'Oat Milk Cappuccino', description: 'Our cappuccino, built on barista oat milk.', price_paise: 24000, is_veg: true, tags: ['Vegan'] },
      { name: 'Filter Pour-Over', description: 'Single-estate Chikmagalur, bloomed slow. Ask what is on today.', price_paise: 18000, is_veg: true, tags: ['Vegan', 'Single origin'] },
    ],
  },
  {
    name: 'Cold Drinks',
    slug: 'cold-drinks',
    description: 'Cold brew, shakes and coolers. No syrups, no concentrates.',
    items: [
      { name: 'Cold Brew', description: 'Eighteen-hour steep, served long over ice. Unsweetened.', price_paise: 19000, is_veg: true, tags: ['Vegan'], is_featured: true },
      { name: 'Whey Protein Shake', description: 'One scoop, banana and almond milk. Chocolate or vanilla.', price_paise: 26000, is_veg: true, tags: ['High protein', 'Contains nuts'] },
      { name: 'Green Detox Cooler', description: 'Cucumber, green apple, spinach, mint and lime, pressed to order.', price_paise: 22000, is_veg: true, tags: ['Vegan', 'Gluten free'] },
      { name: 'Iced Matcha Latte', description: 'Ceremonial-grade matcha, whisked and poured over milk.', price_paise: 28000, is_veg: true, tags: [] },
      { name: 'Lime & Mint Soda', description: 'Fresh lime, mint and soda. No sugar unless you ask.', price_paise: 14000, is_veg: true, tags: ['Vegan', 'Gluten free'] },
    ],
  },
];

const NOW = '1970-01-01T00:00:00.000Z';

/**
 * Shaped exactly like the database rows so every consumer is unaware of
 * which source it got. Ids are stable and synthetic; nothing writes them
 * back, since the fallback is only ever read.
 */
export const FALLBACK_MENU: MenuCategoryWithItems[] = SEED.map((category, categoryIndex) => ({
  id: `fallback-${category.slug}`,
  name: category.name,
  slug: category.slug,
  description: category.description,
  sort_order: categoryIndex + 1,
  is_active: true,
  created_at: NOW,
  items: category.items.map((item, itemIndex) => ({
    id: `fallback-${category.slug}-${itemIndex}`,
    category_id: `fallback-${category.slug}`,
    name: item.name,
    description: item.description,
    price_paise: item.price_paise,
    image_url: null,
    is_veg: item.is_veg,
    spice_level: 0,
    tags: item.tags,
    is_available: true,
    is_featured: item.is_featured ?? false,
    sort_order: itemIndex + 1,
    created_at: NOW,
    updated_at: NOW,
  })),
}));
