import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema for prompt update
const promptUpdateSchema = z.object({
  titleEn: z.string().min(3).optional(),
  titleAr: z.string().min(3).optional(),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  instructionEn: z.string().optional().nullable(),
  instructionAr: z.string().optional().nullable(),
  promptTextEn: z.string().min(10).optional(),
  promptTextAr: z.string().min(10).optional(),
  isPro: z.boolean().optional(),
  copyCount: z.number().int().nonnegative().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  toolIds: z.array(z.string()).optional(),
});

// GET - Fetch a single prompt by ID
export async function GET(
  request: NextRequest
) {
  try {
    // Get current admin
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    // Fetch the prompt with related data
    const prompt = await prisma.prompt.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        categories: {
          include: {
            category: true,
            subcategory: true,
          },
        },
        tools: {
          include: {
            tool: true,
          },
        },
        keywords: true,
      },
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
    // Transform data for the frontend
    const transformedPrompt = {
      id: prompt.id,
      titleEn: prompt.titleEn,
      titleAr: prompt.titleAr,
      descriptionEn: prompt.descriptionEn,
      descriptionAr: prompt.descriptionAr,
      instructionEn: prompt.instructionEn,
      instructionAr: prompt.instructionAr,
      promptTextEn: prompt.promptTextEn,
      promptTextAr: prompt.promptTextAr,
      isPro: prompt.isPro,
      copyCount: prompt.copyCount,
      initialCopyCount: prompt.initialCopyCount,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
      category: prompt.categories[0]?.category ? {
        id: prompt.categories[0].category.id,
        name: prompt.categories[0].category.nameEn,
        nameAr: prompt.categories[0].category.nameAr,
      } : null,
      subcategory: prompt.categories[0]?.subcategory ? {
        id: prompt.categories[0].subcategory.id,
        name: prompt.categories[0].subcategory.nameEn,
        nameAr: prompt.categories[0].subcategory.nameAr,
      } : null,
      categoryId: prompt.categories[0]?.categoryId,
      subcategoryId: prompt.categories[0]?.subcategoryId,
      keywords: prompt.keywords.map(k => k.keyword),
      tools: prompt.tools.map(t => ({
        id: t.tool.id,
        name: t.tool.name,
      })),
      toolIds: prompt.tools.map(t => t.toolId),
    };
    
    return NextResponse.json({ prompt: transformedPrompt });
  } catch (error) {
    console.error("Get prompt error:", error);
    
    return NextResponse.json(
      { error: "Failed to get prompt" },
      { status: 500 }
    );
  }
}

// PATCH - Update a prompt
export async function PATCH(
  request: NextRequest
) {
  try {
    // Get current admin
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    const json = await request.json();
    
    // Validate input
    const validatedData = promptUpdateSchema.safeParse(json);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    // Check if prompt exists
    const existingPrompt = await prisma.prompt.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
    
    if (!existingPrompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
    // Extract data
    const {
      categoryId,
      subcategoryId,
      keywords,
      toolIds,
      ...promptData
    } = validatedData.data;
    
    // Start a transaction to update everything
    const updatedPrompt = await prisma.$transaction(async (tx) => {
      // 1. Update the prompt basic data
      const updated = await tx.prompt.update({
        where: { id },
        data: promptData,
      });
      
      // 2. If category or subcategory changed, update the relation
      if (categoryId && subcategoryId) {
        // Delete existing category relations
        await tx.promptCategory.deleteMany({
          where: { promptId: id },
        });
        
        // Create new category relation
        await tx.promptCategory.create({
          data: {
            promptId: id,
            categoryId,
            subcategoryId,
          },
        });
      }
      
      // 3. If keywords changed, update them
      if (keywords) {
        // Delete existing keywords
        await tx.promptKeyword.deleteMany({
          where: { promptId: id },
        });
        
        // Create new keywords
        for (const keyword of keywords) {
          await tx.promptKeyword.create({
            data: {
              promptId: id,
              keyword,
            },
          });
        }
      }
      
      // 4. If tools changed, update them
      if (toolIds) {
        // Delete existing tool relations
        await tx.promptTool.deleteMany({
          where: { promptId: id },
        });
        
        // Create new tool relations
        for (const toolId of toolIds) {
          await tx.promptTool.create({
            data: {
              promptId: id,
              toolId,
            },
          });
        }
      }
      
      // Create audit log
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "update",
          entityType: "prompt",
          entityId: id,
          details: { updatedFields: Object.keys(json) },
        },
      });
      
      return updated;
    });
    
    return NextResponse.json({
      message: "Prompt updated successfully",
      prompt: updatedPrompt,
    });
  } catch (error) {
    console.error("Update prompt error:", error);
    
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete a prompt
export async function DELETE(
  request: NextRequest
) {
  try {
    // Get current admin
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    // Check if prompt exists
    const existingPrompt = await prisma.prompt.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
    
    if (!existingPrompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
    // Soft delete the prompt
    await prisma.$transaction(async (tx) => {
      await tx.prompt.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
      
      // Create audit log
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "delete",
          entityType: "prompt",
          entityId: id,
          details: { promptTitle: existingPrompt.titleEn },
        },
      });
    });
    
    return NextResponse.json({
      message: "Prompt deleted successfully",
    });
  } catch (error) {
    console.error("Delete prompt error:", error);
    
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    );
  }
}
