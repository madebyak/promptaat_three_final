import { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import AuthSessionProvider from '@/components/auth/auth-session-provider'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export const metadata: Metadata = {
  title: 'Promptaat',
  description: 'Your AI Prompt Library',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <AuthSessionProvider>
          {children}
          <Toaster />
          <SpeedInsights />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
