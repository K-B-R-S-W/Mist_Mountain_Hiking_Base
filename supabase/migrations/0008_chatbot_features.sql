-- 0008_chatbot_features.sql
-- Chatbot ecosystem tables + update bookings.source check constraint

-- 1. Allow 'chatbot' in bookings.source
alter table bookings drop constraint if exists bookings_source_check;
alter table bookings
  add constraint bookings_source_check
  check (source in ('direct', 'phone', 'booking_com', 'chatbot'));

-- 2. Chat Leads (Abandoned bookings & Group/Corporate inquiries)
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
  with check (true);

drop policy if exists "chat_leads admin all" on chat_leads;
create policy "chat_leads admin all"
  on chat_leads for all to authenticated
  using (is_admin()) with check (is_admin());

-- 3. Chat Waitlists (Sold-out / Blocked date alerts)
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
  with check (true);

drop policy if exists "chat_waitlists admin all" on chat_waitlists;
create policy "chat_waitlists admin all"
  on chat_waitlists for all to authenticated
  using (is_admin()) with check (is_admin());

-- 4. Chat Unanswered Questions (Content gap discovery)
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
  with check (true);

drop policy if exists "chat_unanswered_logs admin all" on chat_unanswered_logs;
create policy "chat_unanswered_logs admin all"
  on chat_unanswered_logs for all to authenticated
  using (is_admin()) with check (is_admin());
