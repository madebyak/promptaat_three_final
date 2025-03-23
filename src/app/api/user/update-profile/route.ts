import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Define validation schema for the request body
const updateProfileSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  // Add more fields as needed for profile updates
});

export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const validationResult = updateProfileSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { country } = validationResult.data;

    // Update the user's profile in the database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        country,
        // Add more fields here as needed
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        country: true,
      },
    });

    // Return the updated user data
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// Add runtime directive for Node.js (needed for Prisma)
export const runtime = 'nodejs';
