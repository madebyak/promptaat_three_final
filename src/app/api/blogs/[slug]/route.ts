import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for locale parameter
const localeSchema = z.object({
  locale: z.enum(["en", "ar"]).default("en"),
});

// GET handler for retrieving a published blog by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // Parse query parameters for locale
    const { searchParams } = new URL(request.url);
    const { locale } = localeSchema.parse({
      locale: searchParams.get("locale") || "en",
    });

    // Fetch the published blog by slug
    const blog = await prisma.blog.findFirst({
      where: { 
        slug,
        status: "published",
        publishedAt: { not: null },
        deletedAt: null
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        tags: {
          select: {
            tagName: true,
          },
        },
      },
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    // Transform blog to include tag names as an array and format author name
    const transformedBlog = {
      ...blog,
      tags: blog.tags.map((tag) => tag.tagName),
      author: blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : null,
      // Only include the content for the requested locale to reduce payload size
      contentEn: locale === "en" ? blog.contentEn : undefined,
      contentAr: locale === "ar" ? blog.contentAr : undefined,
    };

    // Get related blogs with the same tags
    const tagNames = blog.tags.map(tag => tag.tagName);
    
    // Define explicit type for relatedBlogs
    interface RelatedBlog {
      id: string;
      slug: string;
      titleEn: string | null;
      titleAr: string | null;
      summaryEn: string | null;
      summaryAr: string | null;
      featuredImage: string | null;
      publishedAt: Date | null;
      readTimeMinutes: number | null;
      tags: string[];
    }
    
    let relatedBlogs: RelatedBlog[] = [];
    if (tagNames.length > 0) {
      // Find blogs that share tags with the current blog
      const blogsWithRelatedTags = await prisma.blog.findMany({
        where: {
          id: { not: blog.id }, // Exclude current blog
          status: "published",
          publishedAt: { not: null },
          deletedAt: null,
          tags: {
            some: {
              tagName: { in: tagNames }
            }
          }
        },
        select: {
          id: true,
          slug: true,
          titleEn: true,
          titleAr: true,
          summaryEn: true,
          summaryAr: true,
          featuredImage: true,
          publishedAt: true,
          readTimeMinutes: true,
          tags: {
            select: {
              tagName: true,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: 3, // Limit to 3 related blogs
      });

      relatedBlogs = blogsWithRelatedTags.map(blog => ({
        ...blog,
        tags: blog.tags.map(tag => tag.tagName),
      }));
    }

    return NextResponse.json(
      { 
        data: transformedBlog,
        relatedBlogs
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in GET /api/blogs/${params.slug}:`, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
