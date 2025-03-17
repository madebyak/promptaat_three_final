'use client'

import React from 'react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQStructuredDataProps {
  faqItems: FAQItem[]
  mainEntity?: string
  url?: string
}

/**
 * Component that provides structured data for FAQ sections
 * Implements JSON-LD schema.org markup for FAQPage
 */
export function FAQStructuredData({ 
  faqItems, 
  mainEntity = "Pricing and Subscription Questions",
  url
}: FAQStructuredDataProps) {
  const baseUrl = 'https://promptaat.com'
  const pageUrl = url || `${baseUrl}/pricing`
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          })),
          name: mainEntity,
          url: pageUrl
        }),
      }}
    />
  )
}
