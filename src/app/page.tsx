import { redirect } from 'next/navigation'

// This is the root page that redirects to the default locale (English)
export default function RootPage() {
  // Redirect to the English version by default
  redirect('/en')
  
  // This return is never reached due to the redirect
  return null
}
