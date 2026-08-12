import type { MenuCategoryWithItems, MenuItem } from '@/lib/types';

/**
 * The menu the site shows when Supabase is not connected -- which is the
 * case on any preview deploy without credentials.
 *
 * It mirrors supabase/seed.sql so the demo and the seeded database agree.
 * PLACEHOLDER PRICES: these sit inside the cafe's published ₹200-400-for-two
 * band but are not its real menu. Replace both this file and seed.sql from
 * the actual menu card, or edit them in the dashboard once the database is
 * connected -- database rows always win over this fallback.
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
    name: 'Espresso & Coffee',
    slug: 'espresso-coffee',
    description: 'Pulled on a double basket from beans roasted this week.',
    items: [
      { name: 'Espresso', description: 'A short double, pulled on our house blend.', price_paise: 15000, is_veg: true, tags: [] },
      { name: 'Cortado', description: 'Equal parts espresso and steamed milk, served in glass.', price_paise: 19000, is_veg: true, tags: [] },
      { name: 'Flat White', description: 'Double ristretto under a thin layer of microfoam.', price_paise: 22000, is_veg: true, tags: [], is_featured: true },
      { name: 'Cardamom Latte', description: 'Double shot, steamed milk and freshly ground green cardamom.', price_paise: 25000, is_veg: true, tags: ['House favourite'], is_featured: true },
      { name: 'Filter Pour-Over', description: 'Single-estate Chikmagalur, bloomed slow. Ask what is on today.', price_paise: 18000, is_veg: true, tags: ['Single origin'] },
      { name: 'Oat Milk Cappuccino', description: 'Our cappuccino, built on barista oat milk.', price_paise: 24000, is_veg: true, tags: ['Vegan'] },
    ],
  },
  {
    name: 'Cold Drinks',
    slug: 'cold-drinks',
    description: 'Cold brew, iced coffee and house sodas.',
    items: [
      { name: 'Overnight Cold Brew', description: 'Eighteen-hour steep, served long over a single big cube.', price_paise: 22000, is_veg: true, tags: ['Vegan'], is_featured: true },
      { name: 'Iced Latte', description: 'Double shot poured over cold milk and ice.', price_paise: 23000, is_veg: true, tags: [] },
      { name: 'Cold Brew Tonic', description: 'Cold brew, tonic water and a wedge of lime.', price_paise: 26000, is_veg: true, tags: ['Vegan'] },
      { name: 'Iced Matcha Latte', description: 'Ceremonial-grade matcha, whisked and poured over milk.', price_paise: 28000, is_veg: true, tags: [] },
      { name: 'House Lemon Soda', description: 'Fresh lime, cane sugar and soda. No coffee involved.', price_paise: 14000, is_veg: true, tags: ['Vegan'] },
    ],
  },
  {
    name: 'Artisanal Bakery',
    slug: 'bakery',
    description: 'Laminated overnight, baked before we open.',
    items: [
      { name: 'Butter Croissant', description: 'Laminated overnight and baked at six.', price_paise: 16000, is_veg: true, tags: [], is_featured: true },
      { name: 'Almond Croissant', description: "Yesterday's croissant, frangipane and toasted flaked almonds.", price_paise: 19000, is_veg: true, tags: ['Contains nuts'] },
      { name: 'Dark Chocolate Cookie', description: 'Sea salt, 64% chocolate, deliberately underbaked in the middle.', price_paise: 12000, is_veg: true, tags: [] },
      { name: 'Banana Walnut Loaf', description: 'A thick slice, warmed on request.', price_paise: 15000, is_veg: true, tags: ['Contains nuts'] },
      { name: 'Flourless Orange Cake', description: 'Whole orange, almond flour, no wheat anywhere near it.', price_paise: 18000, is_veg: true, tags: ['Gluten free', 'Contains nuts'] },
    ],
  },
  {
    name: 'Breakfast',
    slug: 'breakfast',
    description: 'Served from open until 12:30, every day.',
    items: [
      { name: 'Sourdough & Avocado', description: 'Smashed avocado, chilli, lemon and olive oil on toasted sourdough.', price_paise: 29000, is_veg: true, tags: ['Vegan'], is_featured: true },
      { name: 'Eggs Your Way', description: 'Two eggs scrambled, fried or poached, with buttered sourdough.', price_paise: 25000, is_veg: false, tags: [] },
      { name: 'Mushroom Toast', description: 'Garlic butter mushrooms, thyme and parmesan on sourdough.', price_paise: 30000, is_veg: true, tags: [] },
      { name: 'Granola Bowl', description: 'House granola, yoghurt and whatever fruit is good this week.', price_paise: 24000, is_veg: true, tags: ['Contains nuts'] },
      { name: 'Masala Omelette', description: 'Three eggs, onion, tomato and green chilli, with toast.', price_paise: 26000, is_veg: false, tags: [] },
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
