'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Changelog {
  id: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  imageUrl: string | null;
  publishedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ChangelogListProps {
  locale: string;
}

export default function ChangelogList({ locale }: ChangelogListProps) {
  const isRTL = locale === 'ar';
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    async function fetchChangelogs() {
      setLoading(true);
      try {
        const response = await fetch(`/api/resources/changelog?page=${page}&limit=5`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch changelogs');
        }
        
        const data = await response.json();
        setChangelogs(data.changelogs);
        setTotalPages(data.pages);
      } catch (error) {
        console.error('Error fetching changelogs:', error);
        setError('Failed to load changelog entries. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchChangelogs();
  }, [page]);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of the list when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy', {
      locale: isRTL ? ar : undefined,
    });
  };
  
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page, and pages around current
      if (page <= 3) {
        // Near start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Near end
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle
        pages.push(1);
        pages.push(-1); // Ellipsis
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      }
    }
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && handlePageChange(page - 1)}
              className={cn(
                page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer',
                isRTL && 'rotate-180'
              )}
            />
          </PaginationItem>
          
          {pages.map((pageNum, index) => 
            pageNum === -1 ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={pageNum === page}
                  onClick={() => handlePageChange(pageNum)}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && handlePageChange(page + 1)}
              className={cn(
                page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer',
                isRTL && 'rotate-180'
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  if (changelogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground">
          {isRTL ? 'لا توجد تحديثات متاحة حاليًا.' : 'No changelog entries available at this time.'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-12">
      {changelogs.map((entry, index) => (
        <div key={entry.id}>
          <div className="pb-12">
            {entry.imageUrl && (
              <div className="relative w-full aspect-[1200/620] mb-6 rounded-lg overflow-hidden">
                <Image
                  src={entry.imageUrl}
                  alt={isRTL ? entry.titleAr : entry.titleEn}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover"
                  priority={page === 1}
                />
              </div>
            )}
            
            <div className={cn("text-sm text-muted-foreground mb-2", isRTL ? "text-right" : "text-left")}>
              {formatDate(entry.publishedAt)}
            </div>
            
            <h2 className={cn(
              "text-2xl font-bold mb-4",
              isRTL ? "text-right rtl" : "text-left ltr"
            )}>
              <bdi>{isRTL ? entry.titleAr : entry.titleEn}</bdi>
            </h2>
            
            <div 
              className={cn(
                "prose prose-lg max-w-none",
                isRTL ? "text-right rtl" : "text-left ltr"
              )}
              dir={isRTL ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ 
                __html: isRTL ? entry.contentAr : entry.contentEn 
              }}
            />
          </div>
          {/* Add divider between entries, but not after the last one */}
          {index < changelogs.length - 1 && (
            <hr className="border-t border-border my-6" />
          )}
        </div>
      ))}
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          {renderPagination()}
        </div>
      )}
    </div>
  );
}
