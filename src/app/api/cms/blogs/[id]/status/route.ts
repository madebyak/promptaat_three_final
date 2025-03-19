import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";

// Schema for updating blog status
const updateStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

// PATCH handler for updating a blog's status
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

    // Parse request body
    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);

    // Prepare update data
    const updateData: any = { status };

    // Set publishedAt if status is changing to published
    if (status === "published" && existingBlog.status !== "published") {
      updateData.publishedAt = new Date();
    } else if (status === "draft" && existingBlog.status === "published") {
      // Remove publishedAt if unpublishing
      updateData.publishedAt = null;
    }

    // Update the blog status
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: updateData,
    });

    // Create audit log
    await createAuditLog({
      adminId,
      action: "UPDATE_STATUS",
      entityType: "BLOG",
      entityId: id,
      details: { 
        blogTitle: existingBlog.titleEn,
        previousStatus: existingBlog.status,
        newStatus: status,
      },
    });

    return NextResponse.json(
      { 
        data: {
          id: updatedBlog.id,
          status: updatedBlog.status,
          publishedAt: updatedBlog.publishedAt,
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PATCH /api/cms/blogs/${params.id}/status:`, error);
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
}
