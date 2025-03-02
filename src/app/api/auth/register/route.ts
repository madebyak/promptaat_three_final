import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { randomBytes } from "crypto"
import { sendVerificationEmail } from "@/lib/email/verification"
import { hashPassword } from "@/lib/crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, country } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          error: "email_exists",
          message: "This email is already registered"
        },
        { status: 400 }
      )
    }

    // Hash password using Web Crypto API
    const hashedPassword = await hashPassword(password)
    
    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex')
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token valid for 24 hours

    // Create user with verification token
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName,
        lastName,
        country,
        emailVerified: false,
        verificationToken,
        verificationTokenExpires: tokenExpiry,
        profileImageUrl: "/profile_avatars/default_profile.jpg"
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        token: verificationToken
      })
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // We continue even if email fails - user can request a new verification email later
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      message: "User created successfully. Please verify your email."
    })
  } catch (error) {
    console.error("Registration error:", error);
    
    // Provide more detailed error information
    let errorMessage = "Error creating user";
    let errorCode = "registration_failed";
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      errorMessage = `Registration failed: ${error.message}`;
      
      // Check for specific error types
      if (error.message.includes("prisma")) {
        errorMessage = "Database error during registration";
        errorCode = "database_error";
      } else if (error.message.includes("email")) {
        errorMessage = "Error sending verification email";
        errorCode = "email_error";
      }
    }
    
    return NextResponse.json(
      {
        error: errorCode,
        message: errorMessage
      },
      { status: 500 }
    )
  }
}
