'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DirectionProvider, useDirection } from '@/app/[locale]/components/direction-provider';
import { CMSLayout } from '@/components/layouts/cms-layout';

export default function CMSBlogNotFound() {
  const params = useParams();
  const locale = params.locale as string;
  
  return (
    <DirectionProvider>
      <CMSLayout>
        <BlogNotFoundContent locale={locale} />
      </CMSLayout>
    </DirectionProvider>
  );
}

function BlogNotFoundContent({ locale }: { locale: string }) {
  const { theme } = useTheme();
  const { direction, isRtl } = useDirection();
  
  const translations = {
    en: {
      title: 'Blog Post Not Found',
      message: 'Sorry, the blog post you are looking for does not exist or has been removed.',
      backToDashboard: 'Back to Blogs Dashboard',
    },
    ar: {
      title: 'لم يتم العثور على المدونة',
      message: 'عذرًا، لا وجود للمدونة التي تبحث عنها أو تمت إزالتها.',
      backToDashboard: 'العودة إلى لوحة المدونات',
    }
  };
  
  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">
        {t.title}
      </h1>
      <p className="text-lg mb-8 text-gray-600 dark:text-gray-300 max-w-md">
        {t.message}
      </p>
      <Button asChild>
        <Link href={`/${locale}/cms/blogs`} className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <ArrowLeft className="h-4 w-4" />
          <span>{t.backToDashboard}</span>
        </Link>
      </Button>
    </div>
  );
}
