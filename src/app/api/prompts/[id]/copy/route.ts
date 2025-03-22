import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { withSubscriptionGuard } from "@/lib/auth/subscription-guard";

export async function POST(
  request: NextRequest,
) {
  try {
    // Extract ID from URL path
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const id = segments[segments.length - 2]; // Get the ID segment before 'copy'

    // Get the prompt to check if it's premium
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      select: { id: true, isPro: true }
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    // If it's a Pro prompt, use the subscription guard to protect it
    if (prompt.isPro) {
      return await withSubscriptionGuard(
        async () => {
          // User has a subscription, proceed with copying
          return await performCopyOperation(id);
        },
        {
          errorMessage: "You need a Pro subscription to copy this premium prompt",
          errorStatus: 403,
          allowUnauthorized: false
        }
      );
    } else {
      // If it's not a Pro prompt, anyone can copy it
      return await performCopyOperation(id);
    }
  } catch (error) {
    console.error("Copy prompt error:", error);
    return NextResponse.json(
      { error: "Failed to copy prompt" },
      { status: 500 }
    );
  }
}

// Helper function to perform the actual copy operation
async function performCopyOperation(promptId: string) {
  try {
    // Increment the copy count
    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        copyCount: {
          increment: 1
        }
      },
      select: {
        copyCount: true
      }
    });

    return NextResponse.json({
      copyCount: updatedPrompt.copyCount,
      message: "Copy count updated successfully"
    });
  } catch (error) {
    console.error("Error updating copy count:", error);
    return NextResponse.json(
      { error: "Failed to update copy count" },
      { status: 500 }
    );
  }
}
