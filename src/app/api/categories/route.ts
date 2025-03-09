import { getCategories, searchCategories } from '../../../lib/prisma/categories'
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

// Temporarily removing edge runtime to test
// export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString()
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const query = searchParams.get('query')

    console.log(`[${timestamp}] [Categories API] Request params:`, { query, locale })
    console.log(`[${timestamp}] [Categories API] Request URL:`, request.url)

    // Add a small delay to ensure database connection is ready
    // This can help with race conditions during development
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const categories = query 
      ? await searchCategories(query, locale)
      : await getCategories(locale)

    console.log(`[${timestamp}] [Categories API] Response count:`, categories.length)

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
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] [Categories API Error]:`, error)
    
    // Provide more detailed error information based on error type
    let errorMessage = 'Failed to fetch categories'
    const statusCode = 500
    
    if (error instanceof PrismaClientKnownRequestError) {
      console.error(`[${timestamp}] [Categories API] Prisma error code:`, error.code)
      errorMessage = `Database error: ${error.message}`
    } else if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`
      console.error(`[${timestamp}] [Categories API] Error stack:`, error.stack)
    }
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        data: [],
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
}
