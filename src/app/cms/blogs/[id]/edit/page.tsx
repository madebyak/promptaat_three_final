'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from "next/link";
import { CMSLayout } from '@/components/layouts/cms-layout';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BlogForm, BlogFormValues } from "@/components/cms/blogs/blog-form";
import { toast } from "sonner";

export default function EditBlogPage() {
  const params = useParams();
  const blogId = params.id as string;
  
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blog, setBlog] = useState<BlogFormValues & { id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/cms/blogs/${blogId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }
        
        const data = await response.json();
        
        // Remove publishedAt handling - let the backend handle it automatically
        const processedData = {
          ...data.data,
        };
        
        setBlog(processedData);
      } catch (error) {
        console.error('Error fetching blog:', error);
        toast.error('Failed to load blog post');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlog();
  }, [blogId]);
  
  const handleSubmit = async (data: BlogFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Following the prompts pattern - don't include date fields
      const blogData = {
        ...data,
        // Ensure readTimeMinutes is a number
        readTimeMinutes: data.readTimeMinutes || 5,
      };
      
      console.log('Submitting blog data:', blogData); // Add debugging
      
      const response = await fetch(`/api/cms/blogs/${blogId}`, {
        method: 'PATCH', // Use PATCH to match the API endpoint
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to update blog post');
      }
      
      toast.success('Blog post updated successfully');
      router.push('/cms/blogs');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error((error as Error).message || 'Failed to update blog post');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center p-12">Loading blog post...</div>;
  }
  
  if (!blog) {
    return <div className="flex items-center justify-center p-12">Blog post not found</div>;
  }
  
  return (
    <CMSLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/cms/blogs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Edit Blog</h1>
          </div>
        </div>
        
        <BlogForm 
          initialData={blog}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </CMSLayout>
  );
}
