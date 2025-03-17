import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma/client'

// Force dynamic generation to prevent build-time database access
export const dynamic = 'force-dynamic'

type ChangeFrequency = 'daily' | 'always' | 'hourly' | 'weekly' | 'monthly' | 'yearly' | 'never';

/**
 * Generate a specialized sitemap specifically for Arabic locale pages.
 * This provides more detailed and targeted indexing for Arabic content,
 * which is important for Arabic-speaking users and regional SEO.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL for the application
  const baseUrl = 'https://promptaat.com'
  
  // Current timestamp for lastModified
  const currentDate = new Date().toISOString()
  
  // Define static pages for Arabic locale with Arabic-specific metadata
  const arStaticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/ar`,
      lastModified: currentDate,
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ar/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ar/auth/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ar/auth/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ar/my-prompts`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.8, // Higher priority for Arabic my-prompts
    },
    {
      url: `${baseUrl}/ar/subscription`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.7, // Higher priority for Arabic subscription
    },
    {
      url: `${baseUrl}/ar/profile`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6, // Higher priority for Arabic profile
    },
  ]
  
  // Get all prompts with Arabic content
  const prompts = await prisma.prompt.findMany({
    select: {
      id: true,
      updatedAt: true
    }
  })
  
  // Add Arabic prompt URLs with Arabic-specific properties
  const arPromptUrls = prompts.map(prompt => ({
    url: `${baseUrl}/ar/prompt/${prompt.id}`,
    lastModified: prompt.updatedAt.toISOString(),
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: 0.75, // Slightly higher priority for Arabic prompts to boost Arabic SEO
  }))
  
  // Get all main categories
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
  
  // Add Arabic category URLs
  const arCategoryUrls: MetadataRoute.Sitemap = []
  
  // Add main categories
  mainCategories.forEach(category => {
    arCategoryUrls.push({
      url: `${baseUrl}/ar/category/${category.id}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.85, // Higher priority for Arabic categories
    })
  })
  
  // Add subcategories
  subcategories.forEach(subcategory => {
    if (subcategory.parentId) {
      arCategoryUrls.push({
        url: `${baseUrl}/ar/category/${subcategory.parentId}/subcategory/${subcategory.id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as ChangeFrequency,
        priority: 0.75, // Higher priority for Arabic subcategories
      })
    }
  })
  
  return [...arStaticPages, ...arPromptUrls, ...arCategoryUrls]
}
