'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CMSLayout } from '@/components/layouts/cms-layout';
import BlogForm from '@/components/cms/blogs/blog-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import slugify from 'slugify';

// Blog schema for form validation
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

type BlogFormValues = z.infer<typeof blogFormSchema>;

export default function CreateBlogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BlogFormValues) => {
    setIsSubmitting(true);
    try {
      // Generate a slug from the English title
      const slug = slugify(data.titleEn, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });

      // Prepare the request data
      const requestData = {
        ...data,
        slug,
      };

      const response = await fetch('/api/cms/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blog');
      }

      toast.success('Blog created successfully!');
      router.push('/cms/blogs');
    } catch (error: any) {
      console.error('Error creating blog:', error);
      toast.error(error.message || 'Failed to create blog');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold">Create New Blog</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <BlogForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </CMSLayout>
  );
}
