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

export default function SubcategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params.categoryId as string;
  const subcategoryId = params.subcategoryId as string;
  const locale = params.locale as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get search parameters
  const sort = searchParams.get('sort') || undefined;
  const search = searchParams.get('q') || undefined;
  const type = searchParams.get('type') || undefined;
  
  // Get tool filters (support both single and multi-select)
  const tool = searchParams.get('tool') || undefined;
  const toolsParam = searchParams.get('tools');
  const tools = toolsParam ? toolsParam.split(',') : undefined;
  
  // Fetch category and subcategory details
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch main category
        const categoryResponse = await fetch(`/api/categories/${categoryId}?locale=${locale}`);
        if (!categoryResponse.ok) {
          throw new Error(`Failed to fetch category: ${categoryResponse.statusText}`);
        }
        const categoryData = await categoryResponse.json();
        if (categoryData.success && categoryData.data) {
          setCategory(categoryData.data);
        } else {
          throw new Error(categoryData.message || 'Failed to fetch category data');
        }
        
        // Fetch subcategory
        const subcategoryResponse = await fetch(`/api/categories/${subcategoryId}?locale=${locale}`);
        if (!subcategoryResponse.ok) {
          throw new Error(`Failed to fetch subcategory: ${subcategoryResponse.statusText}`);
        }
        const subcategoryData = await subcategoryResponse.json();
        if (subcategoryData.success && subcategoryData.data) {
          setSubcategory(subcategoryData.data);
        } else {
          throw new Error(subcategoryData.message || 'Failed to fetch subcategory data');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error instanceof Error ? error.message : 'Failed to load category data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (categoryId && subcategoryId) {
      fetchCategories();
    }
  }, [categoryId, subcategoryId, locale]);
  
  // Format the display text for the subcategory
  const getSubcategoryDisplayText = () => {
    if (isLoading) {
      return 'Loading...';
    }
    
    if (error) {
      return 'Category not found';
    }
    
    if (locale === 'ar') {
      if (category?.nameAr && subcategory?.nameAr) {
        return `${category.nameAr} / ${subcategory.nameAr}`;
      }
      return subcategory?.nameAr || 'القسم الفرعي غير موجود';
    } else {
      if (category?.nameEn && subcategory?.nameEn) {
        return `${category.nameEn} / ${subcategory.nameEn}`;
      }
      return subcategory?.nameEn || 'Subcategory not found';
    }
  };
  
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Search Section */}
      <section className="w-full rounded-lg px-1">
        <SearchSection locale={locale} />
      </section>
      
      {/* Prompts Grid Section with subcategory filter */}
      <section className="w-full">
        <h2 className="text-xl font-semibold mb-4">
          {getSubcategoryDisplayText()}
        </h2>
        <PromptsGrid 
          locale={locale}
          sort={sort as 'popular' | 'newest' | 'most_used' | undefined}
          category={categoryId}
          subcategory={subcategoryId}
          search={search}
          type={type as 'free' | 'pro' | undefined}
          tool={tool}
          tools={tools}
        />
      </section>
    </div>
  )
}
