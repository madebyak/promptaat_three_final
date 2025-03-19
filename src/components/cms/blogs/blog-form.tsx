'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, CalendarIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import RichTextEditor from './rich-text-editor';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useDirection } from '@/app/[locale]/components/direction-provider';
import { toast } from 'sonner';
import Image from 'next/image';

// Blog schema for form validation
export const blogFormSchema = z
  .object({
    titleEn: z.string().optional(),
    titleAr: z.string().optional(),
    contentEn: z.string().optional(),
    contentAr: z.string().optional(),
    summaryEn: z.string().optional(),
    summaryAr: z.string().optional(),
    featuredImage: z.string().optional().nullable(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    readTimeMinutes: z.coerce.number().int().positive().optional().nullable(),
    metaTitleEn: z.string().optional(),
    metaTitleAr: z.string().optional(),
    metaDescriptionEn: z.string().optional(),
    metaDescriptionAr: z.string().optional(),
    tags: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      // Only validate required fields if status is published
      if (data.status === 'published') {
        return (
          !!data.titleEn &&
          data.titleEn.length >= 3 &&
          !!data.titleAr &&
          data.titleAr.length >= 3 &&
          !!data.contentEn &&
          data.contentEn.length >= 10 &&
          !!data.contentAr &&
          data.contentAr.length >= 10
        );
      }
      return true;
    },
    {
      message: 'Published blogs require complete content in both languages',
      path: ['status'],
    }
  );

type BlogFormValues = z.infer<typeof blogFormSchema>;

type BlogFormProps = {
  initialData?: BlogFormValues & { id?: string };
  onSubmit: (data: BlogFormValues) => Promise<void>;
  isSubmitting: boolean;
};

export default function BlogForm({ initialData, onSubmit, isSubmitting }: BlogFormProps) {
  const { direction } = useDirection();
  const [activeTab, setActiveTab] = useState<'english' | 'arabic'>('english');
  const [tagInput, setTagInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.featuredImage || null);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: initialData || {
      titleEn: '',
      titleAr: '',
      contentEn: '',
      contentAr: '',
      summaryEn: '',
      summaryAr: '',
      featuredImage: '',
      status: 'draft',
      readTimeMinutes: undefined,
      metaTitleEn: '',
      metaTitleAr: '',
      metaDescriptionEn: '',
      metaDescriptionAr: '',
      tags: [],
    },
  });

  const { watch, setValue } = form;
  const tags = watch('tags');
  const status = watch('status');

  useEffect(() => {
    // Reset publishedAt when switching back to draft
    if (status === 'draft') {
      setValue('publishedAt', null);
    }
  }, [status, setValue]);

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagDelete = (tag: string) => {
    setValue('tags', tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit');
      return;
    }
    
    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name || '');
      
      const response = await fetch('/api/cms/blogs/image-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const { data } = await response.json();
      
      // Set the image URL in the form
      setValue('featuredImage', data.url || '');
      setPreviewImage(data.url || '');
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (data: BlogFormValues) => {
    try {
      // Add tags to the form data
      const formData = {
        ...data,
        tags,
      };
      
      // Ensure proper data formatting
      const formattedData = {
        ...formData,
        // Make sure readTimeMinutes is explicitly an integer or null, not undefined
        readTimeMinutes: formData.readTimeMinutes 
          ? parseInt(String(formData.readTimeMinutes), 10) 
          : null,
      };
      
      console.log('Submitting form data:', formattedData);
      
      // Only call onSubmit if it's defined
      if (typeof onSubmit === 'function') {
        await onSubmit(formattedData);
      } else {
        console.error('onSubmit function is not defined');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('An error occurred while submitting the form');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as 'english' | 'arabic')}>
          <TabsList className="mb-6">
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="arabic">Arabic</TabsTrigger>
          </TabsList>

          {/* English Content */}
          <TabsContent value="english" className="space-y-6">
            <FormField
              control={form.control}
              name="titleEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter blog title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summaryEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief summary"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Start writing your blog content..."
                      dir="ltr"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaTitleEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title (SEO)</FormLabel>
                  <FormControl>
                    <Input placeholder="Meta title for SEO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description (SEO)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Meta description for SEO"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Arabic Content */}
          <TabsContent value="arabic" className="space-y-6">
            <FormField
              control={form.control}
              name="titleAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter blog title in Arabic" 
                      {...field} 
                      className="text-right"
                      dir="rtl" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summaryAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief summary in Arabic"
                      className="min-h-20 text-right"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Start writing your blog content in Arabic..."
                      dir="rtl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaTitleAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title (SEO)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Meta title for SEO in Arabic" 
                      {...field} 
                      className="text-right"
                      dir="rtl" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescriptionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description (SEO)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Meta description for SEO in Arabic"
                      className="min-h-20 text-right"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* Common Fields for both languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === 'published' && (
              <div>
                <FormLabel>Publication Date</FormLabel>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically set by the backend</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="readTimeMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Read Time (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Estimated reading time"
                      {...field}
                      value={field.value === null || field.value === undefined ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : null;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel htmlFor="tags">Tags</FormLabel>
              <div className="flex items-center space-x-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tags (press Enter to add)"
                  className="flex-1"
                />
                <Button type="button" onClick={handleTagAdd} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm py-1 px-2">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => handleTagDelete(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <FormLabel htmlFor="featured-image">Featured Image</FormLabel>
              <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                {previewImage && (
                  <div className="relative mb-4 w-full h-64 rounded-md overflow-hidden">
                    <Image
                      src={previewImage}
                      alt="Image preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setValue('featuredImage', '');
                        setPreviewImage(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {!previewImage && (
                  <div className="py-6">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Click to upload a featured image
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Recommended: 1200×630px (1.91:1 ratio) • Max 5MB • JPG, PNG, GIF, WebP
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <Input
                    id="featured-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('featured-image')?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Select Image'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Blog' : 'Create Blog'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
