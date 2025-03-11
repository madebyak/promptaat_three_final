import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const timestamp = new Date().toISOString()
  try {
    const id = params.id
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'

    console.log(`[${timestamp}] [Category API] Request params:`, { id, locale })

    // Fetch the category by ID
    const category = await prisma.category.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found',
          data: null
        },
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      )
    }

    // Transform the category data
    const transformedCategory = {
      id: category.id,
      name: locale === 'ar' ? category.nameAr : category.nameEn,
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      iconName: category.iconName,
      sortOrder: category.sortOrder,
      parentId: category.parentId
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Category fetched successfully',
        data: transformedCategory
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  } catch (error) {
    console.error(`[${timestamp}] [Category API Error]:`, error)
    
    const errorMessage = 'Failed to fetch category'
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        data: null,
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
}
