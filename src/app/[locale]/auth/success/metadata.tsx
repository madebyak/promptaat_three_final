import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication Success - Promptaat',
  description: 'You have successfully authenticated with Promptaat. Start exploring AI prompts and tools to enhance your productivity.',
  keywords: 'authentication success, login success, account access, promptaat',
  robots: {
    index: false, // Don't index success pages
    follow: true,
  },
  openGraph: {
    title: 'Authentication Success - Promptaat',
    description: 'You have successfully authenticated with Promptaat. Start exploring AI prompts and tools to enhance your productivity.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    siteName: 'Promptaat',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Promptaat Authentication Success',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Authentication Success - Promptaat',
    description: 'You have successfully authenticated with Promptaat. Start exploring AI prompts and tools to enhance your productivity.',
    images: ['/assets/og-image.jpg'],
  },
};
