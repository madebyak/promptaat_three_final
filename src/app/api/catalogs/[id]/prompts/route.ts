import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"

// GET /api/catalogs/[id]/prompts - Get all prompts in a catalog
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const catalogId = params.id

    // Check if catalog exists and belongs to the user
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

    // Fetch prompts in the catalog
    const catalogPrompts = await prisma.catalogPrompt.findMany({
      where: {
        catalogId,
      },
      include: {
        prompt: {
          include: {
            categories: {
              include: {
                category: true,
                subcategory: true,
              }
            },
            tools: {
              include: {
                tool: true,
              }
            },
          }
        }
      },
      orderBy: {
        addedAt: "desc"
      },
    })

    const prompts = catalogPrompts.map(cp => cp.prompt)

    return NextResponse.json(prompts)
  } catch (error) {
    console.error("Get catalog prompts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch catalog prompts" },
      { status: 500 }
    )
  }
}

// Note: The POST endpoint for adding a specific prompt to a catalog has been moved to
// /api/catalogs/[id]/prompts/[promptId] for better RESTful API design

// Note: The DELETE endpoint for removing a specific prompt from a catalog has been moved to
// /api/catalogs/[id]/prompts/[promptId] for better RESTful API design
