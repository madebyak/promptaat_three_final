import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';

// Dynamically import the component to ensure it's only loaded on the client
const BlogListing = dynamic(() => import('@/components/blogs/blog-listing'), {
  ssr: true
});

interface BlogPageProps {
  params: {
    locale: string;
  };
}

// Generate metadata for the blog page
export async function generateMetadata({ params: { locale } }: BlogPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  return {
    title: `${t('title')} | Promptaat`,
    description: t('description'),
    openGraph: {
      title: `${t('title')} | Promptaat`,
      description: t('description'),
      url: '/blog',
      type: 'website',
    },
  };
}

export default async function BlogPage({ params: { locale } }: BlogPageProps) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  // Get translations
  const t = await getTranslations('Blog');

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {t('description')}
        </p>
      </div>
      
      <BlogListing locale={locale} />
    </div>
  );
}
