import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request
) {
  try {
    // Get user session for bookmark status
    const session = await getServerSession(authOptions)
    
    // Extract ID and locale from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    const locale = url.searchParams.get('locale') || 'en';

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
        keywords: {
          select: {
            keyword: true
          }
        },
        bookmarks: session?.user?.id ? {
          where: {
            userId: session.user.id
          },
          select: {
            userId: true
          }
        } : false,
        _count: {
          select: {
            bookmarks: true,
          }
        }
      }
    })

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      )
    }

    // Transform the data for the frontend
    const transformedPrompt = {
      id: prompt.id,
      title: locale === 'en' ? prompt.titleEn : prompt.titleAr,
      description: locale === 'en' ? prompt.descriptionEn : prompt.descriptionAr,
      instruction: locale === 'en' ? prompt.instructionEn : prompt.instructionAr,
      promptText: locale === 'en' ? prompt.promptTextEn : prompt.promptTextAr,
      isPro: prompt.isPro,
      copyCount: prompt.copyCount,
      bookmarkCount: prompt._count.bookmarks,
      isBookmarked: session?.user?.id ? prompt.bookmarks.length > 0 : false,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
      categories: prompt.categories.map(pc => ({
        id: pc.category.id,
        name: locale === 'en' ? pc.category.nameEn : pc.category.nameAr,
        iconName: pc.category.iconName,
        subcategory: pc.subcategory && {
          id: pc.subcategory.id,
          name: locale === 'en' ? pc.subcategory.nameEn : pc.subcategory.nameAr,
          iconName: pc.subcategory.iconName,
        }
      })),
      tools: prompt.tools.map(pt => ({
        id: pt.tool.id,
        name: pt.tool.name,
        iconUrl: pt.tool.iconUrl
      })),
      keywords: prompt.keywords.map(k => k.keyword)
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
  request: Request
) {
  try {
    // Get user session for authorization
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
    const id = pathParts[pathParts.length - 1];
    
    const prompt = await prisma.prompt.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Prompt deleted successfully",
      prompt,
    })
  } catch (error) {
    console.error("Delete prompt error:", error)
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    )
  }
}
