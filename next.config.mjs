/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

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
  // Always add trailing slashes to URLs
  trailingSlash: true,
  // Configure redirects for paths without trailing slashes
  async redirects() {
    return [
      {
        source: '/cms/auth/login',
        destination: '/cms/auth/login/',
        permanent: true,
      },
      {
        source: '/api/cms/auth/login',
        destination: '/api/cms/auth/login/',
        permanent: true,
      }
    ];
  }
};

export default withNextIntl(nextConfig);
