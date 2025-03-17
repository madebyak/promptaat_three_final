'use client'

import React from 'react'
import { WebsiteSchema, OrganizationSchema, SoftwareApplicationSchema } from './json-ld'

interface SEOProviderProps {
  children: React.ReactNode
  locale: string
}

/**
 * Client component that provides structured data markup for global SEO
 * This component injects JSON-LD schemas that are beneficial for all pages
 */
export function SEOProvider({ children, locale }: SEOProviderProps) {
  const isArabic = locale === 'ar'
  const siteUrl = 'https://promptaat.com'
  
  // Set localized content based on the current locale
  const siteName = isArabic ? 'برومبتات' : 'Promptaat'
  const siteDescription = isArabic 
    ? 'اكتشف واستخدم أفضل بروبتات الذكاء الاصطناعي لـ ChatGPT وGemini وClaude والمزيد.'
    : 'Discover and use the best AI prompts for ChatGPT, Gemini, Claude and more.'
  
  return (
    <>
      {/* Structured data for website */}
      <WebsiteSchema 
        url={siteUrl}
        name={siteName}
        description={siteDescription}
        inLanguage={isArabic ? 'ar-SA' : 'en-US'}
      />
      
      {/* Structured data for organization */}
      <OrganizationSchema
        name={siteName}
        url={siteUrl}
        logo={`${siteUrl}/logo.png`}
        description={siteDescription}
      />
      
      {/* Structured data for software application */}
      <SoftwareApplicationSchema />
      
      {children}
    </>
  )
}
