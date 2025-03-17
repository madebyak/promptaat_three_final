import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma/client'

type ChangeFrequency = 'daily' | 'always' | 'hourly' | 'weekly' | 'monthly' | 'yearly' | 'never';

/**
 * Generate a sitemap specifically for prompt pages.
 * This helps search engines discover and index all prompt content efficiently.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL for the application
  const baseUrl = 'https://promptaat.com'
  
  // Get all prompts
  // Since we're not sure if the published field exists in the schema,
  // we'll just get all prompts and assume they should be indexed
  const prompts = await prisma.prompt.findMany({
    select: {
      id: true,
      updatedAt: true
    }
  })
  
  const promptUrls: MetadataRoute.Sitemap = []
  
  // Add prompt URLs for English locale
  prompts.forEach(prompt => {
    promptUrls.push({
      url: `${baseUrl}/en/prompt/${prompt.id}`,
      lastModified: prompt.updatedAt.toISOString(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.7,
    })
  })
  
  // Add prompt URLs for Arabic locale
  prompts.forEach(prompt => {
    promptUrls.push({
      url: `${baseUrl}/ar/prompt/${prompt.id}`,
      lastModified: prompt.updatedAt.toISOString(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.7,
    })
  })
  
  return promptUrls
}
