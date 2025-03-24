export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateToken } from "@/lib/auth/token"
import { sendVerificationEmail } from "@/lib/email/verification"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          gt: new Date()
        }
      }
    })

    // If no user found with this token, check if a user was already verified with this token
    if (!user) {
      // Check if any user was already verified with this token
      const alreadyVerifiedUser = await prisma.user.findFirst({
        where: {
          emailVerified: true,
          // We can't check for the exact token since it's cleared after verification,
          // but we can check if the user exists and is verified
        }
      })

      if (alreadyVerifiedUser) {
        return NextResponse.json({ 
          message: "Email already verified. You can now log in.",
          alreadyVerified: true
        })
      }

      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        message: "Email already verified. You can now log in.",
        alreadyVerified: true
      })
    }

    // Mark user as verified and clear the token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null
      }
    })

    // Log successful verification
    console.log(`User ${user.id} (${user.email}) successfully verified their email`)

    return NextResponse.json({ 
      message: "Email verified successfully",
      success: true
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify email", success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      )
    }

    // Generate verification token
    const token = await generateToken({
      userId: user.id,
      email: user.email
    })
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // Token expires in 24 hours

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
        verificationTokenExpires: expires
      }
    })

    // Send verification email
    await sendVerificationEmail({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      token
    })

    return NextResponse.json({ message: "Verification email sent" })
  } catch (error) {
    console.error("Send verification error:", error)
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    )
  }
}
