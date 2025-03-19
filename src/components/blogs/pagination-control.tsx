'use client';

import { useDirection } from "@/app/[locale]/components/direction-provider";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlProps) {
  const { direction } = useDirection();
  const isRtl = direction === 'rtl';

  // Create array of pages to display
  const getPageItems = () => {
    const items: (number | 'ellipsis')[] = [];
    
    // Always show first page
    items.push(1);
    
    // Logic for middle pages
    if (currentPage > 3) {
      items.push('ellipsis');
    }
    
    // Pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        items.push(i);
      }
    }
    
    // Ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      items.push('ellipsis');
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(totalPages);
    }
    
    return items;
  };

  // Early return if only 1 page
  if (totalPages <= 1) {
    return null;
  }

  const pageItems = getPageItems();

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          <button
            className={cn(
              "flex h-9 items-center gap-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium",
              "transition-colors hover:bg-accent hover:text-accent-foreground",
              "disabled:pointer-events-none disabled:opacity-50",
              isRtl && "flex-row-reverse"
            )}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label={isRtl ? "الصفحة التالية" : "Previous page"}
          >
            {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span>{isRtl ? "التالي" : "Previous"}</span>
          </button>
        </PaginationItem>
        
        {/* Page numbers */}
        {pageItems.map((item, index) => {
          if (item === 'ellipsis') {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          
          return (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={currentPage === item}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(item);
                }}
                href="#"
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        
        {/* Next button */}
        <PaginationItem>
          <button
            className={cn(
              "flex h-9 items-center gap-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium",
              "transition-colors hover:bg-accent hover:text-accent-foreground",
              "disabled:pointer-events-none disabled:opacity-50",
              isRtl && "flex-row-reverse"
            )}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label={isRtl ? "الصفحة السابقة" : "Next page"}
          >
            <span>{isRtl ? "السابق" : "Next"}</span>
            {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
