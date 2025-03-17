import { MetadataRoute } from 'next'

type ChangeFrequency = 'daily' | 'always' | 'hourly' | 'weekly' | 'monthly' | 'yearly' | 'never';

/**
 * Generate a sitemap for static pages in the application.
 * This covers key pages like home, pricing, auth pages, etc.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL for the application
  const baseUrl = 'https://promptaat.com'
  
  // Current timestamp for lastModified
  const currentDate = new Date().toISOString()
  
  // Define static pages for English locale
  const enStaticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/en`,
      lastModified: currentDate,
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/auth/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/auth/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/my-prompts`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/en/subscription`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/en/profile`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.5,
    },
  ]
  
  // Define static pages for Arabic locale
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
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ar/subscription`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ar/profile`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.5,
    },
  ]
  
  return [...enStaticPages, ...arStaticPages]
}
