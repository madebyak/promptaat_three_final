# Changelog Feature Documentation

## Overview

The Changelog feature allows administrators to manage and publish updates about the Promptaat platform. It supports both English and Arabic content, rich text formatting, and image uploads. The changelog entries are displayed on the public-facing changelog page with proper pagination and RTL support for Arabic content.

## Components

### CMS Components

1. **ChangelogManagement (`/src/components/cms/changelog/changelog-management.tsx`)**
   - Main component for managing changelog entries in the CMS
   - Provides a table view of all entries with search and pagination
   - Integrates the add/edit and delete dialogs

2. **AddEditChangelog (`/src/components/cms/changelog/add-edit-changelog.tsx`)**
   - Dialog component for adding new or editing existing changelog entries
   - Includes rich text editors for both English and Arabic content
   - Supports image uploads using Vercel Blob storage

3. **DeleteChangelog (`/src/components/cms/changelog/delete-changelog.tsx`)**
   - Confirmation dialog for deleting changelog entries
   - Provides user feedback for successful deletion

### Public-Facing Components

1. **ChangelogList (`/src/app/[locale]/resources/changelog/components/changelog-list.tsx`)**
   - Displays changelog entries on the public-facing page
   - Supports pagination and proper RTL layout for Arabic content
   - Handles loading states and error messages

## API Routes

1. **Main Changelog API (`/src/app/api/cms/changelog/route.ts`)**
   - `GET`: Fetches all changelog entries with pagination and search
   - `POST`: Creates a new changelog entry

2. **Individual Changelog API (`/src/app/api/cms/changelog/[id]/route.ts`)**
   - `GET`: Fetches a specific changelog entry by ID
   - `PUT`: Updates a specific changelog entry
   - `DELETE`: Deletes a specific changelog entry

3. **Public Changelog API (`/src/app/api/resources/changelog/route.ts`)**
   - `GET`: Fetches changelog entries for the public-facing page with pagination

4. **Upload API (`/src/app/api/cms/upload/route.ts`)**
   - `POST`: Handles image uploads for changelog entries using Vercel Blob

## Database Schema

The Changelog model in the Prisma schema:

```prisma
model Changelog {
  id            String    @id @default(uuid())
  titleEn       String    @map("title_en")
  titleAr       String    @map("title_ar")
  contentEn     String    @map("content_en") @db.Text
  contentAr     String    @map("content_ar") @db.Text
  imageUrl      String?   @map("image_url")
  authorId      String    @map("author_id")
  publishedAt   DateTime  @default(now()) @map("published_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  author        AdminUser @relation(fields: [authorId], references: [id])
}
```

## Features

1. **Multilingual Support**
   - Full support for both English and Arabic content
   - RTL layout for Arabic content

2. **Rich Text Editing**
   - Support for formatting (bold, italic, lists, headings, etc.)
   - Link insertion
   - Proper RTL support for Arabic text

3. **Image Management**
   - Upload images for changelog entries
   - Images stored in Vercel Blob storage
   - Validation for file types and sizes

4. **Pagination and Search**
   - Server-side pagination for both CMS and public views
   - Search functionality in the CMS view

5. **Soft Delete**
   - Entries are soft-deleted (marked with a deletedAt timestamp)
   - Can be restored if needed

## Testing

A test script is available at `/scripts/test-changelog.js` to verify the functionality of the changelog feature. It tests the basic CRUD operations by:

1. Creating a test changelog entry
2. Fetching the created entry
3. Updating the entry
4. Verifying the update
5. Deleting the entry
6. Verifying the deletion

## Usage

### For Administrators

1. Navigate to the CMS at `/cms/changelog`
2. Use the "Add Changelog" button to create new entries
3. Fill in both English and Arabic content
4. Optionally upload an image
5. Use the table view to manage existing entries

### For Users

Users can view the changelog at `/resources/changelog` to see all published updates about the platform.

## Implementation Notes

- The rich text editor uses TipTap with custom extensions for placeholder and link support
- Image uploads are handled using Vercel Blob for reliable storage
- All API routes include proper authentication checks for CMS operations
- The public-facing API does not require authentication
- Proper error handling is implemented throughout the feature
