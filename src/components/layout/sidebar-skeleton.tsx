import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SidebarSkeletonProps {
  locale?: string
  isCollapsed?: boolean
}

export function SidebarSkeleton({ locale = 'en', isCollapsed = false }: SidebarSkeletonProps) {
  const isRTL = locale === 'ar'

  if (isCollapsed) {
    return (
      <div className="py-2 space-y-4">
        {/* All Categories Skeleton */}
        <div className="flex justify-center p-2">
          <Skeleton className="h-4 w-4 rounded-sm" /> {/* Icon */}
        </div>

        {/* Category Items */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex justify-center p-2">
            <Skeleton className="h-4 w-4 rounded-sm" /> {/* Icon */}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="py-2 space-y-2">
      {/* All Categories Skeleton */}
      <div className={cn(
        "flex items-center gap-3 p-2 rounded-md",
        isRTL ? "flex-row-reverse" : "flex-row"
      )}>
        <Skeleton className="h-4 w-4 rounded-sm" /> {/* Icon */}
        <Skeleton className="h-4 flex-1 rounded-sm" /> {/* Text */}
      </div>

      {/* Category Items */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          {/* Category */}
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-md",
            isRTL ? "flex-row-reverse" : "flex-row"
          )}>
            <Skeleton className="h-4 w-4 rounded-sm" /> {/* Icon */}
            <Skeleton className="h-4 flex-1 rounded-sm" /> {/* Text */}
            <Skeleton className="h-4 w-4 rounded-sm" /> {/* Chevron */}
          </div>

          {/* Subcategories - show for some categories */}
          {i % 2 === 0 && (
            <div className={cn(
              "space-y-2",
              isRTL ? "pr-10" : "pl-10"
            )}>
              {[...Array(3)].map((_, j) => (
                <div key={j} className={cn(
                  "flex items-center gap-3 p-2",
                  isRTL ? "flex-row-reverse" : "flex-row"
                )}>
                  <Skeleton className="h-3 w-3 rounded-sm" /> {/* Icon */}
                  <Skeleton className="h-3 flex-1 rounded-sm" /> {/* Subcategory text */}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
