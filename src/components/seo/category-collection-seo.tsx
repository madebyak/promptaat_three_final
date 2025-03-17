'use client'

import React from 'react'

interface CategoryItem {
  id: string
  name: string
  url: string
  description?: string
  imageUrl?: string
}

interface CategoryCollectionStructuredDataProps {
  categoryName: string
  description: string
  categoryItems: CategoryItem[]
  locale: string
  url: string
}

/**
 * Component that provides structured data for collection pages (categories)
 * Implements JSON-LD schema.org markup for CollectionPage and ItemList
 */
export function CategoryCollectionStructuredData({
  categoryName,
  description,
  categoryItems,
  locale,
  url
}: CategoryCollectionStructuredDataProps) {
  const baseUrl = 'https://promptaat.com'
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: categoryName,
          description: description,
          url: url,
          inLanguage: locale === 'ar' ? 'ar' : 'en',
          isPartOf: {
            '@type': 'WebSite',
            url: baseUrl,
            name: locale === 'ar' ? 'برومبتات - مكتبة بروبتات الذكاء الاصطناعي' : 'Promptaat - AI Prompt Library',
          },
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: categoryItems.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Product',
                name: item.name,
                url: item.url,
                ...(item.description && { description: item.description }),
                ...(item.imageUrl && { image: item.imageUrl })
              }
            }))
          },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: locale === 'ar' ? 'الرئيسية' : 'Home',
                item: `${baseUrl}/${locale}`
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: categoryName,
                item: url
              }
            ]
          }
        }),
      }}
    />
  )
}
