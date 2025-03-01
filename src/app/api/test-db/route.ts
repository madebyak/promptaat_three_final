import { prisma } from '@/lib/prisma/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test database connection
    const categoriesCount = await prisma.category.count()
    
    // Get a sample of categories
    const sampleCategories = await prisma.category.findMany({
      take: 5,
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        parentId: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      data: {
        categoriesCount,
        sampleCategories
      }
    })
  } catch (error) {
    console.error('[Database Test Error]:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown database error'

    return NextResponse.json({
      success: false,
      message: 'Database connection test failed',
      error: errorMessage
    }, { status: 500 })
  }
}
