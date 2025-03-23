import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - Promptaat',
  description: 'Create a new secure password for your Promptaat account and regain access to your AI prompts and tools',
  keywords: 'reset password, new password, account security, promptaat',
  robots: {
    index: false, // Don't index the reset password page for security
    follow: true,
  },
  openGraph: {
    title: 'Reset Password - Promptaat',
    description: 'Create a new secure password for your Promptaat account and regain access to your AI prompts and tools',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    siteName: 'Promptaat',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Promptaat Reset Password',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reset Password - Promptaat',
    description: 'Create a new secure password for your Promptaat account and regain access to your AI prompts and tools',
    images: ['/assets/og-image.jpg'],
  },
};
