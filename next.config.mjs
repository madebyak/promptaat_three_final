/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

// Create the next-intl plugin with the config file path
const withNextIntl = createNextIntlPlugin('./next-intl.config.ts');

const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: false, // Keep console logs for debugging
  },
  // Enable image optimization
  experimental: {
    optimizeCss: true,
  },
  // Add headers configuration to fix caching issues
  async headers() {
    return [
      {
        // Matching all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          }
        ],
      },
      {
        // Matching all favicon and OpenGraph image requests
        source: '/(favicon.ico|og/:path*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          }
        ],
      },
      {
        // Add CORS headers for all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          }
        ],
      },
    ];
  },
  // Configure image domains to allow external images
  images: {
    // Allow images from any domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 60,
  },
  // Don't force trailing slashes to prevent redirect loops
  trailingSlash: false,
  // Explicitly handle CMS routes and add proper rewrites
  async rewrites() {
    return [
      {
        source: '/cms/:path*',
        destination: '/cms/:path*',
      },
      // Add rewrites for home page to ensure proper loading
      {
        source: '/',
        destination: '/en',
        locale: false,
      },
    ];
  },
  // Add proper asset prefix for production
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://www.promptaat.com' : undefined,
  // Increase the output file tracing to include all files
  output: 'standalone',
};

export default withNextIntl(nextConfig);
