-- 0005_activity_actor.sql
-- Adds actor_name to activity_logs to track which admin performed an action,
-- since multiple admins share the same Supabase Auth user_id.

alter table activity_logs
  add column if not exists actor_name text;

comment on column activity_logs.actor_name is
  'The name of the admin who performed the action, selected via WhoIsUsingSwitcher.';
