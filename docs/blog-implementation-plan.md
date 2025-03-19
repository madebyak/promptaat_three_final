# Blog Implementation Plan for Promptaat

## 1. Database Schema Design

We need to add a Blog model to your Prisma schema:

```prisma
model Blog {
  id           String    @id @default(uuid())
  slug         String    @unique // For SEO-friendly URLs
  titleEn      String    @map("title_en")
  titleAr      String    @map("title_ar")
  contentEn    String    @map("content_en") @db.Text // Using db.Text for long content
  contentAr    String    @map("content_ar") @db.Text
  summaryEn    String?   @map("summary_en") // Short description for previews
  summaryAr    String?   @map("summary_ar")
  featuredImage String?  @map("featured_image") // URL to featured image
  authorId     String    @map("author_id")
  publishedAt  DateTime? @map("published_at") // Null if draft
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")
  status       String    @default("draft") // "draft", "published", "archived"
  readTimeMinutes Int?   @map("read_time_minutes")
  metaTitleEn  String?   @map("meta_title_en") // SEO fields
  metaTitleAr  String?   @map("meta_title_ar")
  metaDescriptionEn String? @map("meta_description_en")
  metaDescriptionAr String? @map("meta_description_ar")
  tags         BlogTag[]
  author       AdminUser @relation(fields: [authorId], references: [id])

  @@map("blogs")
}

model BlogTag {
  blogId     String    @map("blog_id")
  tagName    String    @map("tag_name") 
  blog       Blog      @relation(fields: [blogId], references: [id], onDelete: Cascade)

  @@id([blogId, tagName])
  @@map("blog_tags")
}
```

## 2. CMS Blog Management Components

### 2.1. Blogs Management Page

Similar to the prompts management page, with a table view showing:

- Blog title (English/Arabic tabs)
- Status (draft/published)
- Published date
- Author
- Actions (view, edit, delete)

### 2.2. Blog Form Component

We'll create a rich form component with:

1. **Rich Text Editor**

   - Using [TipTap Editor](https://tiptap.dev/) for WYSIWYG editing
   - Support for formatting, headings, links, images, tables
   - Code blocks with syntax highlighting
   - Markdown support
   - **Image Upload Integration**: Direct integration with Cloudinary or AWS S3 for in-editor image uploads
   - **Responsive Image Controls**: Mobile-friendly image insertion and resizing controls

2. **Form Fields**

   - Title (English/Arabic)
   - Summary (English/Arabic)
   - Content (English/Arabic with rich text editor)
   - Featured image upload
   - Tags (multiple selection)
   - SEO metadata fields
   - Publish status toggle
   - Schedule publishing option
   - **Fully RTL Compatible Fields**: All form fields will properly switch layout and alignment for Arabic

3. **Preview Mode**

   - Live preview of how the blog will look on the website
   - **Theme Toggle Preview**: Preview in both light and dark themes
   - **Mobile/Desktop Toggle**: Preview on different screen sizes

## 3. API Endpoints

### 3.1. CMS API Routes

```javascript
/api/cms/blogs
  - GET: List all blogs with filtering/pagination
  - POST: Create a new blog

/api/cms/blogs/[id]
  - GET: Get blog by ID
  - PATCH: Update blog
  - DELETE: Soft delete blog

/api/cms/blogs/[id]/status
  - PATCH: Update blog status (publish/unpublish)

/api/cms/blogs/image-upload
  - POST: Upload blog images
```

### 3.2. Public API Routes

```javascript
/api/blogs
  - GET: Get published blogs with pagination/filtering

/api/blogs/[slug]
  - GET: Get a single published blog by slug

/api/blogs/tags
  - GET: Get all blog tags for filtering
```

## 4. Frontend Blog Pages

### 4.1. Blog Listing Page

For `/[locale]/company/blog`:

- Hero section with title and description
- Filter by tags
- Blog cards with:
  - Featured image
  - Title
  - Summary
  - Published date
  - Read time
  - Author
- Pagination or infinite scroll
- Responsive grid layout

### 4.2. Blog Detail Page

For `/[locale]/company/blog/[slug]`:

- Dynamic route using the blog slug
- Featured image
- Title
- Author info
- Published date and read time
- Rich content display (handling all formatting from the editor)
- Share buttons for social media
- Related blogs section
- Comments section (optional)
- Next/previous blog navigation

## 5. URL Structure & Flow

The blog URL structure will be:

- Blog listing: `/en/company/blog` or `/ar/company/blog`
- Individual blog: `/en/company/blog/[slug]` or `/ar/company/blog/[slug]`

When a user clicks on a blog post from the listing page, they'll be taken to the individual blog page with the unique slug. This ensures:

- SEO-friendly URLs
- Easy sharing on social media
- Proper bookmarking capability
- Clear user navigation

## 6. Implementation Approach

I recommend implementing this feature in the following order:

1. **Database Schema First**: Add the Blog and BlogTag models to your Prisma schema
2. **API Layer**: Implement the backend API endpoints
3. **CMS Interface**: Create the blog management components
4. **Public Pages**: Build the public-facing blog pages
5. **Testing & Refinement**: Test all functionality across browsers and languages

## 7. Technical Considerations

- **Image Handling for Vercel Deployment**:
  - Implement Cloudinary integration for image storage (recommended solution for Vercel)
  - Create a custom image upload extension for the TipTap editor
  - Store image URLs in the content as JSON nodes rather than base64 encoded data
  - Generate responsive image variations (different sizes) on upload
  - Implement progressive loading for images in blog content

- **Responsive Design Requirements**:
  - All modals and forms will use responsive design patterns
  - Implement custom breakpoints for different device sizes
  - Use fluid typography and spacing
  - Test on real devices including mobile phones and tablets
  - Ensure touch-friendly UI elements (appropriate sizing)
  
- **RTL & Theme Support**:
  - Use the `useTheme` hook for real-time theme changes
  - Implement conditional styling with the `cn` utility
  - Use directional-neutral CSS properties (start/end instead of left/right)
  - Test all components in both language directions
  - Ensure theme colors use Tailwind's dark mode syntax: `bg-white dark:bg-black-main`
  - Properly flip icons and directional elements in RTL mode

- **Caching**: Implement caching strategies for published blogs to improve performance
- **SEO**: Include proper metadata, Open Graph tags, and structured data
- **Accessibility**: Ensure all blog content is accessible (ARIA attributes, keyboard navigation)
- **Performance**: Optimize image loading with next/image and consider SSR/ISR for blog pages

## 8. Component Structure

### 8.1. CMS Components

```javascript
/src/components/cms/blogs/
  - blogs-management.tsx      # Table view of all blogs
  - create-blog.tsx           # Create new blog form wrapper
  - edit-blog.tsx             # Edit existing blog form wrapper
  - view-blog.tsx             # View blog details
  - delete-blog.tsx           # Confirmation dialog for deletion
  - blog-form.tsx             # Reusable form component
  - rich-text-editor.tsx      # WYSIWYG editor component
  - image-upload.tsx          # Image upload component
```

### 8.2. Public Components

```javascript
/src/components/blog/
  - blog-list.tsx             # Main blog listing component
  - blog-card.tsx             # Individual blog preview card
  - blog-hero.tsx             # Hero section for blog listing
  - blog-filters.tsx          # Tag/category filtering
  - blog-pagination.tsx       # Pagination controls
  - blog-detail.tsx           # Blog post detail view
  - blog-author.tsx           # Author information component
  - blog-share.tsx            # Social sharing buttons
  - blog-related.tsx          # Related posts component
  - blog-content.tsx          # Rich content display with styling
```

## 9. File Structure

```javascript
/src/app/[locale]/company/blog/
  - page.tsx                   # Blog listing page
  - layout.tsx                 # Blog layout (optional)
  - [slug]/                    # Dynamic route for individual blogs
    - page.tsx                 # Individual blog page
    
/src/app/api/blogs/
  - route.ts                   # Public API for blog listing
  - [slug]/
    - route.ts                 # Public API for individual blog
  - tags/
    - route.ts                 # API for blog tags
    
/src/app/api/cms/blogs/
  - route.ts                   # CMS API for blog management
  - [id]/
    - route.ts                 # CMS API for individual blog operations
    - status/
      - route.ts               # API for changing blog status
  - image-upload/
    - route.ts                 # API for image uploads
```

## 10. Image Handling Solution

### 10.1. Cloudinary Integration

For a Vercel-hosted application, we'll implement Cloudinary as the image storage solution:

1. **Setup**:

   - Create a Cloudinary account and obtain API credentials
   - Set up a dedicated folder for blog images
   - Configure upload presets for different image types

2. **Implementation**:

   - Create a custom Cloudinary upload hook
   - Implement secure, authenticated uploads via API
   - Ensure proper error handling and retry logic

3. **Image Processing**:

   - Auto-generate thumbnails for featured images
   - Apply compression and optimization automatically
   - Generate responsive image variants for different screen sizes

4. **In-Editor Experience**:

   - Custom TipTap extension for Cloudinary uploads
   - Drag-and-drop image upload interface
   - Image positioning and sizing controls
   - Caption and alt text fields for accessibility

5. **Storage Structure**:

   - Store images in content as Cloudinary URLs with transformations
   - Format: `https://res.cloudinary.com/[cloud_name]/image/upload/[transformations]/[image_id]`
   - Save metadata in the database including alt text and captions

This approach provides:

- Scalable storage not limited by Vercel's serverless functions
- CDN delivery for global performance
- Image transformation and optimization on-the-fly
- No storage limitations from Vercel
- Better performance than storing images in the database

### 10.2. Advanced Frontend Rendering

The blog content renderer will include:

- Responsive image containers that maintain aspect ratio
- Lazy loading for images below the fold
- Blur-up loading placeholders
- Proper RTL image alignment based on text direction
- Dark/light theme compatible image containers
- Accessible image alternatives
