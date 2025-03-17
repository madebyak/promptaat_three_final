import React from 'react'

interface WebsiteSchemaProps {
  url: string
  name: string
  description: string
  inLanguage?: string
}

interface BreadcrumbItemProps {
  name: string
  item: string
  position: number
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItemProps[]
}

interface OrganizationSchemaProps {
  name: string
  url: string
  logo: string
  description: string
}

/**
 * Component to render JSON-LD structured data for Website schema
 */
export function WebsiteSchema({
  url,
  name,
  description,
  inLanguage = 'en-US',
}: WebsiteSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          url,
          name,
          description,
          inLanguage,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${url}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }),
      }}
    />
  )
}

/**
 * Component to render JSON-LD structured data for Organization schema
 */
export function OrganizationSchema({
  name,
  url,
  logo,
  description,
}: OrganizationSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name,
          url,
          logo,
          description,
          sameAs: [
            'https://twitter.com/promptaat',
            'https://www.linkedin.com/company/promptaat',
          ],
        }),
      }}
    />
  )
}

/**
 * Component to render JSON-LD structured data for BreadcrumbList schema
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item) => ({
            '@type': 'ListItem',
            position: item.position,
            name: item.name,
            item: item.item,
          })),
        }),
      }}
    />
  )
}

/**
 * Component to render JSON-LD structured data for SoftwareApplication schema
 * Represents Promptaat as a web application
 */
export function SoftwareApplicationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Promptaat',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: 'https://promptaat.com/pricing',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '245',
          },
        }),
      }}
    />
  )
}
