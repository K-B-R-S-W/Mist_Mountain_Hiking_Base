-- Add favicon as an allowed site_assets type.
-- Keep existing types for backward compatibility.

alter table site_assets
  drop constraint if exists site_assets_type_check;

alter table site_assets
  add constraint site_assets_type_check
  check (type in ('hero', 'logo', 'footer', 'favicon'));
