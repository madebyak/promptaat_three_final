import { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma/client"

export async function POST(
  request: NextRequest,
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Extract ID from URL
    const url = new URL(request.url)
    const id = url.pathname.split('/')[4] // /api/prompts/[id]/bookmark

    // Check if prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      )
    }

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Extract ID from URL
    const url = new URL(request.url)
    const id = url.pathname.split('/')[4] // /api/prompts/[id]/bookmark

    // Delete bookmark
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
    console.error("Remove bookmark error:", error)
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    )
  }
}
