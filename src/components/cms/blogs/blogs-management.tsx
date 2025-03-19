'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaginationControl } from '@/components/blogs/pagination-control';
import { PlusCircle, MoreHorizontal, Search, Eye, Pencil, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import DeleteBlog from './delete-blog';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// Blog type definition
interface Blog {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tags: string[];
}

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function BlogsManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Get initial page from URL if available
  useEffect(() => {
    const page = searchParams.get('page');
    if (page) {
      setPagination(prev => ({ ...prev, page: parseInt(page, 10) }));
    }
    
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
    
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  // Fetch blogs based on current filters and pagination
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (statusFilter) {
        queryParams.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/cms/blogs?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      
      const data = await response.json();
      setBlogs(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  useEffect(() => {
    fetchBlogs();
    // Update URL with current filters
    const params = new URLSearchParams();
    params.set('page', pagination.page.toString());
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    if (statusFilter) {
      params.set('status', statusFilter);
    }
    
    router.push(`/cms/blogs?${params.toString()}`, { scroll: false });
  }, [pagination.page, statusFilter, fetchBlogs, router, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchBlogs();
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status === "all" ? undefined : status);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleCreateNew = () => {
    router.push('/cms/blogs/create');
  };

  const handleView = (blog: Blog) => {
    router.push(`/cms/blogs/${blog.id}`);
  };

  const handleEdit = (blog: Blog) => {
    router.push(`/cms/blogs/${blog.id}/edit`);
  };

  const handleDeleteClick = (blog: Blog) => {
    setBlogToDelete(blog);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;
    
    try {
      const response = await fetch(`/api/cms/blogs/${blogToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }
      
      toast.success('Blog deleted successfully');
      fetchBlogs(); // Refresh the list
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    } finally {
      setIsDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const handleStatusUpdate = async (blog: Blog, newStatus: 'draft' | 'published' | 'archived') => {
    setIsStatusUpdating(true);
    try {
      const response = await fetch(`/api/cms/blogs/${blog.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update blog status');
      }
      
      toast.success(`Blog status updated to ${newStatus}`);
      fetchBlogs(); // Refresh the list
    } catch (error) {
      console.error('Error updating blog status:', error);
      toast.error('Failed to update blog status');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // Render loading state
  if (loading && blogs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Blog Management</h2>
        <Button onClick={handleCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Blog
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search blogs..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" className="ml-2">
            Search
          </Button>
        </form>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={language} onValueChange={(value) => setLanguage(value as 'en' | 'ar')}>
        <TabsList>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="ar">Arabic</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className={cn(
        "rounded-md border overflow-hidden",
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      )}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No blogs found. Create your first blog post.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">
                    {language === 'en' ? blog.titleEn : blog.titleAr}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {blog.status === 'published' ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Published
                        </Badge>
                      ) : blog.status === 'draft' ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                          Draft
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          Archived
                        </Badge>
                      )}
                      {blog.publishedAt && (
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(blog.publishedAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{blog.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {blog.publishedAt ? (
                      format(new Date(blog.publishedAt), 'MMM d, yyyy')
                    ) : (
                      <span className="text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" /> Not published
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {blog.author.firstName} {blog.author.lastName}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleView(blog)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(blog)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        {blog.status !== 'draft' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(blog, 'draft')}
                            disabled={isStatusUpdating}
                          >
                            Set as Draft
                          </DropdownMenuItem>
                        )}
                        {blog.status !== 'published' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(blog, 'published')}
                            disabled={isStatusUpdating}
                          >
                            Publish
                          </DropdownMenuItem>
                        )}
                        {blog.status !== 'archived' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(blog, 'archived')}
                            disabled={isStatusUpdating}
                          >
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(blog)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-12">
          <PaginationControl
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      <DeleteBlog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        blogTitle={blogToDelete ? (language === 'en' ? blogToDelete.titleEn : blogToDelete.titleAr) : ''}
      />
    </div>
  );
}
