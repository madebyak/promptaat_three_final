'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CMSLayout } from '@/components/layouts/cms-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { BlogForm, BlogFormValues } from '@/components/cms/blogs/blog-form';

// Define the schema directly since imports are causing issues
const blogFormSchema = z.object({
  titleEn: z.string().min(3, 'English title must be at least 3 characters'),
  titleAr: z.string().min(3, 'Arabic title must be at least 3 characters'),
  contentEn: z.string().min(10, 'English content must be at least 10 characters'),
  contentAr: z.string().min(10, 'Arabic content must be at least 10 characters'),
  summaryEn: z.string().optional(),
  summaryAr: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  readTimeMinutes: z.coerce.number().int().positive().optional(),
  metaTitleEn: z.string().optional(),
  metaTitleAr: z.string().optional(),
  metaDescriptionEn: z.string().optional(),
  metaDescriptionAr: z.string().optional(),
  publishedAt: z.date().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

interface BlogEditPageProps {
  params: {
    id: string;
  };
}

export default function EditBlogPage({ params }: BlogEditPageProps) {
  const { id } = params;
  const router = useRouter();
  const [blog, setBlog] = useState<BlogFormValues & { id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/cms/blogs/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog');
        }
        
        const data = await response.json();
        
        // Convert date strings to Date objects
        const formattedData = {
          ...data.data,
          publishedAt: data.data.publishedAt ? new Date(data.data.publishedAt) : null,
        };
        
        setBlog(formattedData);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [id]);

  const handleSubmit = async (data: BlogFormValues) => {
    setIsSubmitting(true);
    try {
      // Validate the data with the schema before sending
      const validatedData = blogFormSchema.parse(data);
      
      const response = await fetch(`/api/cms/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update blog');
      }

      toast.success('Blog updated successfully!');
      router.push('/cms/blogs');
    } catch (error: unknown) {
      console.error('Error updating blog:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update blog';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-2xl font-bold">Edit Blog</h1>
          <p className="text-muted-foreground mt-1">Editing: {blog.titleEn}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <BlogForm
            initialData={blog}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </CMSLayout>
  );
}
