-- 0004_room_blocks_and_booking_source.sql
-- Web-repo migration parity with what Android already deployed.
-- Source of truth: mist-mountain-android/supabase/migrations/
--   20260804035136_remote_schema.sql
--   20260805000000_add_booking_ref.sql
--
-- Every statement is idempotent (IF NOT EXISTS / IF EXISTS guards, or
-- drop-then-create for policies, which have no native IF NOT EXISTS) so
-- running this against the live DB — where these objects already exist —
-- is a safe no-op.  The point is to give the web repo's migration history
-- parity with what's actually deployed, not to create anything new.

-- ============================================================
-- BOOKINGS: add source + booking_ref
-- ============================================================
alter table bookings
  add column if not exists source text not null default 'direct'
    check (source in ('direct', 'phone', 'booking_com'));

comment on column bookings.source is
  'direct = website inquiry form; phone = manually entered by admin; booking_com = surfaced via Gmail sync.';

alter table bookings
  add column if not exists booking_ref text;

comment on column bookings.booking_ref is
  'Booking.com reservation reference ID, populated by the Android Gmail sync. Not written by the web app.';

create index if not exists bookings_booking_ref_idx on bookings (booking_ref);

-- ============================================================
-- ROOM BLOCKS
-- Public read (the website's room card/detail page reads this table
-- to render unavailability badges) + admin write.
-- ============================================================
create table if not exists room_blocks (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references rooms(id) on delete cascade,
  start_date date not null,
  end_date   date not null,
  reason     text,
  source     text not null default 'manual'
             check (source in ('manual', 'booking')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint room_blocks_date_order check (end_date >= start_date)
);

create index if not exists room_blocks_room_id_dates_idx
  on room_blocks (room_id, start_date, end_date);

-- RLS is auto-enabled by the rls_auto_enable trigger on the live DB,
-- but guard explicitly so the web-side migration is self-contained.
alter table room_blocks enable row level security;

-- Public read: anon visitors can check availability; no row contains PII.
-- CREATE POLICY has no native IF NOT EXISTS — drop-then-create is the
-- idempotent equivalent, and is a true no-op when the definition is unchanged.
drop policy if exists "room_blocks public read" on room_blocks;
create policy "room_blocks public read"
  on room_blocks for select to anon, authenticated using (true);

drop policy if exists "room_blocks admin all" on room_blocks;
create policy "room_blocks admin all"
  on room_blocks for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- BOOKING EMAILS
-- Admin-only end-to-end — guest correspondence, never exposed publicly.
-- Unlike room_blocks there is NO anon/public read policy here.
-- ============================================================
create table if not exists booking_emails (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid references bookings(id) on delete set null,
  gmail_thread_id text not null unique,
  subject         text,
  from_email      text,
  snippet         text,
  status          text not null default 'needs_reply'
                  check (status in ('needs_reply', 'waiting', 'handled')),
  last_message_at timestamptz,
  created_at      timestamptz not null default now()
);

alter table booking_emails enable row level security;

drop policy if exists "booking_emails admin all" on booking_emails;
create policy "booking_emails admin all"
  on booking_emails for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- DEVICE PUSH TOKENS
-- Admin-only — same rationale as booking_emails; both admins' tokens
-- need to be visible to the push-notify Edge Function (service_role,
-- bypasses RLS), and the app's own direct reads/writes are gated here.
-- No anon/public policy.
-- ============================================================
create table if not exists device_push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  token      text not null unique,
  platform   text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now()
);

alter table device_push_tokens enable row level security;

drop policy if exists "device_push_tokens admin all" on device_push_tokens;
create policy "device_push_tokens admin all"
  on device_push_tokens for all to authenticated
  using (is_admin()) with check (is_admin());