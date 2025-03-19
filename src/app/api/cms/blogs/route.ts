import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import slugify from "slugify";
import { createAuditLog } from "@/lib/audit";

// Schema for creating a new blog
const createBlogSchema = z.object({
  titleEn: z.string().min(1, "English title is required").default(""),
  titleAr: z.string().min(1, "Arabic title is required").default(""),
  contentEn: z.string().min(1, "English content is required").default(""),
  contentAr: z.string().min(1, "Arabic content is required").default(""),
  summaryEn: z.string().optional().default(""),
  summaryAr: z.string().optional().default(""),
  featuredImage: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  readTimeMinutes: z.number().int().positive().optional().nullable(),
  metaTitleEn: z.string().optional().default(""),
  metaTitleAr: z.string().optional().default(""),
  metaDescriptionEn: z.string().optional().default(""),
  metaDescriptionAr: z.string().optional().default(""),
  tags: z.array(z.string()).default([]),
}).refine(
  (data) => {
    // If status is 'published', enforce stricter validation
    if (data.status === 'published') {
      return (
        data.titleEn.length >= 3 &&
        data.titleAr.length >= 3 &&
        data.contentEn.length >= 10 &&
        data.contentAr.length >= 10
      );
    }
    // For drafts, allow any content
    return true;
  },
  {
    message: 'Published blogs require complete content in both languages',
    path: ['status'],
  }
);

// Schema for filtering blogs
const filterBlogSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().optional(),
  tagName: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

// GET handler for listing blogs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Verify admin is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters = filterBlogSchema.parse({
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      tagName: searchParams.get("tagName") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
    });

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit;

    // Build filter conditions
    const whereConditions: Record<string, unknown> = {
      deletedAt: null,
    };

    if (filters.status) {
      whereConditions.status = filters.status;
    }

    if (filters.search) {
      whereConditions.OR = [
        { titleEn: { contains: filters.search, mode: "insensitive" } },
        { titleAr: { contains: filters.search, mode: "insensitive" } },
        { summaryEn: { contains: filters.search, mode: "insensitive" } },
        { summaryAr: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Handle tag filtering
    let blogIds: string[] = [];
    if (filters.tagName) {
      const blogsWithTag = await prisma.blogTag.findMany({
        where: {
          tagName: filters.tagName,
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

    // Count total blogs matching the filter
    const total = await prisma.blog.count({
      where: whereConditions,
    });

    // Calculate total pages
    const pages = Math.ceil(total / filters.limit);

    // Fetch blogs with pagination
    const blogs = await prisma.blog.findMany({
      where: whereConditions,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tags: {
          select: {
            tagName: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: filters.limit,
    });

    // Transform blogs to include tag names as an array
    const transformedBlogs = blogs.map((blog) => ({
      ...blog,
      tags: blog.tags.map((tag) => tag.tagName),
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
    console.error("Error in GET /api/cms/blogs:", error);
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

// POST handler for creating a new blog
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

    // Get admin ID
    const adminId = session.user.id;

    // Parse request body
    const body = await request.json();
    console.log("Received blog data:", JSON.stringify(body, null, 2));
    
    try {
      const validatedData = createBlogSchema.parse(body);
      
      // Generate slug from English title
      const baseSlug = slugify(validatedData.titleEn || 'untitled', {
        lower: true,
        strict: true,
      });
      
      // Add a random suffix to ensure uniqueness
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const slug = baseSlug || `blog-${randomSuffix}`;

      // Check if slug already exists
      const existingBlog = await prisma.blog.findUnique({
        where: { slug },
      });

      // If slug exists, append a random suffix
      const finalSlug = existingBlog 
        ? `${slug}-${randomSuffix}` 
        : slug;

      // Prepare blog data
      const blogData = {
        slug: finalSlug,
        titleEn: validatedData.titleEn,
        titleAr: validatedData.titleAr,
        contentEn: validatedData.contentEn,
        contentAr: validatedData.contentAr,
        summaryEn: validatedData.summaryEn,
        summaryAr: validatedData.summaryAr,
        featuredImage: validatedData.featuredImage,
        status: validatedData.status,
        readTimeMinutes: validatedData.readTimeMinutes,
        metaTitleEn: validatedData.metaTitleEn,
        metaTitleAr: validatedData.metaTitleAr,
        metaDescriptionEn: validatedData.metaDescriptionEn,
        metaDescriptionAr: validatedData.metaDescriptionAr,
        authorId: adminId,
        publishedAt: validatedData.status === "published" 
          ? new Date() 
          : null,
      };

      // Create the blog with transaction to handle tags
      const newBlog = await prisma.$transaction(async (tx) => {
        // Create the blog
        const blog = await tx.blog.create({
          data: blogData,
        });

        // Create tags if provided
        if (validatedData.tags && validatedData.tags.length > 0) {
          const tagData = validatedData.tags.map((tag) => ({
            blogId: blog.id,
            tagName: tag,
          }));

          await tx.blogTag.createMany({
            data: tagData,
          });
        }

        return blog;
      });

      // Create audit log
      await createAuditLog({
        adminId,
        action: "create",
        entityType: "blog",
        entityId: newBlog.id,
        details: { blogTitle: newBlog.titleEn },
      });

      // Fetch the created blog with tags
      const createdBlog = await prisma.blog.findUnique({
        where: { id: newBlog.id },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          tags: {
            select: {
              tagName: true,
            },
          },
        },
      });

      // Transform blog to include tag names as an array
      const transformedBlog = {
        ...createdBlog,
        tags: createdBlog?.tags.map((tag) => tag.tagName) || [],
      };

      return NextResponse.json(
        { data: transformedBlog },
        { status: 201 }
      );
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid request data", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError; // Re-throw if it's not a ZodError
    }
  } catch (error) {
    console.error("Error in POST /api/cms/blogs:", error);
    return NextResponse.json(
      { error: "Internal server error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
