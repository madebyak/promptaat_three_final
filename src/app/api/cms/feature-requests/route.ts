import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/jwt'

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const cookie = request.headers.get('cookie') || ''
    const tokenMatch = cookie.match(/admin-token=([^;]+)/)
    const token = tokenMatch ? tokenMatch[1] : null
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    try {
      await decrypt(token)
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    // Get all feature requests
    const featureRequests = await prisma.featureRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        requestType: true,
        title: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json({ featureRequests })
    
  } catch (error) {
    console.error('Error fetching feature requests:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch feature requests' },
      { status: 500 }
    )
  }
}
