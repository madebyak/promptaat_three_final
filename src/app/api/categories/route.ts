import { getCategories, searchCategories } from '../../../lib/prisma/categories'
import { NextRequest, NextResponse } from 'next/server'

// Temporarily removing edge runtime to test
// export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const query = searchParams.get('query')

    console.log('[Categories API] Request params:', { query, locale })

    const categories = query 
      ? await searchCategories(query, locale)
      : await getCategories(locale)

    console.log('[Categories API] Response:', { categories })

    // Log raw category data
    categories.forEach(cat => {
      console.log('[Categories API] Category:', {
        name: cat.nameEn,
        icon: cat.iconName,
        rawIcon: JSON.stringify(cat.iconName)
      });
    });

    // Debug log for category data
    console.log('[Categories API] Category details:', categories.map(cat => ({
      name: cat.nameEn,
      icon: cat.iconName
    })))

    // Debug log for icon names
    console.log('[Categories API] Icon names:', categories.map(cat => ({
      category: cat.nameEn,
      iconName: cat.iconName
    })))

    // Return with proper headers for UTF-8
    return NextResponse.json(
      {
        success: true,
        message: 'Categories fetched successfully',
        data: categories || []
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  } catch (error) {
    console.error('[Categories API Error]:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch categories',
        data: [],
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
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
