import type { AllergenCode, MenuCategoryWithItems, MenuItem } from '@/lib/types';

/**
 * The cafe's real menu, transcribed from the printed card.
 *
 * This is what the site shows when Supabase is not connected, which is the
 * case on any preview deploy without credentials. It mirrors
 * supabase/seed.sql -- change one and change the other.
 *
 * Two things are represented here that the earlier placeholder had no need
 * for: allergen codes, printed exactly as the card prints them, and a
 * second price for the pasta dishes, which are sold at one price veg and
 * another non-veg.
 *
 * Chapter Nine, Build Your Own, is not a list of dishes and does not live
 * here -- see BUILD_YOUR_OWN below.
 */

type SeedItem = Pick<MenuItem, 'name' | 'description' | 'price_paise' | 'is_veg'> &
  Partial<Pick<MenuItem, 'price_nonveg_paise' | 'is_featured' | 'tags'>> & {
    allergens?: AllergenCode[];
  };

type SeedCategory = {
  name: string;
  slug: string;
  /** The chapter heading's subtitle on the printed card. */
  description: string;
  /** Which half of the business this belongs to. */
  brand: 'kitchen' | 'coffee';
  items: SeedItem[];
};

const SEED: SeedCategory[] = [
  {
    name: 'Breakfast',
    slug: 'breakfast',
    description: 'Served all day.',
    brand: 'kitchen',
    items: [
      { name: 'Eggs Your Way', description: 'Sunny side, scrambled or over easy — add cheese, or make it a mushroom omelette.', price_paise: 10900, is_veg: false, allergens: ['E', 'D'] },
      { name: 'Classic Cream Cheese Toast', description: 'House-made cream cheese on sourdough.', price_paise: 11900, is_veg: true, allergens: ['D', 'G'] },
      { name: 'Guacamole Toast', description: 'Creamy Mexican-style avocado dip on sourdough.', price_paise: 19900, is_veg: true, allergens: ['G'], is_featured: true },
      { name: 'Mediterranean Hummus Toast', description: 'House hummus on sourdough.', price_paise: 19900, is_veg: true, allergens: ['G', 'Se'] },
      { name: 'Island Muesli Bowl', description: 'Rolled oats with grains, nuts, fresh fruit and low-fat milk.', price_paise: 13900, is_veg: true, allergens: ['G', 'N', 'D'] },
      { name: 'Overnight Oats, Banana & Papaya', description: 'Rolled oats soaked in low-fat milk, topped with fresh fruit.', price_paise: 13900, is_veg: true, allergens: ['G', 'D'] },
    ],
  },
  {
    name: 'Pastas',
    slug: 'pastas',
    description: 'Grilled chicken, smoked chicken or herb paneer. Priced veg / non-veg.',
    brand: 'kitchen',
    items: [
      { name: 'Pesto Penne', description: 'Subtle basil and cream sauce.', price_paise: 24900, price_nonveg_paise: 26900, is_veg: true, allergens: ['G', 'D', 'N'] },
      { name: 'Arrabiata Spirali', description: 'Fiery tomato sauce.', price_paise: 24900, price_nonveg_paise: 26900, is_veg: true, allergens: ['G'] },
      { name: 'Al Funghi Spaghetti', description: 'House mushroom and cream sauce.', price_paise: 24900, price_nonveg_paise: 26900, is_veg: true, allergens: ['G', 'D'] },
      { name: 'Alfredo Macaroni', description: 'Simple, creamy cheese sauce.', price_paise: 24900, price_nonveg_paise: 26900, is_veg: true, allergens: ['G', 'D'] },
    ],
  },
  {
    name: 'Smoothie Bowls',
    slug: 'smoothie-bowls',
    description: 'Built on yogurt and oats. Add mass gainer or protein powder to any bowl.',
    brand: 'kitchen',
    items: [
      { name: 'Triple Berry', description: 'Strawberry, blueberry and raspberry with low-fat milk and overnight oats.', price_paise: 28900, is_veg: true, allergens: ['D', 'G'], is_featured: true },
      { name: 'Fresh Coconut Chill', description: 'Chunks of tender coconut blended with low-fat milk.', price_paise: 28900, is_veg: true, allergens: ['D', 'Co'] },
      { name: 'Tropical Mango', description: 'Alphonso mango and tender coconut with low-fat milk.', price_paise: 28900, is_veg: true, allergens: ['D', 'Co'] },
      { name: 'Citrus Glow', description: 'Fresh carrot purée and orange nectar with overnight oats.', price_paise: 26900, is_veg: true, allergens: ['G', 'D'] },
    ],
  },
  {
    name: 'Chia Pudding',
    slug: 'chia-pudding',
    description: 'Soaked overnight, topped with seeds.',
    brand: 'kitchen',
    items: [
      { name: 'Oats & Date Chia Crunch', description: 'Chia and low-fat milk with oats, pumpkin seeds and dates.', price_paise: 14900, is_veg: true, allergens: ['D', 'G'] },
      { name: 'Kiwi Chia Crunch', description: 'Chia and low-fat milk with diced kiwi and pumpkin seeds.', price_paise: 14900, is_veg: true, allergens: ['D'] },
      { name: 'Fig & Guava Super Bowl', description: 'Chia and guava nectar with figs and pumpkin seeds.', price_paise: 14900, is_veg: true, allergens: [] },
      { name: 'Tropical Chia Crunch', description: 'Chia and low-fat milk with papaya and pumpkin seeds.', price_paise: 14900, is_veg: true, allergens: ['D'] },
    ],
  },
  {
    name: 'Salads',
    slug: 'salads',
    description: 'Add grilled chicken or herb paneer.',
    brand: 'kitchen',
    items: [
      { name: 'House Salad', description: 'Romaine, white onion and black olives — house cream cheese dressing or honey mustard.', price_paise: 23900, is_veg: true, allergens: ['D'] },
      { name: 'Watermelon & Feta', description: 'Seedless watermelon, feta and fresh mint.', price_paise: 21900, is_veg: true, allergens: ['D'] },
      { name: 'Egg Salad', description: 'Whole egg or egg white, your choice.', price_paise: 21900, is_veg: false, allergens: ['E'] },
      { name: 'Kidney Bean & Corn', description: 'Kidney beans, chickpea and sweet corn with honey mustard vinaigrette.', price_paise: 17900, is_veg: true, allergens: [] },
    ],
  },
  {
    name: 'Soups',
    slug: 'soups',
    description: 'Served with a sourdough cracker.',
    brand: 'kitchen',
    items: [
      { name: 'Roasted Pumpkin', description: 'Pumpkin purée with low-fat milk and coconut milk.', price_paise: 17900, is_veg: true, allergens: ['D', 'Co', 'G'] },
      { name: 'Creamy Broccoli', description: 'Broccoli purée with low-fat milk and coconut milk.', price_paise: 17900, is_veg: true, allergens: ['D', 'Co', 'G'] },
      { name: 'Smokey Mexican Bean', description: 'Warm tomato bisque with fibre-rich beans.', price_paise: 17900, is_veg: true, allergens: ['G'] },
    ],
  },
  {
    name: 'Wraps & Sandwiches',
    slug: 'wraps-sandwiches',
    description: 'Whole wheat tortilla or sourdough.',
    brand: 'kitchen',
    items: [
      { name: 'Grilled Chicken & Hummus', description: 'Pan-fried chicken with a generous spread of hummus.', price_paise: 28900, is_veg: false, allergens: ['G', 'Se'], is_featured: true },
      { name: 'Chicken Pesto', description: 'Pan-fried chicken with subtly flavoured basil sauce.', price_paise: 29900, is_veg: false, allergens: ['G', 'D', 'N'] },
      { name: 'Teriyaki Glazed Chicken', description: 'Glossy savoury-sweet teriyaki with honey mustard.', price_paise: 28900, is_veg: false, allergens: ['G', 'So'] },
      { name: 'Zesty Chicken', description: 'Fiery aromatic chicken with delicate house cream cheese.', price_paise: 28900, is_veg: false, allergens: ['G', 'D'] },
      { name: 'Zesty Paneer & Hummus', description: 'Fiery aromatic paneer with a generous spread of hummus.', price_paise: 25900, is_veg: true, allergens: ['G', 'D', 'Se'] },
      { name: 'Herb Paneer & Hummus', description: 'Paneer tossed in a herb blend with hummus.', price_paise: 25900, is_veg: true, allergens: ['G', 'D', 'Se'] },
      { name: 'Grilled Paneer & Pesto', description: 'Pan-fried paneer with a light basil sauce.', price_paise: 25900, is_veg: true, allergens: ['G', 'D', 'N'] },
      { name: 'Mushroom & Onion Al Funghi', description: 'Stir-fried mushroom and onion with mushroom pâté.', price_paise: 25900, is_veg: true, allergens: ['G', 'D'] },
    ],
  },
  {
    name: 'Shakes',
    slug: 'shakes',
    description: 'Low-fat milk. Add mass gainer or protein.',
    brand: 'kitchen',
    items: [
      { name: 'Figs & Dates', description: null, price_paise: 23900, is_veg: true, allergens: ['D'] },
      { name: 'Mixed Berry', description: null, price_paise: 23900, is_veg: true, allergens: ['D'] },
      { name: 'Avocado', description: null, price_paise: 23900, is_veg: true, allergens: ['D'] },
      { name: 'Carrot & Orange', description: null, price_paise: 23900, is_veg: true, allergens: ['D'] },
      { name: 'Peanut Butter', description: 'Peanut butter, sweet or salted.', price_paise: 23900, is_veg: true, allergens: ['D', 'N'] },
      { name: 'Lychee', description: null, price_paise: 23900, is_veg: true, allergens: ['D'] },
      { name: 'Mango & Coconut', description: null, price_paise: 23900, is_veg: true, allergens: ['D', 'Co'] },
    ],
  },

  /* ---- The Coffee Society ------------------------------------------- */
  {
    name: 'Black',
    slug: 'black',
    description: 'Espresso based, no milk.',
    brand: 'coffee',
    items: [
      { name: 'Espresso', description: null, price_paise: 13200, is_veg: true, allergens: [] },
      { name: 'Espresso Doppio', description: null, price_paise: 18000, is_veg: true, allergens: [] },
      { name: 'Iced Espresso', description: null, price_paise: 16900, is_veg: true, allergens: [] },
      { name: 'Long Black, Hot', description: null, price_paise: 18000, is_veg: true, allergens: [] },
      { name: 'Long Black, Iced', description: null, price_paise: 18000, is_veg: true, allergens: [] },
      { name: 'Americano, Hot', description: null, price_paise: 18000, is_veg: true, allergens: [] },
      { name: 'Americano, Iced', description: null, price_paise: 18000, is_veg: true, allergens: [] },
      { name: 'Cold Brew Black', description: null, price_paise: 24100, is_veg: true, allergens: [], is_featured: true },
      { name: 'Coconut Cold Brew', description: null, price_paise: 27100, is_veg: true, allergens: ['Co'] },
      { name: 'Cold Brew & Diet Coke', description: null, price_paise: 25600, is_veg: true, allergens: [] },
      { name: 'Cold Brew & Ginger Ale', description: null, price_paise: 27100, is_veg: true, allergens: [] },
    ],
  },
  {
    name: 'White',
    slug: 'white',
    description: 'Espresso and milk. All contain dairy.',
    brand: 'coffee',
    items: [
      { name: 'Cappuccino, Hot', description: null, price_paise: 27100, is_veg: true, allergens: ['D'] },
      { name: 'Cappuccino, Iced', description: null, price_paise: 25600, is_veg: true, allergens: ['D'] },
      { name: 'Latte, Hot', description: null, price_paise: 21100, is_veg: true, allergens: ['D'] },
      { name: 'Latte, Iced', description: null, price_paise: 24100, is_veg: true, allergens: ['D'] },
      { name: 'Flat White', description: null, price_paise: 27100, is_veg: true, allergens: ['D'] },
      { name: 'Cortado', description: null, price_paise: 24100, is_veg: true, allergens: ['D'] },
      { name: 'Mocha', description: null, price_paise: 24100, is_veg: true, allergens: ['D'] },
      { name: 'Iced Mocha', description: null, price_paise: 27100, is_veg: true, allergens: ['D'] },
      { name: 'Caramel Macchiato', description: null, price_paise: 26300, is_veg: true, allergens: ['D'] },
      { name: 'Iced Caramel Macchiato', description: null, price_paise: 26300, is_veg: true, allergens: ['D'] },
      { name: 'Vietnamese Coffee', description: null, price_paise: 27100, is_veg: true, allergens: ['D'] },
      { name: 'Spanish Latte', description: null, price_paise: 27100, is_veg: true, allergens: ['D'] },
      { name: 'Iced Spanish Latte', description: null, price_paise: 23700, is_veg: true, allergens: ['D'] },
    ],
  },
  {
    name: 'Filter',
    slug: 'filter',
    description: 'Traditional and manual brews.',
    brand: 'coffee',
    items: [
      { name: 'Pour Over, Hot', description: null, price_paise: 24100, is_veg: true, allergens: [] },
      { name: 'Pour Over, Iced', description: null, price_paise: 24100, is_veg: true, allergens: [] },
      { name: 'Chemex, Hot', description: null, price_paise: 24100, is_veg: true, allergens: [] },
      { name: 'Chemex, Iced', description: null, price_paise: 24100, is_veg: true, allergens: [] },
      { name: 'Aeropress', description: null, price_paise: 24100, is_veg: true, allergens: [] },
      { name: 'Siphon', description: null, price_paise: 24100, is_veg: true, allergens: [] },
      { name: 'Indian Filter Coffee', description: null, price_paise: 19500, is_veg: true, allergens: ['D'] },
    ],
  },
  {
    name: 'Green',
    slug: 'green',
    description: 'Matcha and infused teas. All contain dairy.',
    brand: 'coffee',
    items: [
      { name: 'Matcha Latte', description: null, price_paise: 25400, is_veg: true, allergens: ['D'] },
      { name: 'Iced Matcha', description: null, price_paise: 25600, is_veg: true, allergens: ['D'] },
      { name: 'Matcha Frappé', description: null, price_paise: 26800, is_veg: true, allergens: ['D'] },
      { name: 'Coconut Matcha', description: null, price_paise: 25900, is_veg: true, allergens: ['D', 'Co'] },
    ],
  },
  {
    name: 'Purple',
    slug: 'purple',
    description: 'House speciality — the Ube collection. All contain dairy.',
    brand: 'coffee',
    items: [
      { name: 'Ube Latte', description: null, price_paise: 38700, is_veg: true, allergens: ['D'], is_featured: true },
      { name: 'Ube Iced Latte', description: null, price_paise: 37700, is_veg: true, allergens: ['D'] },
      { name: 'Ube Iced Espresso', description: null, price_paise: 34500, is_veg: true, allergens: ['D'] },
      { name: 'Ube Coconut Cloud', description: null, price_paise: 36500, is_veg: true, allergens: ['D', 'Co'] },
      { name: 'Ube Cheesecake Latte', description: null, price_paise: 41000, is_veg: true, allergens: ['D'] },
      { name: 'Ube Iced Matcha', description: null, price_paise: 41000, is_veg: true, allergens: ['D'] },
      { name: 'Cherry Ube Refresher', description: null, price_paise: 37600, is_veg: true, allergens: ['D'] },
      { name: 'Ube Iced Chocolate', description: null, price_paise: 35600, is_veg: true, allergens: ['D'] },
      { name: 'Ube Frappé', description: null, price_paise: 31000, is_veg: true, allergens: ['D'] },
    ],
  },
];

/**
 * Chapter Nine. A configurator rather than a list: one base price, then
 * four groups to choose from, so it gets its own section on the page.
 */
export const BUILD_YOUR_OWN = {
  title: 'Build Your Own',
  intro: 'Four steps, entirely yours — served as a bowl or rolled into a burrito.',
  bases: [
    { label: 'Bowl or Burrito, Veg', price_paise: 28900, is_veg: true },
    { label: 'Bowl or Burrito, Non-Veg', price_paise: 27900, is_veg: false },
  ],
  included: {
    text: 'Every base comes with pico de gallo, fajita vegetables, beans or sweet corn, and garden greens.',
    allergens: ['G'] as AllergenCode[],
  },
  steps: [
    {
      numeral: 'I',
      title: 'Your protein',
      choices: [
        { name: 'Grilled Chicken' }, { name: 'Zesty Chicken' }, { name: 'Teriyaki Chicken' },
        { name: 'Tandoori Chicken' }, { name: 'Egg, hard or soft boil', allergens: ['E'] },
        { name: 'Zesty Paneer' }, { name: 'Herb Paneer' },
        { name: 'Teriyaki Paneer', allergens: ['D'] },
        { name: 'Herb Potatoes' }, { name: 'Mushroom & Onion Stir-Fry' },
      ] as { name: string; allergens?: AllergenCode[] }[],
    },
    {
      numeral: 'II',
      title: 'Greens & condiments',
      choices: [
        { name: 'Lettuce & Onions' },
        { name: 'Hummus', allergens: ['Se'] },
        { name: 'Tzatziki', allergens: ['D'] },
        { name: 'Guacamole' },
      ] as { name: string; allergens?: AllergenCode[] }[],
    },
    {
      numeral: 'III',
      title: 'Your dose of carb',
      note: 'Spice rice pairs well with tandoori chicken.',
      choices: [{ name: 'Herb Rice' }, { name: 'Aromatic Spice Rice' }] as {
        name: string;
        allergens?: AllergenCode[];
      }[],
    },
    {
      numeral: 'IV',
      title: 'Choice of spice',
      choices: [{ name: 'House Harissa' }, { name: 'Cilantro & Lime' }] as {
        name: string;
        allergens?: AllergenCode[];
      }[],
    },
  ],
} as const;

const NOW = '1970-01-01T00:00:00.000Z';

/**
 * Shaped exactly like the database rows so no consumer can tell which
 * source it got. Ids are stable and synthetic; nothing writes them back.
 */
export const FALLBACK_MENU: MenuCategoryWithItems[] = SEED.map((category, categoryIndex) => ({
  id: `fallback-${category.slug}`,
  name: category.name,
  slug: category.slug,
  description: category.description,
  brand: category.brand,
  sort_order: categoryIndex + 1,
  is_active: true,
  created_at: NOW,
  items: category.items.map((item, itemIndex) => ({
    id: `fallback-${category.slug}-${itemIndex}`,
    category_id: `fallback-${category.slug}`,
    name: item.name,
    description: item.description,
    price_paise: item.price_paise,
    price_nonveg_paise: item.price_nonveg_paise ?? null,
    image_url: null,
    is_veg: item.is_veg,
    spice_level: 0,
    allergens: item.allergens ?? [],
    tags: item.tags ?? [],
    is_available: true,
    is_featured: item.is_featured ?? false,
    sort_order: itemIndex + 1,
    created_at: NOW,
    updated_at: NOW,
  })),
}));
