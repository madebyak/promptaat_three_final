'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect, useCallback, memo } from 'react';
import { fetchPrompts } from '@/lib/api/prompts';
import { PromptCard } from './prompt-card';
import { Prompt } from '@/types/prompts';

const PROMPTS_PER_PAGE = 20;

interface PromptsGridProps {
  locale: string;
  sort?: 'popular' | 'newest' | 'most_used';
  category?: string;
  subcategory?: string;
  tool?: string;       // Single tool (legacy support)
  tools?: string[];    // Multiple tools (new implementation)
  search?: string;
  type?: 'free' | 'pro';
}

// Memoize the PromptCard component to prevent unnecessary re-renders
const MemoizedPromptCard = memo(PromptCard);

export function PromptsGrid({ locale, sort, category, subcategory, tool, tools, search, type }: PromptsGridProps) {
  const { ref, inView } = useInView({
    threshold: 0.1, // Trigger when 10% of the element is visible
    rootMargin: '200px', // Start loading 200px before the element is visible to improve perceived performance
    triggerOnce: false,
  });

  // Memoize the query function to prevent unnecessary re-renders
  const queryFn = useCallback(({ pageParam }: { pageParam: number | undefined }) => fetchPrompts({
    page: pageParam as number ?? 1,
    limit: PROMPTS_PER_PAGE,
    sort,
    category,
    subcategory,
    tool,        // Keep for backward compatibility
    tools,       // Add support for multiple tools
    search,
    type
  }, locale), [locale, sort, category, subcategory, tool, tools, search, type]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error
  } = useInfiniteQuery({
    queryKey: ['prompts', locale, sort, category, subcategory, tool, tools, search, type],
    queryFn,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes to reduce API calls
    gcTime: 60 * 60 * 1000, // Keep cache for 60 minutes
    refetchOnWindowFocus: false, // Don't refetch when window is focused
    refetchOnMount: false, // Don't refetch when component is mounted
  });

  // Optimize the effect to reduce unnecessary renders
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      // Add a small delay to prevent rapid fetches when scrolling quickly
      const timeoutId = setTimeout(() => {
        fetchNextPage();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (error) {
    return (
      <div className="text-center py-8 text-light-grey">
        <p>Failed to load prompts. Please try again.</p>
      </div>
    );
  }

  const hasPrompts = data?.pages[0]?.prompts.length ?? 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {data?.pages.map((page, pageIndex) =>
          page.prompts.map((prompt: Prompt, promptIndex) => (
            <MemoizedPromptCard
              key={prompt.id}
              {...prompt}
              isRTL={locale === 'ar'}
              locale={locale}
              // Only load the first page eagerly, lazy load the rest
              loading={pageIndex === 0 && promptIndex < 6 ? "eager" : "lazy"}
            />
          ))
        )}
      </div>

      {/* Loading states */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Only show 6 skeleton cards instead of 20 to improve initial load performance */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-48 rounded-lg bg-light-grey-light dark:bg-dark-grey animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Load more trigger */}
      {!isLoading && hasNextPage && (
        <div ref={ref} className="h-10 flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="w-6 h-6 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* No more prompts */}
      {!isLoading && !hasNextPage && hasPrompts > 0 && (
        <div className="text-center py-8 text-light-grey">
          <p>No more prompts to load</p>
        </div>
      )}

      {/* No prompts found */}
      {!isLoading && hasPrompts === 0 && (
        <div className="text-center py-8 text-light-grey">
          <p>No prompts found</p>
        </div>
      )}
    </div>
  );
}
