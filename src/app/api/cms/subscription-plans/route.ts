import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { User } from "@/types/user";

// Schema for subscription plan creation/update
const subscriptionPlanSchema = z.object({
  id: z.string().optional(),
  name: z.object({
    en: z.string().min(1),
    ar: z.string().min(1),
  }),
  description: z.object({
    en: z.string().min(1),
    ar: z.string().min(1),
  }),
  features: z.array(
    z.object({
      en: z.string().min(1),
      ar: z.string().min(1),
    })
  ).min(1),
});

// GET: Fetch all subscription plans
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
    
    // Fetch all subscription plans
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          prices: true
        }
      });
      
      return NextResponse.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscription plans" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}

// POST: Create a new subscription plan
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
    const validatedData = subscriptionPlanSchema.parse(body);
    
    try {
      // Create subscription plan
      const nameJson = JSON.stringify(validatedData.name);
      const descriptionJson = JSON.stringify(validatedData.description);
      const featuresJson = JSON.stringify(validatedData.features);
      
      const newPlan = await prisma.subscriptionPlan.create({
        data: {
          name: nameJson,
          description: descriptionJson,
          features: featuresJson
        }
      });
      
      return NextResponse.json(newPlan, { status: 201 });
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      return NextResponse.json(
        { error: "Failed to create subscription plan" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create subscription plan" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing subscription plan
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
    const validatedData = subscriptionPlanSchema.parse(body);
    
    if (!validatedData.id) {
      return NextResponse.json(
        { error: "Plan ID is required for updates" },
        { status: 400 }
      );
    }
    
    try {
      // Check if plan exists
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: validatedData.id }
      });
      
      if (!existingPlan) {
        return NextResponse.json(
          { error: "Subscription plan not found" },
          { status: 404 }
        );
      }
      
      const nameJson = JSON.stringify(validatedData.name);
      const descriptionJson = JSON.stringify(validatedData.description);
      const featuresJson = JSON.stringify(validatedData.features);
      
      // Update subscription plan
      const updatedPlan = await prisma.subscriptionPlan.update({
        where: { id: validatedData.id },
        data: {
          name: nameJson,
          description: descriptionJson,
          features: featuresJson
        }
      });
      
      return NextResponse.json(updatedPlan);
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      return NextResponse.json(
        { error: "Failed to update subscription plan" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update subscription plan" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a subscription plan
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
    
    // Get plan ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }
    
    try {
      // Check if plan exists
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { id }
      });
      
      if (!existingPlan) {
        return NextResponse.json(
          { error: "Subscription plan not found" },
          { status: 404 }
        );
      }
      
      // Check if plan has associated prices
      const prices = await prisma.subscriptionPrice.findMany({
        where: { planId: id }
      });
      
      if (prices.length > 0) {
        return NextResponse.json(
          { 
            error: "Cannot delete plan with associated prices. Delete the prices first." 
          },
          { status: 400 }
        );
      }
      
      // Delete subscription plan
      await prisma.subscriptionPlan.delete({
        where: { id }
      });
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      return NextResponse.json(
        { error: "Failed to delete subscription plan" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription plan" },
      { status: 500 }
    );
  }
}
