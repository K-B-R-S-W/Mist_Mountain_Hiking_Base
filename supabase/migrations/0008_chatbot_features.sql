-- 0008_chatbot_features.sql
-- Chatbot ecosystem tables, race condition exclusion constraint, and strict RLS policies

create extension if not exists "btree_gist";

-- 1. Allow 'chatbot' in bookings.source
alter table bookings drop constraint if exists bookings_source_check;
alter table bookings
  add constraint bookings_source_check
  check (source in ('direct', 'phone', 'booking_com', 'chatbot'));

-- 2. DB-Level Exclusion Constraint to prevent double-booking race conditions
-- Guards against concurrent overlapping bookings for the same room on active reservations
alter table bookings drop constraint if exists bookings_no_overlapping_dates;
alter table bookings
  add constraint bookings_no_overlapping_dates
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (status in ('pending', 'contacted', 'confirmed') and room_id is not null and check_in is not null and check_out is not null);

-- 3. Chat Leads (Abandoned bookings & Group/Corporate inquiries)
create table if not exists chat_leads (
  id          uuid primary key default gen_random_uuid(),
  session_id  text,
  guest_name  text,
  email       text,
  phone       text,
  room_id     uuid references rooms(id) on delete set null,
  check_in    date,
  check_out   date,
  guests      int,
  type        text not null default 'abandoned_booking'
              check (type in ('abandoned_booking', 'group_inquiry', 'general_lead')),
  notes       text,
  metadata    jsonb default '{}'::jsonb,
  status      text not null default 'new'
              check (status in ('new', 'contacted', 'converted', 'archived')),
  created_at  timestamptz not null default now()
);

alter table chat_leads enable row level security;

drop policy if exists "chat_leads public insert" on chat_leads;
create policy "chat_leads public insert"
  on chat_leads for insert to anon, authenticated
  with check (
    (guest_name is null or length(guest_name) between 1 and 200)
    and (email is null or (length(email) between 3 and 320 and email like '%@%'))
    and (phone is null or length(phone) between 3 and 50)
    and (notes is null or length(notes) <= 2000)
    and (session_id is null or length(session_id) <= 100)
  );

drop policy if exists "chat_leads admin all" on chat_leads;
create policy "chat_leads admin all"
  on chat_leads for all to authenticated
  using (is_admin()) with check (is_admin());

-- 4. Chat Waitlists (Sold-out / Blocked date alerts)
create table if not exists chat_waitlists (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid references rooms(id) on delete set null,
  guest_name   text not null,
  contact_info text not null,
  check_in     date,
  check_out    date,
  guests       int,
  notes        text,
  status       text not null default 'pending'
               check (status in ('pending', 'notified', 'expired', 'archived')),
  created_at   timestamptz not null default now()
);

alter table chat_waitlists enable row level security;

drop policy if exists "chat_waitlists public insert" on chat_waitlists;
create policy "chat_waitlists public insert"
  on chat_waitlists for insert to anon, authenticated
  with check (
    guest_name is not null and length(guest_name) between 1 and 200
    and contact_info is not null and length(contact_info) between 3 and 320
    and (notes is null or length(notes) <= 2000)
  );

drop policy if exists "chat_waitlists admin all" on chat_waitlists;
create policy "chat_waitlists admin all"
  on chat_waitlists for all to authenticated
  using (is_admin()) with check (is_admin());

-- 5. Chat Unanswered Questions (Content gap discovery)
create table if not exists chat_unanswered_logs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  category    text not null default 'general',
  language    text not null default 'en',
  session_id  text,
  is_resolved boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table chat_unanswered_logs enable row level security;

drop policy if exists "chat_unanswered_logs public insert" on chat_unanswered_logs;
create policy "chat_unanswered_logs public insert"
  on chat_unanswered_logs for insert to anon, authenticated
  with check (
    question is not null and length(question) between 1 and 1000
    and category is not null and length(category) between 1 and 100
    and language is not null and length(language) between 1 and 10
    and (session_id is null or length(session_id) <= 100)
  );

drop policy if exists "chat_unanswered_logs admin all" on chat_unanswered_logs;
create policy "chat_unanswered_logs admin all"
  on chat_unanswered_logs for all to authenticated
  using (is_admin()) with check (is_admin());
