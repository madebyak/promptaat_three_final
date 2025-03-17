'use client'

import React from 'react'

interface PricingPlan {
  name: string
  price: number
  currency: string
  billingPeriod: string
  description: string
  url: string
}

interface PricingStructuredDataProps {
  plans: PricingPlan[]
  locale: string
}

/**
 * Component that provides structured data for pricing information
 * Implements JSON-LD schema.org markup for services and offers
 */
export function PricingStructuredData({ plans, locale }: PricingStructuredDataProps) {
  const baseUrl = 'https://promptaat.com'
  const currentUrl = `${baseUrl}/${locale}/pricing`
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: locale === 'ar' ? 'برومبتات - مكتبة بروبتات الذكاء الاصطناعي' : 'Promptaat - AI Prompt Library',
          description: locale === 'ar' 
            ? 'مكتبة بروبتات الذكاء الاصطناعي لـ ChatGPT وGemini وClaude والمزيد' 
            : 'AI Prompt Library for ChatGPT, Gemini, Claude and more',
          provider: {
            '@type': 'Organization',
            name: locale === 'ar' ? 'برومبتات' : 'Promptaat',
            url: baseUrl
          },
          offers: plans.map(plan => ({
            '@type': 'Offer',
            name: plan.name,
            price: plan.price,
            priceCurrency: plan.currency,
            description: plan.description,
            url: plan.url,
            availability: 'https://schema.org/InStock',
            ...(plan.billingPeriod ? { 
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: plan.price,
                priceCurrency: plan.currency,
                unitCode: 'MON',
                billingIncrement: 1,
                billingDuration: plan.billingPeriod
              }
            } : {})
          })),
          url: currentUrl
        }),
      }}
    />
  )
}
