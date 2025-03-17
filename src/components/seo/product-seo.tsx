'use client'

import React from 'react'

interface ProductStructuredDataProps {
  productId: string
  name: string
  description: string
  image: string
  authorName?: string
  price?: number
  priceCurrency?: string
  ratingValue?: number
  ratingCount?: number
  category?: string
  locale: string
}

/**
 * Component that provides structured data for product information (AI prompts)
 * Implements JSON-LD schema.org markup for products
 */
export function ProductStructuredData({
  productId,
  name,
  description,
  image,
  authorName,
  price,
  priceCurrency = 'USD',
  ratingValue,
  ratingCount,
  category,
  locale
}: ProductStructuredDataProps) {
  const baseUrl = 'https://promptaat.com'
  const currentUrl = `${baseUrl}/${locale}/prompt/${productId}`
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name,
          description,
          image,
          productID: productId,
          url: currentUrl,
          ...(authorName && {
            brand: {
              '@type': 'Brand',
              name: authorName
            }
          }),
          ...(category && {
            category: category
          }),
          ...(price !== undefined && {
            offers: {
              '@type': 'Offer',
              price,
              priceCurrency,
              availability: 'https://schema.org/InStock',
              url: currentUrl
            }
          }),
          ...(ratingValue && ratingCount && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue,
              ratingCount,
              bestRating: 5,
              worstRating: 1
            }
          }),
          manufacturer: {
            '@type': 'Organization',
            name: locale === 'ar' ? 'برومبتات' : 'Promptaat',
            logo: `${baseUrl}/images/logo.png`
          }
        }),
      }}
    />
  )
}
