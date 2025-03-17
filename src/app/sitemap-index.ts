import { MetadataRoute } from 'next'

/**
 * Generate a sitemap index that links to all other sitemaps.
 * This file organizes multiple sitemaps into a hierarchy,
 * which is recommended for sites with many pages.
 */
export default function sitemapIndex(): MetadataRoute.Sitemap {
  // Base URL for the application
  const baseUrl = 'https://promptaat.com'
  
  // Current timestamp for lastModified
  const currentDate = new Date().toISOString()
  
  return [
    {
      url: `${baseUrl}/sitemap.xml`,
      lastModified: currentDate,
    },
    {
      url: `${baseUrl}/sitemap-categories.xml`,
      lastModified: currentDate,
    },
    {
      url: `${baseUrl}/sitemap-prompts.xml`,
      lastModified: currentDate,
    },
    {
      url: `${baseUrl}/sitemap-static.xml`,
      lastModified: currentDate,
    },
    {
      url: `${baseUrl}/sitemap-ar.xml`,
      lastModified: currentDate,
    },
  ]
}
