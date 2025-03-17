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
    default: 'Promptaat | The Largest AI Prompt Library',
    template: '%s | Promptaat'
  },
  description: 'In an era where AI is reshaping creativity, crafting effective prompts can be overwhelming. Promptaat\'s vast, engineered collection saves you time—just copy and paste to fuel your ideas, letting you focus on the details that matter.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#ffffff',
  metadataBase: new URL('https://promptaat.com'),
  keywords: ['AI Prompts', 'ChatGPT Prompts', 'Top Prompts', 'Advance Prompt', 'Claude AI Prompts', 'Cursor AI Prompts', 'Wind Surf Prompts', 'Gemini Prompts', 'Professional Prompts', 'Marketing Prompts', 'Content writing prompts', 'Best prompts'],
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
      default: 'Promptaat | The Largest AI Prompt Library',
      template: '%s | Promptaat'
    },
    description: 'In an era where AI is reshaping creativity, crafting effective prompts can be overwhelming. Promptaat\'s vast, engineered collection saves you time—just copy and paste to fuel your ideas, letting you focus on the details that matter.',
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
        alt: 'Promptaat | The Largest AI Prompt Library',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Promptaat | The Largest AI Prompt Library',
    description: 'In an era where AI is reshaping creativity, crafting effective prompts can be overwhelming. Promptaat\'s vast collection saves you time with one-click solutions.',
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
