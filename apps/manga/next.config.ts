import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/manga",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
