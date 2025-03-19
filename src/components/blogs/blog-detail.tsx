'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useDirection } from '@/app/[locale]/components/direction-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Clock, Calendar, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BlogDetailProps {
  slug: string;
  locale: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string; 
  titleEn?: string; // English title
  titleAr?: string; // Arabic title
  content: string;
  contentEn?: string; // English content
  contentAr?: string; // Arabic content
  summary: string | null;
  summaryEn?: string | null; // English summary
  summaryAr?: string | null; // Arabic summary
  featuredImage: string | null;
  readTimeMinutes: number | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string | null;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
}

interface RelatedBlog {
  id: string;
  slug: string;
  title: string;
  titleEn?: string; // English title
  titleAr?: string; // Arabic title
  summary: string | null;
  summaryEn?: string | null; // English summary
  summaryAr?: string | null; // Arabic summary
  featuredImage: string | null;
}

export default function BlogDetail({ slug, locale }: BlogDetailProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { direction } = useDirection();
  const t = useTranslations('Blog');
  
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);

  // Fetch related blogs
  const fetchRelatedBlogs = useCallback(async (tags: string[], currentBlogId: string) => {
    try {
      // Limit to 3 related posts and exclude current post
      const response = await fetch(`/api/blogs?limit=3&locale=${locale}&tag=${tags[0]}&excludeId=${currentBlogId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch related blogs');
      }
      
      const data = await response.json();
      setRelatedBlogs(data.data);
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  }, [locale]);

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/blogs/${slug}?locale=${locale}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Blog post not found');
          }
          throw new Error('Failed to fetch blog');
        }
        
        const data = await response.json();
        setBlog(data.data);
        
        // Fetch related blogs based on tags
        if (data.data.tags.length > 0) {
          fetchRelatedBlogs(data.data.tags, data.data.id);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [slug, locale, fetchRelatedBlogs]);

  // Share the blog post
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title || 'Promptaat Blog',
          text: blog?.summary || '',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error || !blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="mb-6">{error || 'Blog post not found'}</p>
        <Button onClick={() => router.push(`/${locale}/blog`)}>
          {t('backToBlog')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className={cn("w-full mb-8 flex", direction === 'rtl' ? 'justify-end' : 'justify-start')}>
        {direction === 'rtl' ? (
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/${locale}/blog`)}
            className="flex items-center"
          >
            {t('backToBlog')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/${locale}/blog`)}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToBlog')}
          </Button>
        )}
      </div>
      
      {/* Blog header */}
      <div className={cn("mb-8", direction === 'rtl' ? 'text-right' : 'text-left')}>
        {/* Tags */}
        <div className={cn("flex flex-wrap gap-2 mb-4", direction === 'rtl' ? 'justify-end' : 'justify-start')}>
          {blog.tags.map((tag) => (
            <Link key={tag} href={`/${locale}/blog?tagName=${tag}`}>
              <Badge variant="secondary" className="text-sm">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
        
        {/* Title with explicit direction */}
        {locale === 'ar' ? (
          <div className="text-right" dir="rtl" lang="ar">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {blog.titleAr || blog.title || t('untitledBlog')}
            </h1>
          </div>
        ) : (
          <div className="text-left" dir="ltr" lang="en">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {blog.titleEn || blog.title || t('untitledBlog')}
            </h1>
          </div>
        )}
        
        {/* Blog meta information */}
        <div className={cn(
          "flex flex-wrap items-center gap-4 text-sm text-muted-foreground",
          direction === 'rtl' ? 'justify-end flex-row-reverse' : 'justify-start'
        )}>
          {/* Publication date */}
          <div className={cn("flex items-center gap-1", direction === 'rtl' ? 'flex-row-reverse' : '')}>
            <Calendar className="h-4 w-4" />
            <span>
              {format(
                new Date(blog.publishedAt), 
                'MMMM d, yyyy', 
                { locale: direction === 'rtl' ? ar : undefined }
              )}
            </span>
          </div>
          
          {/* Read time */}
          {blog.readTimeMinutes && (
            <div className={cn("flex items-center gap-1", direction === 'rtl' ? 'flex-row-reverse' : '')}>
              <Clock className="h-4 w-4" />
              <span>
                {blog.readTimeMinutes} {t('minuteRead')}
              </span>
            </div>
          )}
          
          {/* Share button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className={direction === 'rtl' ? 'mr-auto' : 'ml-auto'} 
            onClick={handleShare}
          >
            <Share2 className={cn("h-4 w-4", direction === 'rtl' ? 'ml-2' : 'mr-2')} />
            {t('share')}
          </Button>
        </div>
      </div>
      
      {/* Featured image */}
      {blog.featuredImage && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8">
          <Image
            src={blog.featuredImage}
            alt={(locale === 'en' ? blog.titleEn : blog.titleAr) || blog.title || t('blogFeaturedImage')}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="object-cover"
          />
        </div>
      )}
      
      {/* Blog content */}
      <div 
        className={cn(
          "prose max-w-none my-8",
          "prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4",
          "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
          "prose-p:my-4 prose-p:leading-relaxed",
          "prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4",
          "prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4",
          "prose-li:my-2",
          "prose-img:rounded-md prose-img:my-6",
          "prose-a:text-primary prose-a:underline",
          "prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-table:border-collapse prose-table:w-full prose-table:my-6",
          "prose-th:border prose-th:border-gray-300 prose-th:dark:border-gray-700 prose-th:p-2 prose-th:bg-gray-100 prose-th:dark:bg-gray-800",
          "prose-td:border prose-td:border-gray-300 prose-td:dark:border-gray-700 prose-td:p-2",
          theme === 'dark' && "prose-invert",
          direction === 'rtl' && "prose-rtl text-right"
        )}
        dangerouslySetInnerHTML={{ __html: (locale === 'en' ? blog.contentEn : blog.contentAr) || blog.content || '' }}
      />
      
      {/* Related posts */}
      {relatedBlogs.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className={cn("text-2xl font-bold mb-8", direction === 'rtl' ? 'text-right' : 'text-left')}>
            {t('relatedPosts')}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBlogs.map((relatedBlog) => (
              <Link 
                key={relatedBlog.id} 
                href={`/${locale}/blog/${relatedBlog.slug}`} 
                className="group transition-transform duration-300 hover:scale-[1.02] focus:scale-[1.02]"
              >
                <Card className="h-full flex flex-col overflow-hidden">
                  {relatedBlog.featuredImage && (
                    <div className="aspect-video overflow-hidden relative">
                      <Image
                        src={relatedBlog.featuredImage}
                        alt={(locale === 'en' ? relatedBlog.titleEn : relatedBlog.titleAr) || relatedBlog.title || t('blogPost')}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <h3 className={cn(
                      "font-semibold text-lg leading-tight line-clamp-2",
                      direction === 'rtl' ? 'text-right' : 'text-left'
                    )}>
                      {(locale === 'en' ? relatedBlog.titleEn : relatedBlog.titleAr) || relatedBlog.title || t('untitledBlog')}
                    </h3>
                  </CardHeader>
                  
                  <CardContent className={cn("flex-grow", direction === 'rtl' ? 'text-right' : 'text-left')}>
                    {((locale === 'en' ? relatedBlog.summaryEn : relatedBlog.summaryAr) || relatedBlog.summary) && (
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {(locale === 'en' ? relatedBlog.summaryEn : relatedBlog.summaryAr) || relatedBlog.summary}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
