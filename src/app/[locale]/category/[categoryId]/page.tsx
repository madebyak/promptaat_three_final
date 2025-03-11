'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { SearchSection } from '@/components/search/search-section'
import { PromptsGrid } from '@/components/prompts/prompts-grid'

interface Category {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params.categoryId as string;
  const locale = params.locale as string;
  const [category, setCategory] = useState<Category | null>(null);
  
  // Get search parameters
  const sort = searchParams.get('sort') || undefined;
  const search = searchParams.get('q') || undefined;
  const type = searchParams.get('type') || undefined;
  
  // Get tool filters (support both single and multi-select)
  const tool = searchParams.get('tool') || undefined;
  const toolsParam = searchParams.get('tools');
  const tools = toolsParam ? toolsParam.split(',') : undefined;
  
  // Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${categoryId}?locale=${locale}`);
        if (response.ok) {
          const data = await response.json();
          setCategory(data.data);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };
    
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, locale]);
  
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Search Section */}
      <section className="w-full rounded-lg px-1">
        <SearchSection locale={locale} />
      </section>
      
      {/* Prompts Grid Section with category filter */}
      <section className="w-full">
        <h2 className="text-xl font-semibold mb-4">
          {locale === 'ar' 
            ? `تصفح محتوى القسم: ${category?.nameAr || category?.name || categoryId}` 
            : `Browse Category: ${category?.nameEn || category?.name || categoryId}`}
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
