"use client";

import React from 'react';
import { useParams } from 'next/navigation';

interface StructuredDataProps {
  title?: string;
  description?: string;
  publishedDate?: string;
  modifiedDate?: string;
  imagePath?: string;
}

export const ArticleStructuredData: React.FC<StructuredDataProps> = ({
  title = "Promptaat | The Largest AI Prompt Library",
  description = "In an era where AI is reshaping creativity, crafting effective prompts can be overwhelming. Promptaat's vast, engineered collection saves you time—just copy and paste to fuel your ideas.",
  publishedDate = "2023-01-01",
  modifiedDate = new Date().toISOString().split('T')[0],
  imagePath = "/og/home-og-en.jpg"
}) => {
  const params = useParams();
  const locale = params.locale as string;
  
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": `https://promptaat.com${imagePath}`,
    "author": {
      "@type": "Organization",
      "name": "Promptaat"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Promptaat",
      "logo": {
        "@type": "ImageObject",
        "url": "https://promptaat.com/logo.png"
      }
    },
    "datePublished": publishedDate,
    "dateModified": modifiedDate,
    "inLanguage": locale === "ar" ? "ar-SA" : "en-US"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export const BenchmarkStructuredData: React.FC = () => {
  const params = useParams();
  const locale = params.locale as string;
  
  const title = locale === 'ar' 
    ? 'المقاييس المعيارية | برومتات' 
    : 'AI Prompt Performance Benchmarks | Promptaat';
  
  const description = locale === 'ar'
    ? 'اكتشف كيف تتفوق برومتات في المقاييس المعيارية للدقة والجودة والكفاءة الزمنية ورضا المستخدم والإبداع.'
    : 'Explore comprehensive AI prompt performance data: 92% accuracy, 87% quality score, 63% time efficiency, and more metrics that set Promptaat apart.';
  
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": `https://promptaat.com/${locale === 'ar' ? '/og/benchmark-og-ar.jpg' : '/og/benchmark-og-en.jpg'}`,
    "author": {
      "@type": "Organization",
      "name": "Promptaat"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Promptaat",
      "logo": {
        "@type": "ImageObject",
        "url": "https://promptaat.com/logo.png"
      }
    },
    "datePublished": "2023-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "inLanguage": locale === "ar" ? "ar-SA" : "en-US",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://promptaat.com/${locale}/resources/benchmark`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export const FAQStructuredData: React.FC<{
  questions: Array<{ question: string; answer: string }>
}> = ({ questions }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export const WebsiteStructuredData: React.FC = () => {
  const params = useParams();
  const locale = params.locale as string;
  
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Promptaat",
    "url": "https://promptaat.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://promptaat.com/{locale}/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": locale === "ar" ? "ar-SA" : "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
