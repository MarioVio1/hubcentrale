import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/libri",
  // Configurazione per gestire file statici grandi (EPUB/PDF)
  experimental: {
    // Abilita ottimizzazioni per file statici
    optimizePackageImports: ['epubjs', 'pdfjs-dist'],
  },
  // Configurazione per headers
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
