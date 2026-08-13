/**
 * Hand-written mirror of supabase/schema.sql. Regenerate with
 * `supabase gen types typescript --project-id <id>` once the project exists.
 */

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'no_show';
export type EnquiryType = 'general' | 'catering' | 'events' | 'feedback';
export type EnquiryStatus = 'new' | 'read' | 'closed';

/**
 * The business trades as two brands under one roof: the kitchen is The
 * LeanKafe, the bar is The Coffee Society, and the printed menu gives each
 * its own logo and section. Categories carry which side they belong to so
 * the menu page can keep that division.
 */
export type MenuBrand = 'kitchen' | 'coffee';

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: MenuBrand;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

/**
 * Allergen codes, exactly as the printed menu prints them. Kept short
 * because that is what a guest is matching against the key at the foot of
 * the card; ALLERGENS below carries the words.
 */
export const ALLERGENS = {
  D: 'Dairy',
  G: 'Gluten',
  E: 'Egg',
  N: 'Tree nuts',
  Se: 'Sesame',
  So: 'Soy',
  Co: 'Coconut',
} as const;

export type AllergenCode = keyof typeof ALLERGENS;

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_paise: number;
  /**
   * Second price for dishes the kitchen sells at two, where the card
   * prints "₹249 / ₹269" -- the first is the vegetarian build. Null for
   * everything sold at a single price.
   */
  price_nonveg_paise: number | null;
  image_url: string | null;
  is_veg: boolean;
  spice_level: number;
  allergens: AllergenCode[];
  tags: string[];
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MenuCategoryWithItems = MenuCategory & { items: MenuItem[] };

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  party_size: number;
  reserved_at: string;
  occasion: string | null;
  notes: string | null;
  status: ReservationStatus;
  created_at: string;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: EnquiryType;
  message: string;
  status: EnquiryStatus;
  created_at: string;
};

export type Subscriber = {
  id: string;
  email: string;
  created_at: string;
};

export type SiteSettings = {
  id: 1;
  restaurant_name: string;
  tagline: string | null;
  address: string | null;
  google_maps_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram_url: string | null;
  swiggy_url: string | null;
  zomato_url: string | null;
  opening_hours: Record<string, string>;
  social: Record<string, string>;
  is_open: boolean;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: 'admin' | 'staff';
  created_at: string;
};

/**
 * What the public pages actually render: site_settings merged over the
 * constants in lib/site.ts, with links already built. Produced by
 * getSiteContent() and passed down from the layout.
 */
export type SiteContent = {
  name: string;
  tagline: string;
  address: string;
  mapsUrl: string;
  phone: string;
  phoneDisplay: string;
  whatsappUrl: string;
  instagramUrl: string;
  swiggyUrl: string;
  zomatoUrl: string;
  email: string | null;
  hours: string;
  /** Cleared by staff when the cafe closes unexpectedly. */
  isOpen: boolean;
};

type Table<Row, Insert = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      menu_categories: Table<MenuCategory>;
      menu_items: Table<MenuItem>;
      reservations: Table<Reservation>;
      enquiries: Table<Enquiry>;
      subscribers: Table<Subscriber>;
      site_settings: Table<SiteSettings>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

/** ₹ formatting from the integer paise stored in Postgres. */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
}
