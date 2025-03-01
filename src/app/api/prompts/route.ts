import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth/options"

export async function GET(req: Request) {
  try {
    console.log('Starting GET /api/prompts')
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const locale = searchParams.get("locale") || "en"
    const category = searchParams.get("category")
    const tool = searchParams.get("tool")
    const sort = searchParams.get("sort") || "newest"
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    
    console.log('Query params:', { page, limit, locale, category, tool, sort, type, search })
    
    const skip = (page - 1) * limit

    // Build where clause
    const where = {
      deletedAt: null,
      ...(category && {
        categories: {
          some: {
            categoryId: category
          }
        }
      }),
      ...(tool && {
        tools: {
          some: {
            toolId: tool
          }
        }
      }),
      ...(type === 'pro' && { isPro: true }),
      ...(type === 'free' && { isPro: false }),
      ...(search && {
        OR: [
          { titleEn: { contains: search, mode: 'insensitive' } },
          { titleAr: { contains: search, mode: 'insensitive' } },
          { promptTextEn: { contains: search, mode: 'insensitive' } },
          { promptTextAr: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    console.log('Where clause:', JSON.stringify(where, null, 2))

    // Build orderBy
    const orderBy = sort === 'newest' 
      ? { createdAt: 'desc' as const }
      : { copyCount: 'desc' as const }

    console.log('Order by:', orderBy)

    try {
      const [prompts, total] = await Promise.all([
        prisma.prompt.findMany({
          where,
          include: {
            categories: {
              include: {
                category: {
                  select: {
                    id: true,
                    nameEn: true,
                    nameAr: true
                  }
                }
              }
            },
            tools: {
              include: {
                tool: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          skip,
          take: limit,
          orderBy
        }),
        prisma.prompt.count({ where })
      ])

      console.log('Found prompts:', prompts.length)
      console.log('Total count:', total)

      // Transform data for frontend
      const transformedPrompts = prompts.map(prompt => ({
        id: prompt.id,
        title: locale === 'en' ? prompt.titleEn : prompt.titleAr,
        preview: locale === 'en' ? prompt.promptTextEn : prompt.promptTextAr,
        isPro: prompt.isPro,
        copyCount: prompt.copyCount,
        categories: prompt.categories.map(pc => ({
          id: pc.category.id,
          name: locale === 'en' ? pc.category.nameEn : pc.category.nameAr
        })),
        tools: prompt.tools.map(pt => ({
          id: pt.tool.id,
          name: pt.tool.name
        }))
      }))

      const hasMore = total > skip + prompts.length
      const nextPage = hasMore ? page + 1 : null

      return NextResponse.json({
        prompts: transformedPrompts,
        total,
        page,
        hasMore,
        nextPage
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

  } catch (error) {
    console.error('Failed to fetch prompts:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    console.log('Starting POST /api/prompts')
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      console.error('Unauthorized request')
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      titleEn,
      titleAr,
      contentEn,
      contentAr,
      categoryId,
      toolId,
      isPro = false,
    } = body

    console.log('Request body:', { titleEn, titleAr, contentEn, contentAr, categoryId, toolId, isPro })

    try {
      const prompt = await prisma.prompt.create({
        data: {
          titleEn,
          titleAr,
          promptTextEn: contentEn,
          promptTextAr: contentAr,
          categories: {
            create: [
              {
                categoryId,
              },
            ],
          },
          tools: {
            create: [
              {
                toolId,
              },
            ],
          },
          isPro,
          userId: session.user.id,
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          tools: {
            include: {
              tool: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      console.log('Created prompt:', prompt)

      return NextResponse.json({ prompt })

    } catch (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

  } catch (error) {
    console.error('Failed to create prompt:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: "Error creating prompt" },
      { status: 500 }
    )
  }
}
