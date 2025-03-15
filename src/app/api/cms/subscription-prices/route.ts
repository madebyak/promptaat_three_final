import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { User } from "@/types/user";

// Schema for subscription price creation/update
const subscriptionPriceSchema = z.object({
  id: z.string().optional(),
  planId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  interval: z.enum(["month", "year"]),
  intervalCount: z.number().positive().default(1),
});

// GET: Fetch all subscription prices
export async function GET() {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    }) as User | null;
    
    if (user && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Fetch all subscription prices
    try {
      const prices = await prisma.subscriptionPrice.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          plan: true
        }
      });
      
      return NextResponse.json(prices);
    } catch (error) {
      console.error("Error fetching subscription prices:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscription prices" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching subscription prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription prices" },
      { status: 500 }
    );
  }
}

// POST: Create a new subscription price
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    }) as User | null;
    
    if (user && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = subscriptionPriceSchema.parse(body);
    
    try {
      // Check if plan exists
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: validatedData.planId }
      });
      
      if (!existingPlan) {
        return NextResponse.json(
          { error: "Subscription plan not found" },
          { status: 404 }
        );
      }
      
      // Create subscription price
      const price = await prisma.subscriptionPrice.create({
        data: {
          planId: validatedData.planId,
          amount: validatedData.amount,
          currency: validatedData.currency,
          interval: validatedData.interval,
          intervalCount: validatedData.intervalCount
        }
      });
      
      return NextResponse.json(price, { status: 201 });
    } catch (error) {
      console.error("Error creating subscription price:", error);
      return NextResponse.json(
        { error: "Failed to create subscription price" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating subscription price:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create subscription price" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing subscription price
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    }) as User | null;
    
    if (user && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = subscriptionPriceSchema.parse(body);
    
    if (!validatedData.id) {
      return NextResponse.json(
        { error: "Price ID is required for updates" },
        { status: 400 }
      );
    }
    
    try {
      // Check if price exists
      const existingPrice = await prisma.subscriptionPrice.findUnique({
        where: { id: validatedData.id }
      });
      
      if (!existingPrice) {
        return NextResponse.json(
          { error: "Subscription price not found" },
          { status: 404 }
        );
      }
      
      // Check if plan exists
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: validatedData.planId }
      });
      
      if (!existingPlan) {
        return NextResponse.json(
          { error: "Subscription plan not found" },
          { status: 404 }
        );
      }
      
      // Update subscription price
      const updatedPrice = await prisma.subscriptionPrice.update({
        where: { id: validatedData.id },
        data: {
          planId: validatedData.planId,
          amount: validatedData.amount,
          currency: validatedData.currency,
          interval: validatedData.interval,
          intervalCount: validatedData.intervalCount
        }
      });
      
      return NextResponse.json(updatedPrice);
    } catch (error) {
      console.error("Error updating subscription price:", error);
      return NextResponse.json(
        { error: "Failed to update subscription price" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating subscription price:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update subscription price" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a subscription price
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    }) as User | null;
    
    if (user && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Get price ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }
    
    try {
      // Check if price exists
      const existingPrice = await prisma.subscriptionPrice.findUnique({
        where: { id }
      });
      
      if (!existingPrice) {
        return NextResponse.json(
          { error: "Subscription price not found" },
          { status: 404 }
        );
      }
      
      // Delete subscription price
      await prisma.subscriptionPrice.delete({
        where: { id }
      });
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting subscription price:", error);
      return NextResponse.json(
        { error: "Failed to delete subscription price" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting subscription price:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription price" },
      { status: 500 }
    );
  }
}
