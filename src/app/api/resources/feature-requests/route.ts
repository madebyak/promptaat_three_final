import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Define the schema for feature request validation
const featureRequestSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  accountId: z.string().optional(),
  requestType: z.enum(['feature', 'prompt']),
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  category: z.string(),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  useCase: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate request data
    const validationResult = featureRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // Store the feature request in the database
    // This is a simple implementation - you may want to add more fields or logic
    const featureRequest = await prisma.featureRequest.create({
      data: {
        name: data.name,
        email: data.email,
        accountId: data.accountId || null,
        requestType: data.requestType,
        title: data.title,
        category: data.category,
        description: data.description,
        useCase: data.useCase || null,
        priority: data.priority,
        status: 'pending', // Default status
      },
    })
    
    // Optional: Send notification email to admin
    // await sendNotificationEmail(data)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Feature request submitted successfully',
      id: featureRequest.id
    })
    
  } catch (error) {
    console.error('Error submitting feature request:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit feature request' 
      },
      { status: 500 }
    )
  }
}
