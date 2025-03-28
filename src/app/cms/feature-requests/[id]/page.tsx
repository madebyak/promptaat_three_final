import { Suspense } from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic imports for better performance
const FeatureRequestDetail = dynamic(
  () => import('@/components/cms/feature-requests/feature-request-detail'),
  { ssr: true }
)

export const metadata: Metadata = {
  title: 'Feature Request Details | Promptaat CMS',
  description: 'View and manage feature request details',
}

interface FeatureRequestDetailPageProps {
  params: {
    id: string
  }
}

export default function FeatureRequestDetailPage({ params }: FeatureRequestDetailPageProps) {
  const { id } = params
  
  return (
    <div className="container py-6 space-y-6">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-accent-purple animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading feature request details...</p>
        </div>
      }>
        <FeatureRequestDetail id={id} locale="en" />
      </Suspense>
    </div>
  )
}
