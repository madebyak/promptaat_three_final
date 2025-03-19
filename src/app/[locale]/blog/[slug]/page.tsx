import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

// Dynamically import the component to ensure it's only loaded on the client
const BlogDetail = dynamic(() => import('@/components/blogs/blog-detail'), {
  ssr: true
});

interface BlogDetailPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

// Generate metadata for the blog detail page
export async function generateMetadata({ params: { locale, slug } }: BlogDetailPageProps): Promise<Metadata> {
  try {
    // Fetch blog data for metadata
    const blog = await prisma.blog.findFirst({
      where: { 
        slug,
        status: "published",
        publishedAt: { not: null },
        deletedAt: null
      },
      select: {
        titleEn: true,
        titleAr: true,
        summaryEn: true,
        summaryAr: true,
        featuredImage: true,
      },
    });

    if (!blog) {
      const t = await getTranslations({ locale, namespace: 'Blog' });
      return {
        title: `${t('title')} | Promptaat`,
        description: 'The requested blog post could not be found.',
      };
    }

    const title = locale === 'ar' ? blog.titleAr : blog.titleEn;
    const description = locale === 'ar' ? blog.summaryAr : blog.summaryEn;

    return {
      title: `${title} | Promptaat`,
      description: description || '',
      openGraph: {
        title: `${title} | Promptaat`,
        description: description || '',
        url: `/blog/${slug}`,
        type: 'article',
        images: blog.featuredImage ? [{ url: blog.featuredImage }] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    const t = await getTranslations({ locale, namespace: 'Blog' });
    return {
      title: `${t('title')} | Promptaat`,
      description: t('description'),
    };
  }
}

export default async function BlogDetailPage({ params: { locale, slug } }: BlogDetailPageProps) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <BlogDetail slug={slug} locale={locale} />
    </div>
  );
}
