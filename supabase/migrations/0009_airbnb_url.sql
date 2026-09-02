-- Add airbnb_url to site_settings
alter table site_settings
  add column if not exists airbnb_url text;

comment on column site_settings.airbnb_url is
  'Direct Airbnb listing / host portal URL for the property. Displayed next to Booking.com in headers, footers, and booking pages.';
