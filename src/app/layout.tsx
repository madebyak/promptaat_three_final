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
  title: 'Promptaat',
  description: 'Your AI Prompt Library',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#ffffff',
  metadataBase: new URL('https://promptaat.com'),
  openGraph: {
    title: 'Promptaat',
    description: 'Your AI Prompt Library',
    type: 'website',
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
