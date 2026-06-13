import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/pokemon",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
