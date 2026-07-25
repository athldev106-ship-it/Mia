/**
 * Hand-written mirror of supabase/schema.sql. Regenerate with
 * `supabase gen types typescript --project-id <id>` once the project exists.
 */

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'no_show';
export type EnquiryType = 'general' | 'catering' | 'events' | 'feedback';
export type EnquiryStatus = 'new' | 'read' | 'closed';
export type Fulfilment = 'takeaway' | 'delivery';
export type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

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

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfilment: Fulfilment;
  address_line: string | null;
  address_landmark: string | null;
  address_pincode: string | null;
  subtotal_paise: number;
  tax_paise: number;
  delivery_fee_paise: number;
  total_paise: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name_snapshot: string;
  unit_price_paise: number;
  quantity: number;
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
  opening_hours: Record<string, string>;
  social: Record<string, string>;
  is_accepting_orders: boolean;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: 'admin' | 'staff';
  created_at: string;
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
      orders: Table<Order>;
      order_items: Table<OrderItem>;
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
