import { Suspense } from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic imports for better performance
const FeatureRequestList = dynamic(
  () => import('@/components/cms/feature-requests/feature-request-list'),
  { ssr: true }
)

export const metadata: Metadata = {
  title: 'Feature Requests | Promptaat CMS',
  description: 'Manage feature and prompt requests from users',
}

export default function FeatureRequestsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Feature Requests</h1>
        <p className="text-muted-foreground">
          Manage feature and prompt requests submitted by users.
        </p>
      </div>
      
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-accent-purple animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading feature requests...</p>
        </div>
      }>
        <FeatureRequestList locale="en" />
      </Suspense>
    </div>
  )
}
