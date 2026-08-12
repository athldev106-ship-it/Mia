/**
 * Hand-written mirror of supabase/schema.sql. Regenerate with
 * `supabase gen types typescript --project-id <id>` once the project exists.
 */

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'no_show';
export type EnquiryType = 'general' | 'catering' | 'events' | 'feedback';
export type EnquiryStatus = 'new' | 'read' | 'closed';

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_paise: number;
  image_url: string | null;
  is_veg: boolean;
  spice_level: number;
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
