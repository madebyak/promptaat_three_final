import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import slugify from "slugify";
import { createAuditLog } from "@/lib/audit";

// Schema for updating a blog
const updateBlogSchema = z.object({
  titleEn: z.string().min(1, "English title is required").optional(),
  titleAr: z.string().min(1, "Arabic title is required").optional(),
  contentEn: z.string().min(1, "English content is required").optional(),
  contentAr: z.string().min(1, "Arabic content is required").optional(),
  summaryEn: z.string().optional(),
  summaryAr: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  readTimeMinutes: z.number().int().positive().optional(),
  metaTitleEn: z.string().optional(),
  metaTitleAr: z.string().optional(),
  metaDescriptionEn: z.string().optional(),
  metaDescriptionAr: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // Removed publishedAt from schema to prevent validation issues
});

// GET handler for retrieving a blog by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params.id;

    // Fetch the blog by ID
    const blog = await prisma.blog.findUnique({
      where: { id, deletedAt: null },
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

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    // Transform blog to include tag names as an array
    const transformedBlog = {
      ...blog,
      tags: blog.tags.map((tag) => tag.tagName),
    };

    return NextResponse.json(
      { data: transformedBlog },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in GET /api/cms/blogs/${params.id}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a blog
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get blog ID from params
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }
    
    // Get admin ID
    const adminId = session.user.id;
    
    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });
    
    if (!existingBlog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    console.log("PATCH request body:", JSON.stringify(body, null, 2));
    
    try {
      const validatedData = updateBlogSchema.parse(body);
      console.log("After validation:", JSON.stringify(validatedData, null, 2));
      
      // Prepare update data
      const updateData: Prisma.BlogUpdateInput = {};
      
      // Only add validated properties to the update data
      // This prevents any unexpected properties from being sent to Prisma
      if (validatedData.titleEn) updateData.titleEn = validatedData.titleEn;
      if (validatedData.titleAr) updateData.titleAr = validatedData.titleAr;
      if (validatedData.contentEn) updateData.contentEn = validatedData.contentEn;
      if (validatedData.contentAr) updateData.contentAr = validatedData.contentAr;
      if (validatedData.summaryEn !== undefined) updateData.summaryEn = validatedData.summaryEn;
      if (validatedData.summaryAr !== undefined) updateData.summaryAr = validatedData.summaryAr;
      if (validatedData.featuredImage !== undefined) updateData.featuredImage = validatedData.featuredImage;
      if (validatedData.status) updateData.status = validatedData.status;
      if (validatedData.metaTitleEn !== undefined) updateData.metaTitleEn = validatedData.metaTitleEn;
      if (validatedData.metaTitleAr !== undefined) updateData.metaTitleAr = validatedData.metaTitleAr;
      if (validatedData.metaDescriptionEn !== undefined) updateData.metaDescriptionEn = validatedData.metaDescriptionEn;
      if (validatedData.metaDescriptionAr !== undefined) updateData.metaDescriptionAr = validatedData.metaDescriptionAr;
      
      // Handle readTimeMinutes with special attention to proper type conversion
      if (validatedData.readTimeMinutes !== undefined) {
        if (validatedData.readTimeMinutes === null) {
          updateData.readTimeMinutes = null;
        } else {
          updateData.readTimeMinutes = Number(validatedData.readTimeMinutes);
          
          // Make sure it's a valid number
          if (isNaN(updateData.readTimeMinutes as number)) {
            return NextResponse.json(
              { error: "readTimeMinutes must be a valid number" },
              { status: 400 }
            );
          }
        }
      }
      
      // Handle slug update if title changed
      if (validatedData.titleEn && validatedData.titleEn !== existingBlog.titleEn) {
        const baseSlug = slugify(validatedData.titleEn, {
          lower: true,
          strict: true,
        });
        
        // Ensure slug is never empty
        const slugBase = baseSlug || `blog-${Math.random().toString(36).substring(2, 8)}`;
        
        // Add random suffix to ensure uniqueness
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const newSlug = `${slugBase}-${randomSuffix}`;
        
        updateData.slug = newSlug;
      }
      
      // Handle publishedAt field based on status
      if (validatedData.status === "published" && existingBlog.status !== "published") {
        // When publishing for the first time, set publishedAt to current date
        updateData.publishedAt = new Date();
        console.log("Setting publishedAt to current date:", updateData.publishedAt);
      } else if (validatedData.status === "draft" && existingBlog.status === "published") {
        // When unpublishing, clear the date
        updateData.publishedAt = null;
        console.log("Setting publishedAt to null");
      }
      // Otherwise leave publishedAt as is
      
      console.log("Final update data:", JSON.stringify(updateData, null, 2));

      // Add tags to a separate variable, not in the main updateData
      // This prevents any schema issues when updating the blog directly
      const tags = validatedData.tags;

      // Update blog with transaction to handle tags
      await prisma.$transaction(async (tx) => {
        // Update the blog
        await tx.blog.update({
          where: { id },
          data: updateData,
        });

        // Handle tags if provided
        if (tags) {
          // Delete existing tags
          await tx.blogTag.deleteMany({
            where: { blogId: id },
          });

          // Create new tags
          if (tags.length > 0) {
            const tagData = tags.map((tag) => ({
              blogId: id,
              tagName: tag,
            }));

            await tx.blogTag.createMany({
              data: tagData,
            });
          }
        }
      });

      // Create audit log
      await createAuditLog({
        adminId,
        action: "update",
        entityType: "blog",
        entityId: id,
        details: { 
          blogTitle: validatedData.titleEn || existingBlog.titleEn,
          changedFields: Object.keys(validatedData),
        },
      });

      // Fetch the updated blog with tags
      const blogWithDetails = await prisma.blog.findUnique({
        where: { id },
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
        ...blogWithDetails,
        tags: blogWithDetails?.tags.map((tag) => tag.tagName) || [],
      };

      return NextResponse.json(
        { data: transformedBlog },
        { status: 200 }
      );
    } catch (error) {
      console.error(`Error in PATCH /api/cms/blogs/${params.id}:`, error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid request data", details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error in PATCH /api/cms/blogs/${params.id}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT handler to handle PUT requests (redirecting to PATCH)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect to the PATCH handler to avoid duplicating code
  return PATCH(request, { params });
}

// DELETE handler for soft-deleting a blog
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const adminId = session.user.id;
    const id = params.id;

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    // Soft delete the blog
    await prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await createAuditLog({
      adminId,
      action: "delete",
      entityType: "blog",
      entityId: id,
      details: { blogTitle: existingBlog.titleEn },
    });

    return NextResponse.json(
      { message: "Blog deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/cms/blogs/${params.id}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
