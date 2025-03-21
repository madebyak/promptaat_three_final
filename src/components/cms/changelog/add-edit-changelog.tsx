'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { Loader2, Upload } from 'lucide-react';
import Image from 'next/image';

// Dynamic import of the rich text editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading editor...</div>,
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

interface AddEditChangelogProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  changelog: Changelog | null;
  isEditing: boolean;
}

export default function AddEditChangelog({ isOpen, onClose, changelog, isEditing }: AddEditChangelogProps) {
  const [activeTab, setActiveTab] = useState('english');
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with changelog data if editing
  useEffect(() => {
    if (isEditing && changelog) {
      setTitleEn(changelog.titleEn);
      setTitleAr(changelog.titleAr);
      setContentEn(changelog.contentEn);
      setContentAr(changelog.contentAr);
      setImageUrl(changelog.imageUrl);
      setImagePreview(changelog.imageUrl);
    }
  }, [isEditing, changelog]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Vercel Blob
  const uploadImage = async () => {
    if (!imageFile) return null;
    
    setIsUploading(true);
    try {
      // Upload the image via our API endpoint instead of direct Blob access
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!titleEn.trim() || !titleAr.trim() || !contentEn.trim() || !contentAr.trim()) {
      toast.error('Please fill in all required fields in both languages');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload image if a new one is selected
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage();
        if (!finalImageUrl) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare data
      const changelogData = {
        titleEn,
        titleAr,
        contentEn,
        contentAr,
        imageUrl: finalImageUrl,
      };
      
      // Send request to API
      const url = isEditing 
        ? `/api/cms/changelog/${changelog?.id}` 
        : '/api/cms/changelog';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changelogData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save changelog');
      }
      
      toast.success(isEditing ? 'Changelog updated successfully' : 'Changelog created successfully');
      onClose(true);
    } catch (error) {
      console.error('Error saving changelog:', error);
      toast.error('Failed to save changelog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Changelog' : 'Add New Changelog'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="english">English</TabsTrigger>
              <TabsTrigger value="arabic">Arabic</TabsTrigger>
            </TabsList>
            
            <TabsContent value="english" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="titleEn">Title (English)</Label>
                <Input
                  id="titleEn"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Enter changelog title in English"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contentEn">Content (English)</Label>
                <RichTextEditor
                  value={contentEn}
                  onChange={setContentEn}
                  placeholder="Enter changelog content in English"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="arabic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="titleAr">Title (Arabic)</Label>
                <Input
                  id="titleAr"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="Enter changelog title in Arabic"
                  dir="rtl"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contentAr">Content (Arabic)</Label>
                <RichTextEditor
                  value={contentAr}
                  onChange={setContentAr}
                  placeholder="Enter changelog content in Arabic"
                  dir="rtl"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <Label>Featured Image</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <span className="text-sm text-muted-foreground">
                Recommended size: 800x450px (16:9)
              </span>
            </div>
            
            {imagePreview && (
              <div className="mt-4 relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Changelog' : 'Create Changelog'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
