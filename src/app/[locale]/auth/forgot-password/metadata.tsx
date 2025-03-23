import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password - Promptaat',
  description: 'Reset your Promptaat account password securely and quickly to regain access to your account',
  keywords: 'forgot password, reset password, account recovery, promptaat',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Forgot Password - Promptaat',
    description: 'Reset your Promptaat account password securely and quickly to regain access to your account',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    siteName: 'Promptaat',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Promptaat Password Reset',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forgot Password - Promptaat',
    description: 'Reset your Promptaat account password securely and quickly to regain access to your account',
    images: ['/assets/og-image.jpg'],
  },
};
