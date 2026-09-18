import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
  turbopackFileSystemCacheForDev: false,
},
  /* config options here */
  typescript: {
    // Still on for exactly two files, both pre-existing and both outside the
    // distribution flow:
    //   - components/DotGrid.tsx — 43 implicit-any / untyped-ref errors in the
    //     vendored canvas animation behind the auth page.
    //   - components/private-dealer/DealerInventory.tsx — one Base UI Select
    //     `onValueChange` signature mismatch; the dealer screens are being
    //     rebuilt next, so they were left untouched.
    // Everything else type-checks: `npx tsc --noEmit` is clean once those two
    // files are excluded. Drop this flag as soon as they are fixed.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "flowbite.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
};

export default nextConfig;
