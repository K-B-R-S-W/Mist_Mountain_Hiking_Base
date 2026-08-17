-- About page content, editable from /admin/settings.
--
-- Fixed set of sections (not a dynamic array/table) — matches how every
-- other part of site_settings works, and the About page's section order
-- isn't something that needs reordering from the admin. Stored as
-- sanitized HTML (bold/italic/lists only — see
-- lib/validation/sanitize-rich-text.ts); sanitization happens server-side
-- on save, never on render, so a change to the allowlist can't retroactively
-- leave old rows holding disallowed markup.
--
-- All default '' (not null) so getSiteSettings() can treat "empty string"
-- as "not filled in yet" without a null-check, and the public /about page
-- falls back to its existing static copy per section until an admin fills
-- each one in.

alter table site_settings
  add column if not exists about_intro text not null default '',
  add column if not exists about_different text not null default '',
  add column if not exists about_land text not null default '',
  add column if not exists about_location text not null default '',
  add column if not exists about_who_for text not null default '',
  add column if not exists about_team text not null default '',
  add column if not exists about_sustainability text not null default '';

comment on column site_settings.about_intro is
  'About page: story/intro section. Sanitized HTML (p/strong/em/ul/ol/li/br/h3 only).';
comment on column site_settings.about_different is
  'About page: "What makes it different" section. Sanitized HTML.';
comment on column site_settings.about_land is
  'About page: plantation/crops section. Sanitized HTML.';
comment on column site_settings.about_location is
  'About page: location & access section. Sanitized HTML.';
comment on column site_settings.about_who_for is
  'About page: who it is for / target guest section. Sanitized HTML.';
comment on column site_settings.about_team is
  'About page: local team section. Sanitized HTML.';
comment on column site_settings.about_sustainability is
  'About page: sustainability section. Sanitized HTML.';
