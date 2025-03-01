import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { prisma } from "@/lib/prisma/client"

export async function POST(
  request: Request
) {
  try {
    // Get current session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // The ID is the second-to-last part in the path (before "copy")
    const id = pathParts[pathParts.length - 2];

    // Increment copy count
    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        copyCount: {
          increment: 1,
        },
      },
      select: {
        copyCount: true,
      }
    })

    return NextResponse.json({
      message: "Prompt copied successfully",
      copyCount: updatedPrompt.copyCount
    })
  } catch (error) {
    console.error("Copy prompt error:", error)
    return NextResponse.json(
      { error: "Failed to copy prompt" },
      { status: 500 }
    )
  }
}
