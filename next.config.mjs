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
  // Enable performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable image optimization
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  // Configure image domains to allow external images
  images: {
    // Allow images from any domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '/**',
      }
    ],
    // Keep the domains for backward compatibility
    domains: [
      's3-us-west-2.amazonaws.com',
      'via.placeholder.com',
      'placehold.co',
      'encrypted-tbn0.gstatic.com'
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Don't force trailing slashes to prevent redirect loops
  trailingSlash: false,
  // Explicitly handle CMS routes
  async rewrites() {
    return [
      {
        source: '/cms/:path*',
        destination: '/cms/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
