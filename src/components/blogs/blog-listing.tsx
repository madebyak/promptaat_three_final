'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaginationControl } from '@/components/blogs/pagination-control';
import { useDirection } from '@/app/[locale]/components/direction-provider';
import { Calendar, Clock, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface BlogPost {
  id: string;
  slug: string;
  titleEn?: string; // English title
  titleAr?: string; // Arabic title
  summaryEn?: string | null; // English summary
  summaryAr?: string | null; // Arabic summary
  featuredImage: string | null;
  readTimeMinutes: number | null;
  publishedAt: string;
  tags: string[];
}

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface BlogListingProps {
  locale: string;
}

export default function BlogListing({ locale }: BlogListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { direction } = useDirection();
  const t = useTranslations('Blog');

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 9,
  });
  const [loading, setLoading] = useState(true);

  // Get initial parameters from URL
  useEffect(() => {
    const page = searchParams.get('page');
    if (page) {
      setPagination(prev => ({ ...prev, page: parseInt(page, 10) }));
    }
    
    const tag = searchParams.get('tagName');
    if (tag) {
      setSelectedTag(tag);
    }
    
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  // Fetch all available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/blogs/tags');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        
        const data = await response.json();
        const tagNames = data.data.map((tag: { name: string; count: number }) => tag.name);
        setTags(tagNames);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    
    fetchTags();
  }, []);

  // Fetch blog posts based on filters and pagination
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      // Base query
      let url = `/api/blogs?locale=${locale}&page=${pagination.page}&limit=${pagination.limit}`;
      
      // Add search term if exists
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      // Add tag filter if selected
      if (selectedTag) {
        url += `&tagName=${encodeURIComponent(selectedTag)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      
      const data = await response.json();
      setBlogs(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages,
      }));
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }, [locale, pagination.page, pagination.limit, searchTerm, selectedTag]);

  useEffect(() => {
    fetchBlogs();
    
    // Update URL with current filters
    const params = new URLSearchParams();
    params.set('page', pagination.page.toString());
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    if (selectedTag) {
      params.set('tagName', selectedTag);
    }
    
    router.push(`/${locale}/blog?${params.toString()}`, { scroll: false });
  }, [pagination.page, selectedTag, locale, router, searchTerm, fetchBlogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchBlogs();
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Render blog cards
  const renderBlogCards = () => {
    if (loading && blogs.length === 0) {
      return (
        <div className="flex justify-center items-center h-64 col-span-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (blogs.length === 0) {
      return (
        <div className="text-center py-12 col-span-full">
          <h3 className="text-xl font-medium mb-2">{t('noResults')}</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedTag ? t('tryAdjustingFilters') : t('checkBackLater')}
          </p>
        </div>
      );
    }

    return blogs.map((blog) => (
      <Link 
        key={blog.id} 
        href={`/${locale}/blog/${blog.slug}`}
        className="transition-transform duration-300 hover:scale-[1.02] focus:scale-[1.02]"
      >
        <Card className="h-full flex flex-col">
          {blog.featuredImage && (
            <div className="w-full h-48 overflow-hidden rounded-t-lg">
              <Image
                src={blog.featuredImage}
                alt={(locale === 'en' ? blog.titleEn : blog.titleAr) || 'Blog post'}
                className="w-full h-full object-cover"
                width={400}
                height={200}
                style={{ objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          )}
          
          <CardHeader className={direction === 'rtl' ? 'text-right' : ''}>
            <div className="flex flex-wrap gap-2 mb-3">
              {blog.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {blog.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{blog.tags.length - 2}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold line-clamp-2">
              {(locale === 'en' ? blog.titleEn : blog.titleAr) || 'Untitled Blog'}
            </h3>
          </CardHeader>
          
          <CardContent className={cn("flex-grow", direction === 'rtl' ? 'text-right' : '')}>
            {(locale === 'en' ? blog.summaryEn : blog.summaryAr) ? (
              <p className="text-muted-foreground line-clamp-3">
                {locale === 'en' ? blog.summaryEn : blog.summaryAr}
              </p>
            ) : (
              <div className="h-12"></div> // Placeholder height when no summary
            )}
          </CardContent>
          
          <CardFooter className={cn("text-sm text-muted-foreground", direction === 'rtl' ? 'justify-end' : '')}>
            <div className={cn("flex items-center gap-4", direction === 'rtl' ? 'flex-row-reverse' : '')}>
              <div className="flex items-center">
                <Calendar className={cn("h-4 w-4", direction === 'rtl' ? 'ml-1' : 'mr-1')} />
                <span>
                  {format(
                    new Date(blog.publishedAt), 
                    'MMM d, yyyy', 
                    { locale: direction === 'rtl' ? ar : undefined }
                  )}
                </span>
              </div>
              
              {blog.readTimeMinutes && (
                <div className="flex items-center">
                  <Clock className={cn("h-4 w-4", direction === 'rtl' ? 'ml-1' : 'mr-1')} />
                  <span>{blog.readTimeMinutes} {t('minuteRead')}</span>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </Link>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className={cn("text-3xl font-bold mb-6", direction === 'rtl' ? 'text-right' : '')}>
        {t('title')}
      </h1>
      
      <p className={cn("text-muted-foreground mb-8", direction === 'rtl' ? 'text-right' : '')}>
        {t('description')}
      </p>
      
      {/* Search and filter */}
      <div className={cn("flex flex-col md:flex-row gap-4 mb-8", direction === 'rtl' ? 'items-end' : 'items-start')}>
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(direction === 'rtl' ? 'text-right pr-4 pl-10' : 'pl-4 pr-10')}
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className={cn("absolute top-0", direction === 'rtl' ? 'left-0' : 'right-0')}
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        {/* Tags filter */}
        <div className={cn("flex flex-wrap gap-2", direction === 'rtl' ? 'justify-end' : '')}>
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Blog grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderBlogCards()}
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-12">
          <PaginationControl
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
