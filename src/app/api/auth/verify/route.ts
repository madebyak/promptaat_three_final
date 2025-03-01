export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { generateToken } from "@/lib/auth/token"
import { Resend } from "resend"
import { readFileSync } from "fs"
import { join } from "path"
import Handlebars from "handlebars"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Load email template
const templatePath = join(process.cwd(), "src/emails/verify-email.hbs")
const templateContent = readFileSync(templatePath, "utf-8")
const template = Handlebars.compile(templateContent)

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

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
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

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify email" },
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
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`
    const html = template({ verificationUrl })

    await resend.emails.send({
      from: "Promptaat <no-reply@promptaat.com>",
      to: email,
      subject: "Verify your email address",
      html
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
