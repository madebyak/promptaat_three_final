import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { prisma } from "@/lib/prisma/client"
import { Prisma } from "@prisma/client"

// GET - Checks if a prompt is in a catalog
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; promptId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: catalogId, promptId } = params

    // Verify the catalog belongs to the user
    const catalog = await prisma.catalog.findFirst({
      where: {
        id: catalogId,
        userId: session.user.id,
        deletedAt: null,
      },
    })

    if (!catalog) {
      return NextResponse.json(
        { error: "Catalog not found" },
        { status: 404 }
      )
    }

    // Check if the prompt is in the catalog
    const catalogPrompt = await prisma.catalogPrompt.findUnique({
      where: {
        catalogId_promptId: {
          catalogId,
          promptId,
        },
      },
    })

    return NextResponse.json({
      inCatalog: !!catalogPrompt,
    })
  } catch (error) {
    console.error("Error checking if prompt is in catalog:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Add a prompt to a catalog
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; promptId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: catalogId, promptId } = params

    // Verify the catalog belongs to the user
    const catalog = await prisma.catalog.findFirst({
      where: {
        id: catalogId,
        userId: session.user.id,
        deletedAt: null,
      },
    })

    if (!catalog) {
      return NextResponse.json(
        { error: "Catalog not found" },
        { status: 404 }
      )
    }

    // Check if the prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: {
        id: promptId,
        deletedAt: null,
      },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      )
    }

    // Check if the prompt is already in the catalog
    const existingCatalogPrompt = await prisma.catalogPrompt.findUnique({
      where: {
        catalogId_promptId: {
          catalogId,
          promptId,
        },
      },
    })

    if (existingCatalogPrompt) {
      return NextResponse.json(
        { message: "Prompt is already in this catalog" },
        { status: 200 }
      )
    }

    // Add the prompt to the catalog
    await prisma.catalogPrompt.create({
      data: {
        catalogId,
        promptId,
      },
    })

    // Ensure the prompt is also bookmarked
    const existingBookmark = await prisma.userBookmark.findUnique({
      where: {
        userId_promptId: {
          userId: session.user.id,
          promptId,
        }
      }
    })

    if (!existingBookmark) {
      await prisma.userBookmark.create({
        data: {
          userId: session.user.id,
          promptId,
        }
      })
    }

    return NextResponse.json({
      message: "Prompt added to catalog successfully",
    })
  } catch (error) {
    console.error("Error adding prompt to catalog:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Remove a prompt from a catalog
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; promptId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: catalogId, promptId } = params

    // Verify the catalog belongs to the user
    const catalog = await prisma.catalog.findFirst({
      where: {
        id: catalogId,
        userId: session.user.id,
        deletedAt: null,
      },
    })

    if (!catalog) {
      return NextResponse.json(
        { error: "Catalog not found" },
        { status: 404 }
      )
    }

    // Delete the catalog-prompt relationship
    await prisma.catalogPrompt.delete({
      where: {
        catalogId_promptId: {
          catalogId,
          promptId,
        },
      },
    })

    return NextResponse.json({
      message: "Prompt removed from catalog successfully",
    })
  } catch (error) {
    console.error("Error removing prompt from catalog:", error)
    
    // If the error is because the prompt is not in the catalog, return a 404
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: "Prompt not found in this catalog" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
