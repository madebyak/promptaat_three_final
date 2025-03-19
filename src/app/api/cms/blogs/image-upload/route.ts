import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

// Define allowed file types
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Image upload handler
export async function POST(request: NextRequest) {
  try {
    // Verify admin is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const altText = formData.get("altText") as string || "";
    
    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed types: JPEG, PNG, GIF, WebP" },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Generate a unique filename with original extension
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const uniqueId = nanoid(10);
    const filename = `blog-${uniqueId}.${fileExtension}`;

    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false, // Use our own unique ID
    });

    // Return the Blob result
    return NextResponse.json({
      data: {
        url: blob.url,
        altText,
        width: 1200, // We don't get dimensions from Vercel Blob, so using recommended
        height: 630, // dimensions as defaults for metadata
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/cms/blogs/image-upload:", error);
    return NextResponse.json(
      { error: "Failed to upload image", details: (error as Error).message },
      { status: 500 }
    );
  }
}
