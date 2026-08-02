-- Mist Mountain Hiking Base — initial schema
-- Implements spec.md §6 + the Junior-to-Senior security deltas:
--   * is_admin() SECURITY DEFINER helper, reused by every policy (no repeated EXISTS)
--   * admin_users has NO client-writable RLS policy at all (service-role/dashboard only)
--   * every admin write policy has WITH CHECK, not just USING
--   * storage buckets get policies that mirror table RLS

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- ADMIN USERS  (source of truth for is_admin())
-- ============================================================
create table admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'admin' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;
-- Deliberately NO policies for role `authenticated` here.
-- Rows are only ever inserted/updated via the Supabase dashboard or the
-- service_role key from a trusted server context — never from client code.
-- This is what stops a logged-in user from ever promoting themselves.

-- SECURITY DEFINER helper — evaluated once per call, not re-derived per row.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$;

-- ============================================================
-- MEDIA
-- ============================================================
create table media_files (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null,
  path        text not null,
  url         text not null,
  alt         text,
  uploaded_by uuid references auth.users(id),
  is_deleted  boolean not null default false,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  unique (bucket, path)
);

alter table media_files enable row level security;

create policy "media_files public read (non-deleted)"
  on media_files for select
  to anon, authenticated
  using (is_deleted = false);

create policy "media_files admin all"
  on media_files for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- ROOMS
-- ============================================================
create table rooms (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  short_description text,
  description       text,
  max_guests        int not null default 2,
  base_price        numeric(12,2) not null default 0,
  featured          boolean not null default false,
  is_visible        boolean not null default true,
  sort_order        int not null default 0,
  is_deleted        boolean not null default false,
  deleted_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table room_images (
  room_id    uuid not null references rooms(id) on delete cascade,
  media_id   uuid not null references media_files(id) on delete cascade,
  sort_order int not null default 0,
  primary key (room_id, media_id)
);

create table amenities (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text
);

create table room_amenities (
  room_id     uuid not null references rooms(id) on delete cascade,
  amenity_id  uuid not null references amenities(id) on delete cascade,
  primary key (room_id, amenity_id)
);

alter table rooms enable row level security;
alter table room_images enable row level security;
alter table amenities enable row level security;
alter table room_amenities enable row level security;

create policy "rooms public read (visible, non-deleted)"
  on rooms for select to anon, authenticated
  using (is_visible = true and is_deleted = false);
create policy "rooms admin all"
  on rooms for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "room_images public read"
  on room_images for select to anon, authenticated using (true);
create policy "room_images admin all"
  on room_images for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "amenities public read"
  on amenities for select to anon, authenticated using (true);
create policy "amenities admin all"
  on amenities for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "room_amenities public read"
  on room_amenities for select to anon, authenticated using (true);
create policy "room_amenities admin all"
  on room_amenities for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- SITE SETTINGS + ASSETS
-- ============================================================
create table site_settings (
  id               int primary key default 1 check (id = 1), -- singleton row
  hotel_name       text not null default 'Mist Mountain Hiking Base',
  tagline          text,
  phone            text,
  whatsapp         text,
  email            text,
  address          text,
  facebook         text,
  instagram        text,
  tiktok           text,
  booking_url      text,
  google_maps_url  text,
  hero_title       text,
  hero_subtitle    text,
  seo_title        text,
  seo_description  text,
  copyright        text,
  default_language text not null default 'en'
);

create table site_assets (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('hero', 'logo', 'footer')),
  media_id   uuid not null references media_files(id) on delete cascade,
  sort_order int not null default 0
);

alter table site_settings enable row level security;
alter table site_assets enable row level security;

create policy "site_settings public read"
  on site_settings for select to anon, authenticated using (true);
create policy "site_settings admin all"
  on site_settings for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "site_assets public read"
  on site_assets for select to anon, authenticated using (true);
create policy "site_assets admin all"
  on site_assets for all to authenticated
  using (is_admin()) with check (is_admin());

insert into site_settings (id) values (1);

-- ============================================================
-- GALLERY
-- ============================================================
create table gallery_images (
  id          uuid primary key default gen_random_uuid(),
  media_id    uuid not null references media_files(id) on delete cascade,
  title       text,
  description text,
  category    text,
  featured    boolean not null default false,
  is_visible  boolean not null default true,
  is_deleted  boolean not null default false,
  deleted_at  timestamptz,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table gallery_images enable row level security;

create policy "gallery_images public read (visible, non-deleted)"
  on gallery_images for select to anon, authenticated
  using (is_visible = true and is_deleted = false);
create policy "gallery_images admin all"
  on gallery_images for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- TESTIMONIALS
-- ============================================================
create table testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  country     text,
  rating      int check (rating between 1 and 5),
  quote       text not null,
  media_id    uuid references media_files(id),
  is_featured boolean not null default false,
  is_approved boolean not null default false,
  is_deleted  boolean not null default false,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now()
);

alter table testimonials enable row level security;

create policy "testimonials public read (approved, non-deleted)"
  on testimonials for select to anon, authenticated
  using (is_approved = true and is_deleted = false);
create policy "testimonials admin all"
  on testimonials for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- BOOKINGS / INQUIRIES
-- ============================================================
create table bookings (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid references rooms(id),
  guest_name text not null,
  email      text not null,
  phone      text,
  check_in   date,
  check_out  date,
  guests     int,
  message    text,
  status     text not null default 'pending'
             check (status in ('pending','contacted','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;

-- No public SELECT policy: inquiries are write-only from the client.
-- Inserts happen through the submitInquiry Server Action using the
-- server-side client (still subject to this policy, not service_role),
-- so a WITH CHECK keeps the insert shape honest even if called directly.
create policy "bookings public insert only"
  on bookings for insert to anon, authenticated
  with check (
    guest_name is not null and length(guest_name) between 1 and 200
    and email is not null and length(email) between 3 and 320
  );

create policy "bookings admin all"
  on bookings for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- ACTIVITY LOG
-- ============================================================
create table activity_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id),
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  created_at timestamptz not null default now()
);

alter table activity_logs enable row level security;

create policy "activity_logs admin read"
  on activity_logs for select to authenticated using (is_admin());
create policy "activity_logs admin insert"
  on activity_logs for insert to authenticated with check (is_admin());
-- no update/delete policy — the log is append-only, even for admins.

-- ============================================================
-- updated_at trigger for rooms
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rooms_set_updated_at
  before update on rooms
  for each row execute function set_updated_at();

-- ============================================================
-- STORAGE POLICIES
-- Buckets: rooms, gallery, hero, testimonials, site
-- Mirrors table RLS: public read, admin-only write.
-- Run once per bucket after creating them in the Supabase dashboard
-- (or via `supabase storage buckets create`).
-- ============================================================
do $$
declare
  b text;
begin
  foreach b in array array['rooms','gallery','hero','testimonials','site'] loop
    execute format(
      'create policy "%1$s public read" on storage.objects for select to anon, authenticated using (bucket_id = %2$L);',
      b || '_read', b
    );
    execute format(
      'create policy "%1$s admin write" on storage.objects for insert to authenticated with check (bucket_id = %2$L and is_admin());',
      b || '_insert', b
    );
    execute format(
      'create policy "%1$s admin update" on storage.objects for update to authenticated using (bucket_id = %2$L and is_admin()) with check (bucket_id = %2$L and is_admin());',
      b || '_update', b
    );
    execute format(
      'create policy "%1$s admin delete" on storage.objects for delete to authenticated using (bucket_id = %2$L and is_admin());',
      b || '_delete', b
    );
  end loop;
end $$;
