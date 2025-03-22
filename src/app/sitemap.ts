import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma/client'
import type { Category, Blog } from '@prisma/client'

// Force dynamic generation to prevent build-time database access
export const dynamic = 'force-dynamic'

/**
 * Dynamic sitemap generator for Promptaat
 * This creates a sitemap.xml file that helps search engines discover and index your content
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all categories
  const categories = await prisma.category.findMany({
    where: {
      parentId: null // Only get parent categories
    },
    include: {
      children: true // Include subcategories
    }
  }) as (Category & { children: Category[] })[]

  // Get blog posts for sitemap
  const blogs = await prisma.blog.findMany({
    where: {
      status: 'published'
    },
    select: {
      slug: true,
      updatedAt: true
    }
  }) as Pick<Blog, 'slug' | 'updatedAt'>[];

  const baseUrl = 'https://promptaat.com'
  
  // Static pages
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ar/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ar/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ar/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    // Resource pages
    {
      url: `${baseUrl}/en/resources/benchmark`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ar/resources/benchmark`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ar/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ar/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ar/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Category pages - for both English and Arabic
  const categoryPages = categories.flatMap((category) => {
    const routes = [
      // Main category page - English
      {
        url: `${baseUrl}/en/category/${category.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      // Main category page - Arabic
      {
        url: `${baseUrl}/ar/category/${category.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    ]

    // Add subcategory pages if they exist
    if (category.children && category.children.length > 0) {
      category.children.forEach((subcategory) => {
        // Subcategory page - English
        routes.push({
          url: `${baseUrl}/en/category/${category.id}/subcategory/${subcategory.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
        
        // Subcategory page - Arabic
        routes.push({
          url: `${baseUrl}/ar/category/${category.id}/subcategory/${subcategory.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      })
    }

    return routes
  })

  // Blog posts pages
  const blogPages = blogs.flatMap((blog: Pick<Blog, 'slug' | 'updatedAt'>) => [
    // English blog post
    {
      url: `${baseUrl}/en/blogs/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    // Arabic blog post
    {
      url: `${baseUrl}/ar/blogs/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }
  ])

  return [...staticPages, ...categoryPages, ...blogPages]
}
