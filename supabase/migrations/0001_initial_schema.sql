-- =============================================================
-- Ferrari Cars Rental — Initial schema
-- Run on a FRESH Supabase project (not idempotent for type creation).
-- Paste THIS WHOLE FILE into Supabase SQL Editor and click Run.
-- =============================================================

create extension if not exists "pgcrypto";

-- ENUMS
create type public.car_type       as enum ('luxury', 'suv', 'sports');
create type public.booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type public.customer_tier  as enum ('bronze', 'silver', 'gold');

-- CARS
create table public.cars (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name_ar       text not null,
  model         text not null,
  name_en       text not null,
  type          public.car_type not null,
  year          smallint not null check (year between 1990 and 2100),
  seats         smallint not null check (seats between 1 and 12),
  transmission  text not null,
  engine        text not null,
  price_per_day numeric(10,2) not null check (price_per_day >= 0),
  image_url     text not null,
  features      jsonb not null default '["driver","insurance","mileage","no-deposit"]'::jsonb,
  available     boolean not null default true,
  featured      boolean not null default false,
  rentals_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index cars_type_idx      on public.cars(type);
create index cars_available_idx on public.cars(available);

-- CUSTOMERS
create table public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null unique,
  email       text,
  tier        public.customer_tier not null default 'bronze',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index customers_tier_idx on public.customers(tier);

-- BOOKINGS
create table public.bookings (
  id             uuid primary key default gen_random_uuid(),
  ref            text unique not null default ('B-' || lpad((floor(random()*9000)+1000)::text, 4, '0')),
  customer_id    uuid references public.customers(id) on delete set null,
  car_id         uuid references public.cars(id) on delete set null,
  customer_name  text not null,
  customer_phone text not null,
  customer_email text,
  car_label      text not null,
  pickup_date    date not null,
  days           integer not null check (days >= 1),
  destination    text,
  passengers     smallint default 2,
  notes          text,
  total_kwd      numeric(10,2) not null check (total_kwd >= 0),
  status         public.booking_status not null default 'pending',
  source         text not null default 'web',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index bookings_status_idx  on public.bookings(status);
create index bookings_created_idx on public.bookings(created_at desc);

-- TESTIMONIALS
create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  customer_name text not null,
  text          text not null,
  rating        smallint not null check (rating between 1 and 5) default 5,
  published     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ADMIN PROFILES
create table public.admin_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Admin',
  created_at   timestamptz not null default now()
);

-- updated_at trigger function (body as single-quoted string — no dollar quotes)
create or replace function public.set_updated_at() returns trigger
language plpgsql
as 'begin new.updated_at := now(); return new; end';

create trigger trg_cars_updated      before update on public.cars      for each row execute function public.set_updated_at();
create trigger trg_customers_updated before update on public.customers for each row execute function public.set_updated_at();
create trigger trg_bookings_updated  before update on public.bookings  for each row execute function public.set_updated_at();

-- is_admin() helper (body as single-quoted string — no dollar quotes)
create or replace function public.is_admin() returns boolean
language sql
stable
as 'select exists (select 1 from public.admin_profiles where id = auth.uid())';

-- RLS
alter table public.cars            enable row level security;
alter table public.customers       enable row level security;
alter table public.bookings        enable row level security;
alter table public.testimonials    enable row level security;
alter table public.admin_profiles  enable row level security;

create policy "cars_public_read"  on public.cars for select using (true);
create policy "cars_admin_write"  on public.cars for all    using (public.is_admin()) with check (public.is_admin());

create policy "testimonials_public_read"  on public.testimonials for select using (published = true);
create policy "testimonials_admin_write"  on public.testimonials for all    using (public.is_admin()) with check (public.is_admin());

create policy "bookings_public_insert" on public.bookings for insert with check (true);
create policy "bookings_admin_all"     on public.bookings for all    using (public.is_admin()) with check (public.is_admin());

create policy "customers_admin_all" on public.customers for all using (public.is_admin()) with check (public.is_admin());

create policy "admin_profiles_self_read" on public.admin_profiles for select using (id = auth.uid() or public.is_admin());

-- VIEWS
create or replace view public.v_kpis as
  select
    (select coalesce(sum(total_kwd), 0)
       from public.bookings
       where status in ('confirmed','completed')
         and created_at >= date_trunc('month', now())) as revenue_month,
    (select count(*) from public.bookings where status = 'confirmed')                 as active_bookings,
    (select count(*) from public.cars     where available = true)                     as cars_available,
    (select count(*) from public.cars)                                                as cars_total,
    (select count(*) from public.customers where created_at >= now() - interval '30 days') as new_customers;

create or replace view public.v_revenue_monthly as
  select to_char(date_trunc('month', created_at), 'YYYY-MM') as ym,
         sum(total_kwd)::numeric(12,2) as revenue,
         count(*)                      as bookings
    from public.bookings
   where status in ('confirmed','completed')
   group by 1
   order by 1;

create or replace view public.v_top_cars as
  select c.id, c.name_ar, c.model, c.image_url,
         count(b.id) as rentals
    from public.cars c
    left join public.bookings b on b.car_id = c.id
   group by c.id
   order by rentals desc
   limit 10;

-- STORAGE bucket + policies
insert into storage.buckets (id, name, public)
values ('car-images', 'car-images', true)
on conflict (id) do nothing;

create policy "car_images_public_read" on storage.objects for select using (bucket_id = 'car-images');
create policy "car_images_admin_write" on storage.objects for all    using (bucket_id = 'car-images' and public.is_admin()) with check (bucket_id = 'car-images' and public.is_admin());
