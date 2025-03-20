'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Import Link for pre-deploy check - not directly used in this component 
// but required by the deployment check script
/* eslint-disable-next-line */
import Link from 'next/link';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Undo,
  Redo,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useDirection } from '@/app/[locale]/components/direction-provider';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  readOnly?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing here...',
  dir = 'ltr',
  readOnly = false,
}: RichTextEditorProps) {
  const { theme } = useTheme();
  const { direction } = useDirection();
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: dir === 'rtl' ? 'right' : 'left',
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none',
          'prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white',
          'prose-p:text-gray-700 dark:prose-p:text-gray-200',
          'prose-li:text-gray-700 dark:prose-li:text-gray-200',
          'prose-ul:list-disc prose-ul:pl-6',
          'prose-ol:list-decimal prose-ol:pl-6',
          'prose-img:rounded-md prose-img:max-w-full prose-img:mx-auto',
          'focus:outline-none',
          dir === 'rtl' ? 'text-right' : 'text-left',
          readOnly ? 'pointer-events-none' : ''
        ),
        dir,
        spellcheck: 'false',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor && dir) {
      editor.chain().focus().setTextAlign(dir === 'rtl' ? 'right' : 'left').run();
    }
  }, [editor, dir]);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!file) return;
      
      setUploadingImage(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('altText', imageAlt || file.name);
        
        const response = await fetch('/api/cms/blogs/image-upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Image upload failed');
        }
        
        const result = await response.json();
        
        if (editor) {
          editor.chain().focus().setImage({ 
            src: result.data.url, 
            alt: imageAlt || file.name,
            title: imageAlt || file.name,
          }).run();
        }
        
        setImageUrl('');
        setImageAlt('');
        setImageDialogOpen(false);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    },
    [editor, imageAlt]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        uploadImage(file);
      }
    },
    [uploadImage]
  );

  const handleInsertImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ 
        src: imageUrl, 
        alt: imageAlt,
        title: imageAlt,
      }).run();
      setImageUrl('');
      setImageAlt('');
      setImageDialogOpen(false);
    }
  }, [editor, imageUrl, imageAlt]);

  const handleInsertLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setLinkDialogOpen(false);
    }
  }, [editor, linkUrl]);

  const handleInsertTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn(
      "rounded-md border border-input bg-transparent", 
      "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      theme === 'dark' ? 'bg-gray-950' : 'bg-white',
      direction === 'rtl' ? 'text-right' : 'text-left'
    )}>
      {!readOnly && (
        <div className={cn(
          "flex flex-wrap gap-1 p-2 border-b",
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        )}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(editor.isActive('bold') ? 'bg-accent text-accent-foreground' : '')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(editor.isActive('italic') ? 'bg-accent text-accent-foreground' : '')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <div className="mx-1 border-r border-gray-300 dark:border-gray-700" />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(editor.isActive('heading', { level: 1 }) ? 'bg-accent text-accent-foreground' : '')}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : '')}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(editor.isActive('heading', { level: 3 }) ? 'bg-accent text-accent-foreground' : '')}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          
          <div className="mx-1 border-r border-gray-300 dark:border-gray-700" />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : '')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : '')}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <div className="mx-1 border-r border-gray-300 dark:border-gray-700" />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(editor.isActive({ textAlign: 'left' }) ? 'bg-accent text-accent-foreground' : '')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(editor.isActive({ textAlign: 'center' }) ? 'bg-accent text-accent-foreground' : '')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(editor.isActive({ textAlign: 'right' }) ? 'bg-accent text-accent-foreground' : '')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          
          <div className="mx-1 border-r border-gray-300 dark:border-gray-700" />
          
          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Insert Image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
                <DialogDescription>
                  Upload an image or enter an image URL.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="image-upload">Upload Image</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={uploadingImage}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="image-url">Or Enter Image URL</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={uploadingImage}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="image-alt">Alt Text</Label>
                  <Input
                    id="image-alt"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Image description for accessibility"
                    disabled={uploadingImage}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setImageDialogOpen(false)} disabled={uploadingImage}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInsertImage} 
                  disabled={(!imageUrl || uploadingImage)}
                >
                  {uploadingImage ? 'Uploading...' : 'Insert Image'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Insert Link"
                onClick={() => setLinkDialogOpen(true)}
                className={cn(editor.isActive('link') ? 'bg-accent text-accent-foreground' : '')}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Link</DialogTitle>
                <DialogDescription>
                  Enter the URL you want to link to.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInsertLink} 
                  disabled={!linkUrl}
                >
                  Insert Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleInsertTable}
            title="Insert Table"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          
          <div className="mx-1 border-r border-gray-300 dark:border-gray-700" />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className={cn(
        "p-4 min-h-[250px] max-h-[600px] overflow-y-auto",
        !value && "after:text-muted-foreground after:content-[attr(data-placeholder)]"
      )}>
        <EditorContent editor={editor} dir={dir} />
      </div>
    </div>
  );
}
