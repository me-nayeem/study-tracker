import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 is for the dashboard subject illustrations; everything else uses the default 75
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
