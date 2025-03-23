import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Link Sent - Promptaat',
  description: 'A password reset link has been sent to your email address. Check your inbox to complete the password reset process.',
  keywords: 'password reset, email sent, account recovery, promptaat',
  robots: {
    index: false, // Don't index this confirmation page
    follow: true,
  },
  openGraph: {
    title: 'Reset Link Sent - Promptaat',
    description: 'A password reset link has been sent to your email address. Check your inbox to complete the password reset process.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    siteName: 'Promptaat',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Promptaat Password Reset Email Sent',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reset Link Sent - Promptaat',
    description: 'A password reset link has been sent to your email address. Check your inbox to complete the password reset process.',
    images: ['/assets/og-image.jpg'],
  },
};
