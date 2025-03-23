import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Promptaat',
  description: 'Sign in to your Promptaat account and access your personalized AI prompts, tools, and resources',
  keywords: 'login, sign in, promptaat account, AI prompts, prompt engineering',
  openGraph: {
    title: 'Sign In - Promptaat',
    description: 'Sign in to your Promptaat account and access your personalized AI prompts, tools, and resources',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    siteName: 'Promptaat',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Promptaat Sign In',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In - Promptaat',
    description: 'Sign in to your Promptaat account and access your personalized AI prompts, tools, and resources',
    images: ['/assets/og-image.jpg'],
  },
};
