import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"

// GET /api/catalogs/[id] - Get a specific catalog
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

    // Fetch the catalog with prompt count
    const catalog = await prisma.catalog.findFirst({
      where: {
        id: catalogId,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            prompts: true
          }
        }
      }
    })

    if (!catalog) {
      return NextResponse.json(
        { error: "Catalog not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(catalog)
  } catch (error) {
    console.error("Get catalog error:", error)
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 }
    )
  }
}

// PATCH /api/catalogs/[id] - Update a catalog
export async function PATCH(
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

    // Parse request body
    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: "Catalog name is required" },
        { status: 400 }
      )
    }
    
    // Description is optional, but if provided, it should be a string
    if (description !== undefined && (typeof description !== 'string')) {
      return NextResponse.json(
        { error: "Description must be a string" },
        { status: 400 }
      )
    }

    // Update catalog
    const updatedCatalog = await prisma.catalog.update({
      where: {
        id: catalogId,
      },
      data: {
        name: name.trim(),
        ...(description !== undefined ? { description: description.trim() } : {}),
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(updatedCatalog)
  } catch (error) {
    console.error("Update catalog error:", error)
    return NextResponse.json(
      { error: "Failed to update catalog" },
      { status: 500 }
    )
  }
}

// DELETE /api/catalogs/[id] - Delete a catalog (soft delete)
export async function DELETE(
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

    // Soft delete the catalog
    await prisma.catalog.update({
      where: {
        id: catalogId,
      },
      data: {
        deletedAt: new Date(),
      }
    })

    return NextResponse.json({ message: "Catalog deleted successfully" })
  } catch (error) {
    console.error("Delete catalog error:", error)
    return NextResponse.json(
      { error: "Failed to delete catalog" },
      { status: 500 }
    )
  }
}
