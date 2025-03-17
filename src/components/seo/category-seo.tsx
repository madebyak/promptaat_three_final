'use client'

import React from 'react'
import { BreadcrumbSchema } from './json-ld'

interface CategorySEOProps {
  categoryId: string
  categoryName: string
  subcategoryId?: string
  subcategoryName?: string
  locale: string
}

/**
 * Client component that provides structured data markup for category pages
 * Implements breadcrumb schema for better search engine understanding of site hierarchy
 */
export function CategorySEO({ 
  categoryId, 
  categoryName, 
  subcategoryId, 
  subcategoryName,
  locale 
}: CategorySEOProps) {
  const baseUrl = 'https://promptaat.com'
  const localePath = `/${locale}`
  
  // Create breadcrumb items based on the current page hierarchy
  const breadcrumbItems = [
    {
      name: locale === 'ar' ? 'الرئيسية' : 'Home',
      item: `${baseUrl}${localePath}`,
      position: 1
    },
    {
      name: categoryName,
      item: `${baseUrl}${localePath}/category/${categoryId}`,
      position: 2
    }
  ]
  
  // Add subcategory to breadcrumbs if present
  if (subcategoryId && subcategoryName) {
    breadcrumbItems.push({
      name: subcategoryName,
      item: `${baseUrl}${localePath}/category/${categoryId}/subcategory/${subcategoryId}`,
      position: 3
    })
  }
  
  return (
    <BreadcrumbSchema items={breadcrumbItems} />
  )
}
