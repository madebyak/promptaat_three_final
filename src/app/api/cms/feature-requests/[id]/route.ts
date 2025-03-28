import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/jwt'
import { z } from 'zod'

// Define schema for update validation
const updateFeatureRequestSchema = z.object({
  status: z.enum(['pending', 'in_review', 'approved', 'rejected', 'completed']).optional(),
  adminNotes: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const { id } = params
    
    // Get feature request by ID
    const featureRequest = await prisma.featureRequest.findUnique({
      where: { id },
    })
    
    if (!featureRequest) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ featureRequest })
    
  } catch (error) {
    console.error('Error fetching feature request:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch feature request' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const { id } = params
    const body = await request.json()
    
    // Validate request data
    const validationResult = updateFeatureRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // Check if feature request exists
    const existingRequest = await prisma.featureRequest.findUnique({
      where: { id },
    })
    
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      )
    }
    
    // Update feature request
    const updatedFeatureRequest = await prisma.featureRequest.update({
      where: { id },
      data: {
        status: data.status,
        adminNotes: data.adminNotes,
      },
    })
    
    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        adminId: 'system', // This should be replaced with the actual admin ID
        action: 'UPDATE',
        entityType: 'FEATURE_REQUEST',
        entityId: id,
        details: {
          previous: {
            status: existingRequest.status,
            adminNotes: existingRequest.adminNotes,
          },
          current: {
            status: updatedFeatureRequest.status,
            adminNotes: updatedFeatureRequest.adminNotes,
          },
        },
      },
    })
    
    return NextResponse.json({ 
      success: true,
      featureRequest: updatedFeatureRequest 
    })
    
  } catch (error) {
    console.error('Error updating feature request:', error)
    
    return NextResponse.json(
      { error: 'Failed to update feature request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const { id } = params
    
    // Check if feature request exists
    const existingRequest = await prisma.featureRequest.findUnique({
      where: { id },
    })
    
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      )
    }
    
    // Delete feature request
    await prisma.featureRequest.delete({
      where: { id },
    })
    
    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        adminId: 'system', // This should be replaced with the actual admin ID
        action: 'DELETE',
        entityType: 'FEATURE_REQUEST',
        entityId: id,
        details: {
          deleted: existingRequest,
        },
      },
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Feature request deleted successfully' 
    })
    
  } catch (error) {
    console.error('Error deleting feature request:', error)
    
    return NextResponse.json(
      { error: 'Failed to delete feature request' },
      { status: 500 }
    )
  }
}
