'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { fetchPrompts } from '@/lib/api/prompts';
import { PromptCard } from './prompt-card';
import { Prompt } from '@/types/prompts';

const PROMPTS_PER_PAGE = 20;

interface PromptsGridProps {
  locale: string;
  sort?: 'popular' | 'newest' | 'most_used';
  category?: string;
  tool?: string;
  search?: string;
  type?: 'free' | 'pro';
}

export function PromptsGrid({ locale, sort, category, tool, search, type }: PromptsGridProps) {
  const { ref, inView } = useInView({
    threshold: 0.1, // Trigger when 10% of the element is visible
    rootMargin: '100px', // Start loading 100px before the element is visible
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error
  } = useInfiniteQuery({
    queryKey: ['prompts', locale, sort, category, tool, search, type],
    queryFn: ({ pageParam }) => fetchPrompts({
      page: pageParam as number ?? 1,
      limit: PROMPTS_PER_PAGE,
      sort,
      category,
      tool,
      search,
      type
    }, locale),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep cache for 30 minutes
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (error) {
    return (
      <div className="text-center py-8 text-light-grey">
        <p>Failed to load prompts. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.pages.map((page) =>
          page.prompts.map((prompt: Prompt) => (
            <PromptCard
              key={prompt.id}
              {...prompt}
              isRTL={locale === 'ar'}
            />
          ))
        )}
      </div>

      {/* Loading states */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: PROMPTS_PER_PAGE }).map((_, index) => (
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
      {!hasNextPage && data?.pages[0].prompts.length > 0 && (
        <div className="text-center py-8 text-light-grey">
          <p>No more prompts to load</p>
        </div>
      )}

      {/* No prompts found */}
      {!isLoading && data?.pages[0].prompts.length === 0 && (
        <div className="text-center py-8 text-light-grey">
          <p>No prompts found</p>
        </div>
      )}
    </div>
  );
}
