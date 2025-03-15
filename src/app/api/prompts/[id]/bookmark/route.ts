import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { Prisma } from "@prisma/client"
import { handleProContentRequest } from "@/lib/auth/subscription-guard"

export async function POST(
  request: NextRequest,
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Extract prompt ID from URL
    const segments = new URL(request.url).pathname.split('/')
    const promptsIndex = segments.findIndex(segment => segment === 'prompts')
    let id = ''
    
    if (promptsIndex !== -1 && promptsIndex + 1 < segments.length) {
      id = segments[promptsIndex + 1]
    }
    
    console.log('Bookmark request for prompt ID:', id)
    
    if (!id) {
      return NextResponse.json(
        { error: "Invalid prompt ID" },
        { status: 400 }
      )
    }

    // Check if prompt exists and if it's premium
    try {
      const prompt = await prisma.prompt.findUnique({
        where: { id },
        select: { id: true, isPro: true }
      })

      if (!prompt) {
        console.error(`Prompt not found with ID: ${id}`)
        return NextResponse.json(
          { error: "Prompt not found" },
          { status: 404 }
        )
      }
      
      // Use subscription guard to protect premium prompt bookmarking
      return await handleProContentRequest(
        request,
        prompt.isPro,
        async () => {
          // Check if already bookmarked
          const existingBookmark = await prisma.userBookmark.findUnique({
            where: {
              userId_promptId: {
                userId: session.user.id,
                promptId: id
              }
            }
          })

          if (existingBookmark) {
            return NextResponse.json(
              { error: "Prompt already bookmarked" },
              { status: 400 }
            )
          }

          // Create bookmark
          await prisma.userBookmark.create({
            data: {
              userId: session.user.id,
              promptId: id
            }
          })

          return NextResponse.json({ message: "Prompt bookmarked successfully" })
        },
        {
          errorMessage: "You need a Pro subscription to bookmark this premium prompt"
        }
      );
      
    } catch (error) {
      console.error('Error checking prompt existence:', error)
      return NextResponse.json(
        { error: "Database error when checking prompt" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Bookmark prompt error:", error)
    return NextResponse.json(
      { error: "Failed to bookmark prompt" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Extract prompt ID from URL
    const segments = new URL(request.url).pathname.split('/')
    const promptsIndex = segments.findIndex(segment => segment === 'prompts')
    let id = ''
    
    if (promptsIndex !== -1 && promptsIndex + 1 < segments.length) {
      id = segments[promptsIndex + 1]
    }
    
    console.log('Unbookmark request for prompt ID:', id)
    
    if (!id) {
      return NextResponse.json(
        { error: "Invalid prompt ID" },
        { status: 400 }
      )
    }

    // Delete bookmark
    try {
      await prisma.userBookmark.delete({
        where: {
          userId_promptId: {
            userId: session.user.id,
            promptId: id
          }
        }
      })
      return NextResponse.json({ message: "Bookmark removed successfully" })
    } catch (error) {
      // Handle Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025 is the "Record not found" error code in Prisma
        if (error.code === 'P2025') {
          return NextResponse.json({ message: "Bookmark already removed" })
        }
      }
      
      console.error('Error removing bookmark:', error)
      return NextResponse.json(
        { error: "Failed to remove bookmark" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Remove bookmark error:", error)
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    )
  }
}
