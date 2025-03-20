'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CMSLayout } from '@/components/layouts/cms-layout';
import { BlogForm, BlogFormValues } from '@/components/cms/blogs/blog-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import slugify from 'slugify';

export default function CreateBlogPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: BlogFormValues) => {
    setIsSubmitting(true);

    try {
      // Generate a slug from the English title
      // Ensure titleEn is never undefined before slugifying
      const slug = slugify(data.titleEn || '', { 
        lower: true,
        strict: true,
      });

      const responseData = {
        ...data,
        slug,
      };

      const response = await fetch('/api/cms/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blog');
      }

      toast.success('Blog created successfully!');
      router.push('/cms/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create blog';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CMSLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => router.push('/cms/blogs')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Create New Blog</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <BlogForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </CMSLayout>
  );
}
