'use client'

import React from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { SearchSection } from '@/components/search/search-section'
import { PromptsGrid } from '@/components/prompts/prompts-grid'

export default function SubcategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params.categoryId as string;
  const subcategoryId = params.subcategoryId as string;
  const locale = params.locale as string;
  
  // Get search parameters
  const sort = searchParams.get('sort') || undefined;
  const search = searchParams.get('q') || undefined;
  const type = searchParams.get('type') || undefined;
  
  // Get tool filters (support both single and multi-select)
  const tool = searchParams.get('tool') || undefined;
  const toolsParam = searchParams.get('tools');
  const tools = toolsParam ? toolsParam.split(',') : undefined;
  
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Search Section */}
      <section className="w-full rounded-lg px-1">
        <SearchSection locale={locale} />
      </section>
      
      {/* Prompts Grid Section with subcategory filter */}
      <section className="w-full">
        <h2 className="text-xl font-semibold mb-4">
          {locale === 'ar' ? `تصفح محتوى القسم الفرعي: ${subcategoryId}` : `Browse Subcategory: ${subcategoryId}`}
        </h2>
        <PromptsGrid 
          locale={locale}
          sort={sort as 'popular' | 'newest' | 'most_used' | undefined}
          category={categoryId}
          search={search}
          type={type as 'free' | 'pro' | undefined}
          tool={tool}
          tools={tools}
        />
      </section>
    </div>
  )
}
