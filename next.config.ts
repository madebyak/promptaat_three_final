import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'vercel.app', 'promptaat.com'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Note: Next.js 13+ App Router handles i18n differently than Pages Router
  // The [locale] directory pattern is the recommended approach
};

export default nextConfig;
