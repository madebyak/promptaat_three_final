import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma/client'

// Force dynamic generation to prevent build-time database access
export const dynamic = 'force-dynamic'

type ChangeFrequency = 'daily' | 'always' | 'hourly' | 'weekly' | 'monthly' | 'yearly' | 'never';

/**
 * Generate a sitemap specifically for category and subcategory pages.
 * This helps search engines discover and index all category-related content.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL for the application
  const baseUrl = 'https://promptaat.com'
  
  // Get all categories
  const mainCategories = await prisma.category.findMany({
    where: {
      parentId: null // Only get main categories
    },
    select: {
      id: true
    }
  })
  
  // Get all subcategories
  const subcategories = await prisma.category.findMany({
    where: {
      parentId: {
        not: null // Only get subcategories
      }
    },
    select: {
      id: true,
      parentId: true
    }
  })
  
  const categoryUrls: MetadataRoute.Sitemap = []
  
  // Add category URLs for English locale
  mainCategories.forEach(category => {
    categoryUrls.push({
      url: `${baseUrl}/en/category/${category.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.8,
    })
  })
  
  // Add subcategory URLs for English locale
  subcategories.forEach(subcategory => {
    if (subcategory.parentId) {
      categoryUrls.push({
        url: `${baseUrl}/en/category/${subcategory.parentId}/subcategory/${subcategory.id}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as ChangeFrequency,
        priority: 0.7,
      })
    }
  })
  
  // Add category URLs for Arabic locale
  mainCategories.forEach(category => {
    categoryUrls.push({
      url: `${baseUrl}/ar/category/${category.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.8,
    })
  })
  
  // Add subcategory URLs for Arabic locale
  subcategories.forEach(subcategory => {
    if (subcategory.parentId) {
      categoryUrls.push({
        url: `${baseUrl}/ar/category/${subcategory.parentId}/subcategory/${subcategory.id}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as ChangeFrequency,
        priority: 0.7,
      })
    }
  })
  
  return categoryUrls
}
