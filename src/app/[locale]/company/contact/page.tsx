import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'
import { SubFooter } from '@/components/layout/sub-footer'

// Use dynamic imports for the contact components
const ContactHero = dynamic(() => import('@/components/contact/contact-hero'), { ssr: true })
const ContactForm = dynamic(() => import('@/components/contact/contact-form'), { ssr: true })

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'اتصل بنا | بروميتات' : 'Contact Us | Promptaat',
    description: locale === 'ar' 
      ? 'تواصل مع فريق بروميتات للاستفسارات والدعم والتعاون.' 
      : 'Get in touch with the Promptaat team for inquiries, support, and collaboration.',
  }
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  return (
    <div className="w-full bg-white dark:bg-black-main text-gray-900 dark:text-white">
      {/* Hero Section with FAQ and Support cards */}
      <ContactHero locale={locale} />
      
      {/* Contact Form Section */}
      <ContactForm locale={locale} id="support-form" />
      
      {/* Sub-footer */}
      <SubFooter locale={locale} />
    </div>
  )
}
