import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an Account - Promptaat',
  description: 'Join Promptaat and create your account to access premium AI prompts, tools, and resources for enhancing your productivity',
  keywords: 'register, sign up, create account, promptaat, AI prompts, prompt engineering',
  openGraph: {
    title: 'Create an Account - Promptaat',
    description: 'Join Promptaat and create your account to access premium AI prompts, tools, and resources for enhancing your productivity',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    siteName: 'Promptaat',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Promptaat Registration',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create an Account - Promptaat',
    description: 'Join Promptaat and create your account to access premium AI prompts, tools, and resources for enhancing your productivity',
    images: ['/assets/og-image.jpg'],
  },
};
