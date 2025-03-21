'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Edit, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import dynamic from 'next/dynamic';

// Dynamically import dialogs to avoid SSR issues
const AddEditChangelog = dynamic(() => import('./add-edit-changelog'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 flex items-center justify-center bg-black/50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});
const DeleteChangelog = dynamic(() => import('./delete-changelog'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 flex items-center justify-center bg-black/50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

interface Changelog {
  id: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  imageUrl: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function ChangelogManagement() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedChangelog, setSelectedChangelog] = useState<Changelog | null>(null);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogMounted, setIsDialogMounted] = useState(false);

  const fetchChangelogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/cms/changelog?page=${page}&limit=10${search ? `&search=${encodeURIComponent(search)}` : ''}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch changelogs');
      }
      
      const data = await response.json();
      setChangelogs(data.changelogs);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Error fetching changelogs:', error);
      toast.error('Failed to load changelogs');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchChangelogs();
  }, [fetchChangelogs]);

  useEffect(() => {
    // This ensures the dialogs are only mounted client-side
    setIsDialogMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAddChangelog = () => {
    setSelectedChangelog(null);
    setIsEditing(false);
    setIsAddEditDialogOpen(true);
  };

  const handleEditChangelog = (changelog: Changelog) => {
    setSelectedChangelog(changelog);
    setIsEditing(true);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteChangelog = (changelog: Changelog) => {
    setSelectedChangelog(changelog);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseAddEditDialog = (refresh?: boolean) => {
    setIsAddEditDialogOpen(false);
    if (refresh) {
      fetchChangelogs();
    }
  };

  const handleCloseDeleteDialog = (refresh?: boolean) => {
    setIsDeleteDialogOpen(false);
    if (refresh) {
      fetchChangelogs();
    }
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
              className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
              className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Changelog Management</h2>
        <Button onClick={handleAddChangelog}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Entry
        </Button>
      </div>
      
      <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="Search changelogs..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="submit" variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : changelogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-md p-4 text-center">
          <p className="text-muted-foreground mb-4">No changelog entries found</p>
          <Button onClick={handleAddChangelog} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Entry
          </Button>
        </div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changelogs.map((changelog) => (
                  <TableRow key={changelog.id}>
                    <TableCell className="font-medium">
                      {changelog.titleEn}
                      <div className="text-sm text-muted-foreground">{changelog.titleAr}</div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(changelog.publishedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {changelog.author.firstName} {changelog.author.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditChangelog(changelog)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteChangelog(changelog)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              {renderPagination()}
            </div>
          )}
        </>
      )}
      
      {isDialogMounted && isAddEditDialogOpen && (
        <AddEditChangelog
          isOpen={isAddEditDialogOpen}
          onClose={handleCloseAddEditDialog}
          changelog={selectedChangelog}
          isEditing={isEditing}
        />
      )}
      
      {isDialogMounted && isDeleteDialogOpen && selectedChangelog && (
        <DeleteChangelog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          changelog={selectedChangelog}
        />
      )}
    </div>
  );
}
