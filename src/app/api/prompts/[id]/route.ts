import { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Get user session for bookmark status
    const session = await getServerSession(authOptions)
    
    // Extract locale from URL and ID from params
    const url = new URL(request.url)
    const locale = url.searchParams.get('locale') || 'en'
    const id = params.id // Get ID from route params

    console.log('Fetching prompt with ID:', id)

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        descriptionEn: true,
        descriptionAr: true,
        instructionEn: true,
        instructionAr: true,
        isPro: true,
        copyCount: true,
        promptTextEn: true,
        promptTextAr: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
                iconName: true,
              }
            },
            subcategory: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
                iconName: true,
              }
            }
          }
        },
        tools: {
          select: {
            tool: {
              select: {
                id: true,
                name: true,
                iconUrl: true,
              }
            }
          }
        },
        keywords: true,
        _count: {
          select: {
            bookmarks: true
          }
        }
      }
    })

    if (!prompt) {
      console.log('Prompt not found:', id)
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      )
    }

    // Transform data based on locale
    const transformedPrompt = {
      id: prompt.id,
      title: locale === 'ar' ? prompt.titleAr : prompt.titleEn,
      description: locale === 'ar' ? prompt.descriptionAr : prompt.descriptionEn,
      instruction: locale === 'ar' ? prompt.instructionAr : prompt.instructionEn,
      promptText: locale === 'ar' ? prompt.promptTextAr : prompt.promptTextEn,
      isPro: prompt.isPro,
      copyCount: prompt.copyCount,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
      categories: prompt.categories.map(cat => ({
        id: cat.category.id,
        name: locale === 'ar' ? cat.category.nameAr : cat.category.nameEn,
        iconName: cat.category.iconName,
        subcategory: cat.subcategory ? {
          id: cat.subcategory.id,
          name: locale === 'ar' ? cat.subcategory.nameAr : cat.subcategory.nameEn,
          iconName: cat.subcategory.iconName,
        } : null
      })),
      tools: prompt.tools.map(t => ({
        id: t.tool.id,
        name: t.tool.name,
        iconUrl: t.tool.iconUrl,
      })),
      isBookmarked: session?.user?.id ? await prisma.userBookmark.findUnique({
        where: {
          userId_promptId: {
            userId: session.user.id,
            promptId: id
          }
        }
      }) !== null : false,
      bookmarkCount: prompt._count.bookmarks
    }

    return NextResponse.json(transformedPrompt)
  } catch (error) {
    console.error("Get prompt error:", error)
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const id = params.id // Get ID from route params

    await prisma.prompt.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Prompt deleted successfully" })
  } catch (error) {
    console.error("Delete prompt error:", error)
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    )
  }
}
