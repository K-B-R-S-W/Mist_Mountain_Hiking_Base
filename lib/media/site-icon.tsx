import { ImageResponse } from "next/og";
import { getSiteBranding } from "@/lib/repositories";

/**
 * Serves the admin-uploaded favicon (site_assets type="favicon") as the
 * app icon at whatever size Next.js asks for. Falls back to a generated
 * brand-mark ("M" on forest green) so the site never ships a broken or
 * default Vercel icon before an admin uploads one.
 *
 * Used by app/icon.tsx (32x32) and app/apple-icon.tsx (180x180) — same
 * source, different requested size.
 */
export async function renderSiteIcon(size: { width: number; height: number }) {
  const { faviconUrl } = await getSiteBranding();

  if (faviconUrl) {
    try {
      const res = await fetch(faviconUrl, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return new Response(buffer, {
          headers: {
            "Content-Type": res.headers.get("content-type") ?? "image/png",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    } catch {
      // fall through to the generated placeholder below
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#163126",
          color: "#F8F6F2",
          fontFamily: "serif",
          fontSize: size.width * 0.6,
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
