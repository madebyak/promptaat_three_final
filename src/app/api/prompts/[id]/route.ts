import { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"

export async function GET(
  request: NextRequest,
) {
  try {
    // Get user session for bookmark status
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log('Session retrieved:', session ? 'exists' : 'null');
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      // Continue without session
    }
    
    // Extract locale from URL and ID from params
    const url = new URL(request.url)
    const locale = url.searchParams.get('locale') || 'en'
    const segments = url.pathname.split('/')
    const id = segments[segments.length - 1] // Get last segment as ID

    console.log('Fetching prompt with ID:', id, 'locale:', locale);

    try {
      // Test Prisma connection
      await prisma.$queryRaw`SELECT 1`;
      console.log('Prisma connection test successful');
    } catch (prismaConnError) {
      console.error('Prisma connection error:', prismaConnError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    let prompt;
    try {
      prompt = await prisma.prompt.findUnique({
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
      });
      console.log('Prompt query result:', prompt ? 'found' : 'not found');
    } catch (queryError) {
      console.error('Prisma query error:', queryError);
      return NextResponse.json(
        { error: "Database query error", details: String(queryError) },
        { status: 500 }
      );
    }

    if (!prompt) {
      console.log('Prompt not found:', id);
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    // Transform data based on locale
    try {
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
        isBookmarked: false, // Default value
        bookmarkCount: prompt._count.bookmarks
      };

      // Add bookmark status if session exists
      if (session?.user?.id) {
        try {
          const bookmark = await prisma.userBookmark.findUnique({
            where: {
              userId_promptId: {
                userId: session.user.id,
                promptId: id
              }
            }
          });
          transformedPrompt.isBookmarked = bookmark !== null;
        } catch (bookmarkError) {
          console.error('Error checking bookmark status:', bookmarkError);
          // Continue without bookmark status
        }
      }

      console.log('Successfully transformed prompt data');
      return NextResponse.json(transformedPrompt);
    } catch (transformError) {
      console.error('Error transforming prompt data:', transformError);
      return NextResponse.json(
        { error: "Data transformation error", details: String(transformError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Get prompt error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt", details: String(error) },
      { status: 500 }
    );
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

    const url = new URL(request.url)
    const segments = url.pathname.split('/')
    const id = segments[segments.length - 1] // Get last segment as ID

    try {
      await prisma.prompt.delete({
        where: { id }
      });
      console.log('Prompt deleted successfully');
    } catch (deleteError) {
      console.error('Error deleting prompt:', deleteError);
      return NextResponse.json(
        { error: "Failed to delete prompt", details: String(deleteError) },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Prompt deleted successfully" });
  } catch (error) {
    console.error("Delete prompt error:", error);
    return NextResponse.json(
      { error: "Failed to delete prompt", details: String(error) },
      { status: 500 }
    );
  }
}
