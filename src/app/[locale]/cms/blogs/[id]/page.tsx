'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CMSLayout } from '@/components/layouts/cms-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import DeleteBlog from '@/components/cms/blogs/delete-blog';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BlogDetailPageProps {
  params: {
    id: string;
  };
}

interface BlogDetail {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  summaryEn: string | null;
  summaryAr: string | null;
  featuredImage: string | null;
  status: 'draft' | 'published' | 'archived';
  readTimeMinutes: number | null;
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

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const { theme } = useTheme();
  
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'english' | 'arabic'>('english');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch the blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/cms/blogs/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog');
        }
        
        const data = await response.json();
        setBlog(data.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [id]);

  const handleEdit = () => {
    router.push(`/cms/blogs/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/cms/blogs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }
      
      toast.success('Blog deleted successfully');
      router.push('/cms/blogs');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'outline';
      case 'archived':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <CMSLayout>
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </CMSLayout>
    );
  }

  // Show error state
  if (error || !blog) {
    return (
      <CMSLayout>
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="mb-6">{error || 'Blog not found'}</p>
            <Button onClick={() => router.push('/cms/blogs')}>
              Return to Blogs
            </Button>
          </div>
        </div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/cms/blogs')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{activeTab === 'english' ? blog.titleEn : blog.titleAr}</h1>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={getStatusBadgeVariant(blog.status)}>
                  {blog.status}
                </Badge>
                
                {blog.publishedAt && (
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(blog.publishedAt), 'MMM d, yyyy')}
                  </div>
                )}
                
                {blog.readTimeMinutes && (
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {blog.readTimeMinutes} min read
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as 'english' | 'arabic')}>
            <TabsList className="mb-6">
              <TabsTrigger value="english">English</TabsTrigger>
              <TabsTrigger value="arabic">Arabic</TabsTrigger>
            </TabsList>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {/* Featured Image */}
              {blog.featuredImage && (
                <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-t-lg overflow-hidden">
                  <Image
                    src={blog.featuredImage}
                    alt={activeTab === 'english' ? blog.titleEn : blog.titleAr}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="p-6">
                <TabsContent value="english" className="mt-0">
                  {blog.summaryEn && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Summary</h3>
                      <p className="text-muted-foreground">{blog.summaryEn}</p>
                    </div>
                  )}
                  
                  <h3 className="text-lg font-medium mb-4">Content</h3>
                  <div 
                    className={cn(
                      "prose max-w-none",
                      theme === 'dark' && "prose-invert"
                    )}
                    dangerouslySetInnerHTML={{ __html: blog.contentEn }}
                  />
                </TabsContent>
                
                <TabsContent value="arabic" className="mt-0">
                  {blog.summaryAr && (
                    <div className="mb-6" dir="rtl">
                      <h3 className="text-lg font-medium mb-2 text-right">Summary</h3>
                      <p className="text-muted-foreground text-right">{blog.summaryAr}</p>
                    </div>
                  )}
                  
                  <h3 className="text-lg font-medium mb-4 text-right" dir="rtl">Content</h3>
                  <div 
                    className={cn(
                      "prose max-w-none",
                      theme === 'dark' && "prose-invert"
                    )}
                    dangerouslySetInnerHTML={{ __html: blog.contentAr }}
                    dir="rtl"
                  />
                </TabsContent>
              </div>
            </div>
          </Tabs>
          
          {/* Metadata Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Blog Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Author</h4>
                <p>{blog.author.firstName} {blog.author.lastName}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Created</h4>
                <p>{format(new Date(blog.createdAt), 'MMM d, yyyy, h:mm a')}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Last Updated</h4>
                <p>{format(new Date(blog.updatedAt), 'MMM d, yyyy, h:mm a')}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Slug</h4>
                <p>{blog.slug}</p>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.length > 0 ? (
                    blog.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No tags</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DeleteBlog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        blogTitle={activeTab === 'english' ? blog.titleEn : blog.titleAr}
      />
    </CMSLayout>
  );
}
