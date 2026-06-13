import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/livetv",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
