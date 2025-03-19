import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for filtering public blogs
const filterBlogSchema = z.object({
  tagName: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(9),
  locale: z.enum(["en", "ar"]).default("en"),
});

// GET handler for listing published blogs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters = filterBlogSchema.parse({
      tagName: searchParams.get("tagName") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 9,
      locale: searchParams.get("locale") || "en",
    });

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit;

    // Build filter conditions for published blogs only
    const whereConditions: any = {
      status: "published",
      publishedAt: { not: null },
      deletedAt: null,
    };

    // Add search filtering based on locale
    if (filters.search) {
      if (filters.locale === "en") {
        whereConditions.OR = [
          { titleEn: { contains: filters.search, mode: "insensitive" } },
          { summaryEn: { contains: filters.search, mode: "insensitive" } },
          { contentEn: { contains: filters.search, mode: "insensitive" } },
        ];
      } else {
        whereConditions.OR = [
          { titleAr: { contains: filters.search, mode: "insensitive" } },
          { summaryAr: { contains: filters.search, mode: "insensitive" } },
          { contentAr: { contains: filters.search, mode: "insensitive" } },
        ];
      }
    }

    // Handle tag filtering
    let blogIds: string[] = [];
    if (filters.tagName) {
      const blogsWithTag = await prisma.blogTag.findMany({
        where: {
          tagName: filters.tagName,
          blog: {
            status: "published",
            publishedAt: { not: null },
            deletedAt: null,
          },
        },
        select: {
          blogId: true,
        },
      });
      blogIds = blogsWithTag.map((blog) => blog.blogId);
      
      if (blogIds.length > 0) {
        whereConditions.id = { in: blogIds };
      } else {
        // If no blogs with the tag are found, return empty result
        return NextResponse.json(
          {
            data: [],
            pagination: {
              total: 0,
              pages: 0,
              page: filters.page,
              limit: filters.limit,
            },
          },
          { status: 200 }
        );
      }
    }

    // Count total published blogs matching the filter
    const total = await prisma.blog.count({
      where: whereConditions,
    });

    // Calculate total pages
    const pages = Math.ceil(total / filters.limit);

    // Fetch published blogs with pagination
    const blogs = await prisma.blog.findMany({
      where: whereConditions,
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
      orderBy: {
        publishedAt: "desc",
      },
      skip,
      take: filters.limit,
    });

    // Transform blogs to include tag names as an array and format author name
    const transformedBlogs = blogs.map((blog) => ({
      ...blog,
      tags: blog.tags.map((tag) => tag.tagName),
      author: blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : null,
    }));

    return NextResponse.json(
      {
        data: transformedBlogs,
        pagination: {
          total,
          pages,
          page: filters.page,
          limit: filters.limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/blogs:", error);
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
