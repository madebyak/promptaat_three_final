import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

// Define validation schema
const profileCompletionSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name cannot exceed 50 characters" }),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name cannot exceed 50 characters" }),
  country: z
    .string()
    .min(1, { message: "Country is required" }),
});

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to update your profile" },
        { status: 401 }
      );
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = profileCompletionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid form data", errors: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { firstName, lastName, country } = validationResult.data;
    
    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        country,
      },
    });
    
    // Return success response
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        country: updatedUser.country,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("[Profile Completion API] Error:", error);
    
    return NextResponse.json(
      { message: "An error occurred while updating your profile" },
      { status: 500 }
    );
  }
}
