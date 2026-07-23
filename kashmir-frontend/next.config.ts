import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // jose v6 is pure ESM — tell Next.js not to bundle it so Node.js can resolve it natively.
  serverExternalPackages: ['jose'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80, 85, 88, 90],
  },

  /* Backend now lives in same-origin Next.js API routes under src/app/api.
     No proxy/rewrite needed — there is no separate backend server. */
};

export default nextConfig;
