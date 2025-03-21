import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getCurrentAdmin } from '@/lib/cms/auth/server-auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Vercel Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN not configured in environment variables' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds the 5MB limit.' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const filename = `uploads/${timestamp}-${originalName}`;

    try {
      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
      });
      
      return NextResponse.json({ url: blob.url });
    } catch (blobError) {
      console.error('Blob upload error:', blobError);
      return NextResponse.json(
        { error: 'Failed to upload to blob storage. Check your BLOB_READ_WRITE_TOKEN.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
