import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email - Promptaat',
  description: 'Verify your email address to activate your Promptaat account and access all features',
  keywords: 'email verification, account activation, verify account, promptaat',
  robots: {
    index: false, // Don't index verification pages for security
    follow: true,
  },
  openGraph: {
    title: 'Verify Email - Promptaat',
    description: 'Verify your email address to activate your Promptaat account and access all features',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    siteName: 'Promptaat',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Promptaat Email Verification',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verify Email - Promptaat',
    description: 'Verify your email address to activate your Promptaat account and access all features',
    images: ['/assets/og-image.jpg'],
  },
};
