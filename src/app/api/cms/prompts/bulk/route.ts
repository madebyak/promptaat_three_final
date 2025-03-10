import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema for bulk actions
const bulkActionSchema = z.object({
  promptIds: z.array(z.string()),
  action: z.enum(["delete", "togglePro", "activate", "deactivate"]),
});

// POST - Perform bulk action on prompts
export async function POST(request: NextRequest) {
  try {
    // Get current admin
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = bulkActionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { promptIds, action } = validationResult.data;
    
    // Check if promptIds array is empty
    if (promptIds.length === 0) {
      return NextResponse.json(
        { error: "No prompts selected" },
        { status: 400 }
      );
    }
    
    // Perform the requested action
    switch (action) {
      case "delete":
        // Soft delete prompts (set deletedAt)
        await prisma.prompt.updateMany({
          where: {
            id: { in: promptIds },
            deletedAt: null, // Only delete prompts that aren't already deleted
          },
          data: {
            deletedAt: new Date(),
          },
        });
        break;
        
      case "togglePro":
        // First, get the current isPro status for each prompt
        const prompts = await prisma.prompt.findMany({
          where: {
            id: { in: promptIds },
            deletedAt: null,
          },
          select: {
            id: true,
            isPro: true,
          },
        });
        
        // Group prompts by their current isPro status
        const proPromptIds = prompts.filter(p => p.isPro).map(p => p.id);
        const freePromptIds = prompts.filter(p => !p.isPro).map(p => p.id);
        
        // Update prompts in two batches
        if (proPromptIds.length > 0) {
          await prisma.prompt.updateMany({
            where: {
              id: { in: proPromptIds },
            },
            data: {
              isPro: false,
            },
          });
        }
        
        if (freePromptIds.length > 0) {
          await prisma.prompt.updateMany({
            where: {
              id: { in: freePromptIds },
            },
            data: {
              isPro: true,
            },
          });
        }
        break;
        
      case "activate":
        // Activate prompts (set deletedAt to null)
        await prisma.prompt.updateMany({
          where: {
            id: { in: promptIds },
            deletedAt: { not: null }, // Only activate prompts that are deleted
          },
          data: {
            deletedAt: null,
          },
        });
        break;
        
      case "deactivate":
        // Deactivate prompts (soft delete)
        await prisma.prompt.updateMany({
          where: {
            id: { in: promptIds },
            deletedAt: null, // Only deactivate prompts that aren't already deleted
          },
          data: {
            deletedAt: new Date(),
          },
        });
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully performed ${action} on ${promptIds.length} prompts`,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
