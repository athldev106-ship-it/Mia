-- =====================================================================
-- LeanKafe website schema (Supabase / Postgres)
-- Money is stored in paise (integer) to avoid floating point rounding.
-- All timestamps are timestamptz; the app renders them in Asia/Kolkata.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Staff accounts. A row here is what makes a Supabase Auth user staff.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  role       text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

-- Used by every admin-facing policy below. security definer so the policy
-- can read profiles without recursing into profiles' own RLS.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- Menu
-- ---------------------------------------------------------------------
create table if not exists public.menu_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.menu_categories (id) on delete cascade,
  name         text not null,
  description  text,
  price_paise  integer not null check (price_paise >= 0),
  image_url    text,
  is_veg       boolean not null default true,
  spice_level  smallint not null default 0 check (spice_level between 0 and 3),
  tags         text[] not null default '{}',
  is_available boolean not null default true,
  is_featured  boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists menu_items_category_idx on public.menu_items (category_id, sort_order);

-- ---------------------------------------------------------------------
-- Table reservations
-- ---------------------------------------------------------------------
create table if not exists public.reservations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text,
  party_size  smallint not null check (party_size between 1 and 40),
  reserved_at timestamptz not null,
  occasion    text,
  notes       text,
  status      text not null default 'pending'
              check (status in ('pending', 'confirmed', 'seated', 'cancelled', 'no_show')),
  created_at  timestamptz not null default now()
);

create index if not exists reservations_reserved_at_idx on public.reservations (reserved_at desc);

-- ---------------------------------------------------------------------
-- Contact / catering enquiries
-- ---------------------------------------------------------------------
create table if not exists public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  type       text not null default 'general'
             check (type in ('general', 'catering', 'events', 'feedback')),
  message    text not null,
  status     text not null default 'new' check (status in ('new', 'read', 'closed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Newsletter subscribers (the 10%-off signup in the footer)
-- ---------------------------------------------------------------------
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Editable site content (address, hours, phone, ordering links...)
-- Single-row table; `id` is pinned to 1 so it can never fan out.
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id              smallint primary key default 1 check (id = 1),
  restaurant_name text not null,
  tagline         text,
  address         text,
  google_maps_url text,
  phone           text,
  whatsapp        text,
  email           text,
  instagram_url   text,
  swiggy_url      text,
  zomato_url      text,
  opening_hours   jsonb not null default '{}'::jsonb,
  social          jsonb not null default '{}'::jsonb,
  is_open         boolean not null default true,
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_items_touch on public.menu_items;
create trigger menu_items_touch before update on public.menu_items
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Row Level Security
--
-- Public visitors read the menu and site settings, nothing else. Writes
-- from the website (reservations, enquiries, signups) go through server
-- routes using the service role key, which bypasses RLS -- this keeps
-- the anon key from being usable to spam or read customer data.
-- =====================================================================
alter table public.profiles        enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items      enable row level security;
alter table public.reservations    enable row level security;
alter table public.enquiries       enable row level security;
alter table public.subscribers     enable row level security;
alter table public.site_settings   enable row level security;

-- profiles: a staff member sees their own row; admins see all.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- menu: world-readable when active, staff-writable.
drop policy if exists menu_categories_public_read on public.menu_categories;
create policy menu_categories_public_read on public.menu_categories
  for select using (is_active or public.is_staff());

drop policy if exists menu_categories_staff_write on public.menu_categories;
create policy menu_categories_staff_write on public.menu_categories
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists menu_items_public_read on public.menu_items;
create policy menu_items_public_read on public.menu_items
  for select using (
    public.is_staff() or exists (
      select 1 from public.menu_categories c
      where c.id = menu_items.category_id and c.is_active
    )
  );

drop policy if exists menu_items_staff_write on public.menu_items;
create policy menu_items_staff_write on public.menu_items
  for all using (public.is_staff()) with check (public.is_staff());

-- site settings: world-readable, admin-writable.
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
  for select using (true);

drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- customer data: staff only. No anon policy at all == anon sees nothing.
drop policy if exists reservations_staff on public.reservations;
create policy reservations_staff on public.reservations
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists enquiries_staff on public.enquiries;
create policy enquiries_staff on public.enquiries
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists subscribers_staff on public.subscribers;
create policy subscribers_staff on public.subscribers
  for all using (public.is_staff()) with check (public.is_staff());
