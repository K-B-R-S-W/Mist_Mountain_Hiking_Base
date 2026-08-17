-- 0006_site_assets_experience_types.sql
-- Web-repo parity: the live DB already has this constraint including
-- 'mist_experience' and 'experiences' (applied via Android's
-- 20260804035136_remote_schema.sql). This migration is a safe no-op
-- against the live DB — it just records the state for web-repo history.
--
-- Drops and recreates the constraint (same pattern as 0002) since
-- ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS isn't available for
-- CHECK constraints in Postgres < 15. DROP IF EXISTS is safe.

alter table site_assets
  drop constraint if exists site_assets_type_check;

alter table site_assets
  add constraint site_assets_type_check
  check (type in ('hero', 'logo', 'footer', 'favicon', 'mist_experience', 'experiences'));
