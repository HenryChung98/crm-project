import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // for faster development restarts
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  // enables Cache Components for explicit caching control
  cacheComponents: true,
};

export default nextConfig;
