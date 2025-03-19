import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * AuditLogAction represents the type of action performed
 * in the system that should be logged for auditing purposes
 */
export type AuditLogAction = 
  | "create" 
  | "update" 
  | "delete" 
  | "status_change" 
  | "login"
  | "logout"
  | "password_reset";

/**
 * AuditLogEntityType represents the type of entity that was affected
 * by the action being logged
 */
export type AuditLogEntityType = 
  | "blog"
  | "prompt"
  | "category"
  | "tool"
  | "user"
  | "admin"
  | "subscription";

/**
 * AuditLogData interface defines the structure of the data
 * required to create a new audit log entry
 */
interface AuditLogData {
  action: AuditLogAction;
  entityType: AuditLogEntityType;
  entityId: string;
  adminId: string;
  details?: Record<string, unknown>;
}

/**
 * Creates an audit log entry in the database
 * 
 * This function logs administrative actions for security
 * and tracking purposes. It records which admin did what to which entity.
 * 
 * @param data The audit log data to record
 * @returns A promise that resolves to the created audit log entry
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    // Create the audit log entry
    const log = await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        adminId: data.adminId,
        // Convert details to Prisma.InputJsonValue type
        details: data.details as Prisma.InputJsonValue,
      },
    });
    
    return log;
  } catch (error) {
    // Log the error but don't throw to prevent disrupting application flow
    console.error("Failed to create audit log:", error);
    
    // Return null to indicate failure but not break caller
    return null;
  }
}
