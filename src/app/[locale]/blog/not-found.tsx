'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DirectionProvider, useDirection } from '@/app/[locale]/components/direction-provider';

export default function BlogNotFound() {
  const params = useParams();
  const locale = params.locale as string;
  
  return (
    <DirectionProvider>
      <BlogNotFoundContent locale={locale} />
    </DirectionProvider>
  );
}

function BlogNotFoundContent({ locale }: { locale: string }) {
  const { theme } = useTheme();
  const { direction, isRtl } = useDirection();
  
  const translations = {
    en: {
      title: 'Blog Not Found',
      message: 'Sorry, the blog post you are looking for does not exist or has been removed.',
      backToBlogs: 'Back to Blogs',
    },
    ar: {
      title: 'لم يتم العثور على المدونة',
      message: 'عذرًا، لا وجود للمدونة التي تبحث عنها أو تمت إزالتها.',
      backToBlogs: 'العودة إلى المدونات',
    }
  };
  
  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 bg-white dark:bg-black-main text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
        {t.title}
      </h1>
      <p className="text-lg mb-8 text-gray-600 dark:text-gray-300 max-w-md">
        {t.message}
      </p>
      <Button asChild>
        <Link href={`/${locale}/blog`} className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <ArrowLeft className="h-4 w-4" />
          <span>{t.backToBlogs}</span>
        </Link>
      </Button>
    </div>
  );
}
