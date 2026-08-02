/**
 * Expects the admin to have pasted a proper Maps "Embed a map" src URL
 * (see settings page helper text). Also tolerates someone pasting the
 * whole <iframe> snippet by mistake and pulls the src out of it, and
 * falls back to a plain address-search embed (no API key needed) if
 * what's stored doesn't look like an embed URL at all — a bare "share"
 * link (e.g. share.google/... or a maps.app.goo.gl short link) can't be
 * used as an iframe src directly, since Google serves those as
 * redirects rather than embeddable pages.
 */
function resolveEmbedSrc(googleMapsUrl: string | null, address: string | null): string | null {
  if (googleMapsUrl) {
    const iframeMatch = googleMapsUrl.match(/src=["']([^"']+)["']/);
    const candidate = iframeMatch?.[1] ?? googleMapsUrl;
    if (candidate.includes("/maps/embed")) return candidate;
  }
  if (address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }
  return null;
}

export function GoogleMap({
  googleMapsUrl,
  address,
  title,
}: {
  googleMapsUrl: string | null;
  address: string | null;
  title: string;
}) {
  const src = resolveEmbedSrc(googleMapsUrl, address);

  if (!src) {
    return (
      <div className="card flex min-h-[260px] items-center justify-center text-sm text-muted">
        Map unavailable — add a Google Maps embed URL in Settings.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-black/8">
      <iframe
        src={src}
        title={`Map to ${title}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[320px] w-full md:h-[380px]"
      />
    </div>
  );
}
