import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Restrict remote images to the Supabase Storage project once the
    // project ref is known — placeholder until env is provisioned.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // Next's default Server Action body cap is 1MB. lib/media/upload.ts
      // already enforces its own 8MB-per-file ceiling (MAX_FILE_BYTES) —
      // this just raises the framework limit so that check is the one
      // that actually fires, instead of Next rejecting the request first.
      // A little headroom over 8MB covers multipart/form-data overhead.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;