import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/lunastar",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Force rebuild v2
};

export default nextConfig;
