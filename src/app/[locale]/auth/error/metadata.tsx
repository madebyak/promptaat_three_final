import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication Error - Promptaat',
  description: 'An error occurred during the authentication process. Please try again or contact support.',
  keywords: 'authentication error, login error, sign in problem, promptaat',
  robots: {
    index: false, 
    follow: true,
  },
  openGraph: {
    title: 'Authentication Error - Promptaat',
    description: 'An error occurred during the authentication process. Please try again or contact support.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    siteName: 'Promptaat',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Promptaat Authentication Error',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Authentication Error - Promptaat',
    description: 'An error occurred during the authentication process. Please try again or contact support.',
    images: ['/assets/og-image.jpg'],
  },
};
