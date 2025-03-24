import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { z } from "zod";

export const runtime = 'nodejs';

// Schema for validating bulk action request
const bulkActionSchema = z.object({
  action: z.enum(["activate", "deactivate", "delete"]),
  userIds: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = bulkActionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { action, userIds } = validationResult.data;

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: "No users selected" },
        { status: 400 }
      );
    }

    // Get users for audit logging
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    // Create a map of user IDs to emails for the audit log
    const userEmails = new Map(users.map(user => [user.id, user.email]));

    // Handle different actions
    switch (action) {
      case "activate":
        // Activate users
        await prisma.user.updateMany({
          where: {
            id: {
              in: userIds
            }
          },
          data: {
            isActive: true
          }
        });

        // Log the action
        await prisma.auditLog.create({
          data: {
            adminId: admin.id,
            action: "BULK_ACTIVATE_USERS",
            entityType: "user",
            entityId: "bulk",
            details: {
              userIds,
              count: userIds.length,
              emails: Object.fromEntries(userEmails)
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: `Successfully activated ${userIds.length} users`,
          count: userIds.length
        });

      case "deactivate":
        // Deactivate users
        await prisma.user.updateMany({
          where: {
            id: {
              in: userIds
            }
          },
          data: {
            isActive: false
          }
        });

        // Log the action
        await prisma.auditLog.create({
          data: {
            adminId: admin.id,
            action: "BULK_DEACTIVATE_USERS",
            entityType: "user",
            entityId: "bulk",
            details: {
              userIds,
              count: userIds.length,
              emails: Object.fromEntries(userEmails)
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: `Successfully deactivated ${userIds.length} users`,
          count: userIds.length
        });

      case "delete":
        // Delete related data for all users
        // This must be done in a transaction for consistency
        const results = await prisma.$transaction(async (tx) => {
          // For each user, delete related data and then the user
          for (const userId of userIds) {
            // 1. Delete user subscriptions
            await tx.subscription.deleteMany({
              where: { userId },
            });

            // 2. Delete user bookmarks
            await tx.userBookmark.deleteMany({
              where: { userId },
            });

            // 3. Delete user history
            await tx.userHistory.deleteMany({
              where: { userId },
            });

            // 4. Delete user catalogs and related entities
            const userCatalogs = await tx.catalog.findMany({
              where: { userId },
              select: { id: true }
            });
            
            const catalogIds = userCatalogs.map(cat => cat.id);
            
            // Delete catalog prompts
            if (catalogIds.length > 0) {
              await tx.catalogPrompt.deleteMany({
                where: {
                  catalogId: {
                    in: catalogIds
                  }
                }
              });
            }
            
            // Delete catalogs
            await tx.catalog.deleteMany({
              where: { userId },
            });

            // 5. Delete OTP verification if exists
            await tx.otpVerification.deleteMany({
              where: { userId },
            });

            // Finally, delete the user
            await tx.user.delete({
              where: { id: userId },
            });
          }

          return { count: userIds.length };
        });

        // Log the action
        await prisma.auditLog.create({
          data: {
            adminId: admin.id,
            action: "BULK_DELETE_USERS",
            entityType: "user",
            entityId: "bulk",
            details: {
              userIds,
              count: userIds.length,
              emails: Object.fromEntries(userEmails)
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: `Successfully deleted ${results.count} users permanently`,
          count: results.count
        });

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing bulk action:", error);
    return NextResponse.json(
      { error: "Failed to process bulk action", details: (error as Error).message },
      { status: 500 }
    );
  }
}
