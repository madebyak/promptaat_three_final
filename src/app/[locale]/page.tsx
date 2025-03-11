"use client";

import { Suspense, useEffect, useState } from "react";
import { Banner } from "@/components/layout/main-content/banner"
import { SearchSection } from "@/components/search/search-section"
import { PromptsGrid } from '@/components/prompts/prompts-grid'
import { useParams, useSearchParams } from "next/navigation"

// Loading fallback for PromptsGrid
const PromptsGridFallback = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="h-48 rounded-lg bg-light-grey-light dark:bg-dark-grey animate-pulse"
      />
    ))}
  </div>
);

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  
  // Track if this is the initial render for performance optimization
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  // Get search parameters
  const sort = searchParams.get('sort') || undefined;
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('q') || undefined;
  const type = searchParams.get('type') || undefined;
  
  // Get tool filters (support both single and multi-select)
  const tool = searchParams.get('tool') || undefined;
  const toolsParam = searchParams.get('tools');
  const tools = toolsParam ? toolsParam.split(',') : undefined;
  
  // Mark initial render complete after component mounts
  useEffect(() => {
    // Use requestIdleCallback to defer non-critical work
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      // Define the type for requestIdleCallback
      interface Window {
        requestIdleCallback(callback: () => void): number;
      }
      (window as Window).requestIdleCallback(() => {
        setIsInitialRender(false);
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => setIsInitialRender(false), 200);
    }
    
    // Add performance mark for debugging
    if (typeof performance !== 'undefined') {
      performance.mark('page-rendered');
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Banner Section - High priority */}
      <Banner locale={locale} />

      {/* Search Section - Medium priority */}
      <section className="w-full rounded-lg px-1">
        <SearchSection locale={locale} />
      </section>
      
      {/* Prompts Grid Section - Lower priority, can be deferred */}
      <section className="w-full">
        <Suspense fallback={<PromptsGridFallback />}>
          {/* Only render the full grid after initial render to improve LCP */}
          {isInitialRender ? (
            <PromptsGridFallback />
          ) : (
            <PromptsGrid 
              locale={locale}
              sort={sort as 'popular' | 'newest' | 'most_used' | undefined}
              category={category}
              search={search}
              type={type as 'free' | 'pro' | undefined}
              tool={tool}
              tools={tools}
            />
          )}
        </Suspense>
      </section>
    </div>
  )
}
