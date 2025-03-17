import { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import AuthSessionProvider from '@/components/auth/auth-session-provider'
import './globals.css'
import Script from 'next/script'

// Optimize font loading with display: swap to prevent blocking render
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  title: {
    default: 'Promptaat - Your AI Prompt Library',
    template: '%s | Promptaat'
  },
  description: 'Discover and use the best AI prompts for ChatGPT, Gemini, Claude and more. Find prompts for business, writing, creativity, and productivity.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#ffffff',
  metadataBase: new URL('https://promptaat.com'),
  keywords: ['AI prompts', 'ChatGPT prompts', 'prompt library', 'AI assistant prompts', 'generative AI', 'prompt engineering'],
  applicationName: 'Promptaat',
  creator: 'Promptaat Team',
  publisher: 'Promptaat',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32px.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/favicon-16px.jpg', sizes: '16x16', type: 'image/jpeg' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon-32px.jpg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: {
      default: 'Promptaat - Your AI Prompt Library',
      template: '%s | Promptaat'
    },
    description: 'Discover and use the best AI prompts for ChatGPT, Gemini, Claude and more. Find prompts for business, writing, creativity, and productivity.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    url: 'https://promptaat.com',
    siteName: 'Promptaat',
    images: [
      {
        url: '/og/home-og-en.jpg',
        width: 1200,
        height: 630,
        alt: 'Promptaat - Your AI Prompt Library',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Promptaat - Your AI Prompt Library',
    description: 'Discover and use the best AI prompts for ChatGPT, Gemini, Claude and more.',
    images: ['/og/home-og-en.jpg'],
  },
  verification: {
    google: 'google-site-verification-code', // Replace with your verification code
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload hints for critical CSS */}
        <link rel="preload" href="/globals.css" as="style" />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <AuthSessionProvider>
          {children}
          <Toaster />
          <SpeedInsights />
        </AuthSessionProvider>
        
        {/* Add performance optimization script */}
        <Script id="performance-optimization" strategy="afterInteractive">
          {`
            // Optimize LCP by marking visual completeness when banner loads
            document.addEventListener('DOMContentLoaded', () => {
              const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                  // Report LCP to console for debugging
                  if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.startTime, entry.element);
                  }
                });
              });
              observer.observe({ type: 'largest-contentful-paint', buffered: true });
            });
          `}
        </Script>
      </body>
    </html>
  )
}
