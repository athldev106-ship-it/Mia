-- =====================================================================
-- Buffet & brunch pre-booking with online payment.
-- Run after schema.sql.
-- =====================================================================

-- A repeating meal service: "Breakfast Buffet", "Sunday Brunch", etc.
-- day_of_week is ISO (1 = Monday .. 7 = Sunday); null means every day.
create table if not exists public.buffet_sessions (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  description        text,
  day_of_week        smallint check (day_of_week between 1 and 7),
  start_time         time not null,
  end_time           time not null,
  price_paise        integer not null check (price_paise >= 0),
  child_price_paise  integer check (child_price_paise >= 0),
  capacity           integer not null default 0 check (capacity >= 0),
  is_active          boolean not null default true,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  constraint buffet_sessions_time_order check (end_time > start_time)
);

create table if not exists public.buffet_bookings (
  id                  uuid primary key default gen_random_uuid(),
  booking_number      text not null unique,
  session_id          uuid not null references public.buffet_sessions (id) on delete restrict,
  booking_date        date not null,
  adults              smallint not null check (adults between 1 and 40),
  children            smallint not null default 0 check (children between 0 and 40),
  customer_name       text not null,
  customer_phone      text not null,
  customer_email      text,
  notes               text,
  subtotal_paise      integer not null check (subtotal_paise >= 0),
  tax_paise           integer not null default 0 check (tax_paise >= 0),
  total_paise         integer not null check (total_paise >= 0),
  status              text not null default 'booked'
                      check (status in ('booked', 'seated', 'completed', 'cancelled', 'no_show')),
  payment_status      text not null default 'pending'
                      check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id   text unique,
  razorpay_payment_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists buffet_bookings_date_idx
  on public.buffet_bookings (booking_date, session_id);

drop trigger if exists buffet_bookings_touch on public.buffet_bookings;
create trigger buffet_bookings_touch before update on public.buffet_bookings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Capacity accounting.
--
-- Paid and seated bookings always hold their covers. Unpaid bookings hold
-- covers only for a short window, so an abandoned checkout releases the
-- table instead of blocking it forever.
-- ---------------------------------------------------------------------
create or replace function public.buffet_covers_taken(
  p_session_id uuid,
  p_date       date
)
returns integer
language sql
stable
as $$
  select coalesce(sum(adults + children), 0)::integer
  from public.buffet_bookings
  where session_id = p_session_id
    and booking_date = p_date
    and status <> 'cancelled'
    and (
      payment_status = 'paid'
      or (payment_status = 'pending' and created_at > now() - interval '15 minutes')
    );
$$;

-- ---------------------------------------------------------------------
-- Books covers and inserts the booking in one transaction, under an
-- advisory lock keyed on (session, date). Without the lock, two checkouts
-- landing together could both read the same remaining capacity and
-- oversell the sitting.
-- ---------------------------------------------------------------------
create or replace function public.create_buffet_booking(
  p_session_id     uuid,
  p_date           date,
  p_adults         smallint,
  p_children       smallint,
  p_name           text,
  p_phone          text,
  p_email          text,
  p_notes          text,
  p_booking_number text,
  p_gst_rate       numeric
)
returns public.buffet_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.buffet_sessions;
  v_taken   integer;
  v_covers  integer := p_adults + p_children;
  v_subtotal integer;
  v_tax      integer;
  v_booking  public.buffet_bookings;
begin
  perform pg_advisory_xact_lock(
    hashtextextended(p_session_id::text || '|' || p_date::text, 0)
  );

  select * into v_session
  from public.buffet_sessions
  where id = p_session_id and is_active;

  if not found then
    raise exception 'session_unavailable' using errcode = 'P0002';
  end if;

  -- A session pinned to a weekday cannot be booked on any other day.
  if v_session.day_of_week is not null
     and extract(isodow from p_date)::smallint <> v_session.day_of_week then
    raise exception 'wrong_day' using errcode = 'P0001';
  end if;

  if p_date < (now() at time zone 'Asia/Kolkata')::date then
    raise exception 'date_in_past' using errcode = 'P0001';
  end if;

  if v_session.capacity > 0 then
    v_taken := public.buffet_covers_taken(p_session_id, p_date);
    if v_taken + v_covers > v_session.capacity then
      raise exception 'sold_out:%', (v_session.capacity - v_taken)
        using errcode = 'P0001';
    end if;
  end if;

  -- Children are charged the child price when the session sets one,
  -- and the full price when it does not.
  v_subtotal := p_adults * v_session.price_paise
              + p_children * coalesce(v_session.child_price_paise, v_session.price_paise);
  v_tax := round(v_subtotal * p_gst_rate);

  insert into public.buffet_bookings (
    booking_number, session_id, booking_date, adults, children,
    customer_name, customer_phone, customer_email, notes,
    subtotal_paise, tax_paise, total_paise
  ) values (
    p_booking_number, p_session_id, p_date, p_adults, p_children,
    p_name, p_phone, nullif(p_email, ''), nullif(p_notes, ''),
    v_subtotal, v_tax, v_subtotal + v_tax
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------
-- RLS: sessions are public (they are menu-like); bookings are staff-only,
-- written by service-role routes.
-- ---------------------------------------------------------------------
alter table public.buffet_sessions enable row level security;
alter table public.buffet_bookings enable row level security;

drop policy if exists buffet_sessions_public_read on public.buffet_sessions;
create policy buffet_sessions_public_read on public.buffet_sessions
  for select using (is_active or public.is_staff());

drop policy if exists buffet_sessions_staff_write on public.buffet_sessions;
create policy buffet_sessions_staff_write on public.buffet_sessions
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists buffet_bookings_staff on public.buffet_bookings;
create policy buffet_bookings_staff on public.buffet_bookings
  for all using (public.is_staff()) with check (public.is_staff());

-- The booking function runs as definer; keep it off the anon role so the
-- only path to it is a server route that has already validated input.
revoke execute on function public.create_buffet_booking(
  uuid, date, smallint, smallint, text, text, text, text, text, numeric
) from anon, authenticated;
