'use client';

import React from 'react';
import { FAQStructuredData } from '../seo/structured-data';
import { useTranslations } from 'next-intl';

interface FAQItem {
  question: string;
  answer: string;
}

const BenchmarkFAQSection: React.FC = () => {
  const t = useTranslations('Benchmark.FAQ');
  
  const faqs: FAQItem[] = [
    {
      question: t('questions.accuracy.question'),
      answer: t('questions.accuracy.answer')
    },
    {
      question: t('questions.quality.question'),
      answer: t('questions.quality.answer')
    },
    {
      question: t('questions.time.question'),
      answer: t('questions.time.answer')
    },
    {
      question: t('questions.satisfaction.question'),
      answer: t('questions.satisfaction.answer')
    },
    {
      question: t('questions.creativity.question'),
      answer: t('questions.creativity.answer')
    },
    {
      question: t('questions.coverage.question'),
      answer: t('questions.coverage.answer')
    }
  ];

  return (
    <section className="w-full py-16 bg-white dark:bg-dark-grey">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-black-main dark:text-white-pure mb-12">
          {t('title')}
        </h2>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-light-grey dark:bg-black-main rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-black-main dark:text-white-pure mb-3">
                {faq.question}
              </h3>
              <p className="text-mid-grey dark:text-light-grey">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
        
        {/* Structured Data for SEO */}
        <FAQStructuredData questions={faqs} />
      </div>
    </section>
  );
};

export default BenchmarkFAQSection;
