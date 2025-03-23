import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verification Pending - Promptaat',
  description: 'Your Promptaat account is awaiting verification. Please check your email to complete the verification process.',
  keywords: 'email verification, account verification, pending verification, promptaat',
  robots: {
    index: false, // Don't index verification pages
    follow: true,
  },
  openGraph: {
    title: 'Verification Pending - Promptaat',
    description: 'Your Promptaat account is awaiting verification. Please check your email to complete the verification process.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    siteName: 'Promptaat',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Promptaat Account Verification',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verification Pending - Promptaat',
    description: 'Your Promptaat account is awaiting verification. Please check your email to complete the verification process.',
    images: ['/assets/og-image.jpg'],
  },
};
