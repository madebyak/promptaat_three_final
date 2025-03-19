'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BlogForm from "@/components/cms/blogs/blog-form";
import { toast } from 'sonner';
import { blogFormSchema } from '@/components/cms/blogs/blog-form';
import { z } from 'zod';

type BlogFormValues = z.infer<typeof blogFormSchema>;

export default function CreateBlogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: BlogFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Similar to edit, don't manually handle publishedAt
      const blogData = {
        ...data,
        // Ensure readTimeMinutes is a number
        readTimeMinutes: data.readTimeMinutes || 5,
      };
      
      console.log('Submitting blog data:', blogData);
      
      const response = await fetch('/api/cms/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Server error response:', error);
        throw new Error(error.message || error.error || 'Failed to create blog post');
      }
      
      toast.success('Blog post created successfully');
      router.push('/cms/blogs');
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error((error as Error).message || 'Failed to create blog post');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/cms/blogs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create New Blog</h1>
        </div>
      </div>
      
      <BlogForm 
        initialData={{
          titleEn: "",
          titleAr: "",
          contentEn: "",
          contentAr: "",
          summaryEn: "",
          summaryAr: "",
          featuredImage: "",
          status: "draft",
          readTimeMinutes: 5,
          metaTitleEn: "",
          metaTitleAr: "",
          metaDescriptionEn: "",
          metaDescriptionAr: "",
          publishedAt: null,
          tags: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
