"use client";

import React from 'react';
import Script from 'next/script';
import { useParams } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const params = useParams();
  const locale = params.locale as string;
  const isRtl = locale === 'ar';

  // Structured data for organization
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Promptaat",
    "url": "https://promptaat.com",
    "logo": "https://promptaat.com/assets/logo.svg",
    "sameAs": [
      "https://twitter.com/promptaat",
      "https://facebook.com/promptaat",
      "https://linkedin.com/company/promptaat"
    ]
  };

  return (
    <div 
      className="min-h-screen w-full"
      dir={isRtl ? 'rtl' : 'ltr'}
      lang={locale}
      aria-label={locale === 'ar' ? 'صفحة المصادقة' : 'Authentication Page'}
    >
      {/* Add structured data for better SEO */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Breadcrumbs for better navigation and SEO */}
      <nav aria-label={locale === 'ar' ? 'مسار التنقل' : 'Breadcrumb'} className="sr-only">
        <ol>
          <li>
            <a href={`/${locale}`}>{locale === 'ar' ? 'الرئيسية' : 'Home'}</a>
          </li>
          <li>
            <a href={`/${locale}/auth`} aria-current="page">
              {locale === 'ar' ? 'المصادقة' : 'Authentication'}
            </a>
          </li>
        </ol>
      </nav>
      
      {children}
    </div>
  );
}
