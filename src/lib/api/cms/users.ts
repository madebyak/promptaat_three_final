/**
 * API functions for user operations
 */

import { 
  type User as PrismaUser,
  type Subscription as PrismaSubscription
} from "@prisma/client";

// Types for user data
export interface UserData {
  id: PrismaUser['id'];
  email: PrismaUser['email'];
  firstName: PrismaUser['firstName'];
  lastName: PrismaUser['lastName'];
  isActive: PrismaUser['isActive'];
  country: PrismaUser['country'];
  occupation: PrismaUser['occupation'] | null;
  createdAt: PrismaUser['createdAt'];
  updatedAt: PrismaUser['updatedAt'];
  emailVerified?: PrismaUser['emailVerified'];
  profileImageUrl?: PrismaUser['profileImageUrl'] | null;
  _count?: {
    bookmarks: number;
    history: number;
    catalogs: number;
  };
  subscription?: SubscriptionData | null;
}

// Type for subscription data
export interface SubscriptionData extends Pick<PrismaSubscription, 
  'id' | 'status' | 'priceId' | 'stripeSubscriptionId' | 'stripePriceId' | 'plan' | 'interval'
> {
  startDate: string; // mapped from currentPeriodStart
  endDate: string;   // mapped from currentPeriodEnd
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  statusFilter?: "all" | "active" | "inactive";
  subscriptionFilter?: "all" | "subscribed" | "none";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats?: {
    total: number;
    active: number;
    inactive: number;
    subscribed: number;
  };
}

/**
 * Fetch users with pagination
 */
export async function fetchUsers(params?: PaginationParams): Promise<PaginatedResponse<UserData>> {
  const url = new URL("/api/cms/users", window.location.origin);
  
  if (params) {
    if (params.page !== undefined) {
      url.searchParams.append("page", params.page.toString());
    }
    if (params.pageSize !== undefined) {
      url.searchParams.append("limit", params.pageSize.toString());
    }
    if (params.search) {
      url.searchParams.append("search", params.search);
    }
    if (params.statusFilter && params.statusFilter !== "all") {
      url.searchParams.append("status", params.statusFilter);
    }
    if (params.subscriptionFilter && params.subscriptionFilter !== "all") {
      url.searchParams.append("subscription", params.subscriptionFilter);
    }
  }
  
  const response = await fetch(url.toString());
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.error || "Failed to fetch users");
  }
  
  return {
    data: responseData.users || [],
    pagination: responseData.pagination || {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    stats: responseData.stats || {
      total: 0,
      active: 0,
      inactive: 0,
      subscribed: 0
    }
  };
}

/**
 * Fetch a single user by ID
 */
export async function fetchUserById(id: string): Promise<UserData> {
  const response = await fetch(`/api/cms/users/${id}`);
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.error || "Failed to fetch user");
  }
  
  return responseData.user;
}

/**
 * Update user active status
 */
export async function updateUserStatus(id: string, isActive: boolean): Promise<UserData> {
  const response = await fetch(`/api/cms/users/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive }),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.error || "Failed to update user status");
  }
  
  return responseData.user;
}

/**
 * Reset user password
 */
export async function resetUserPassword(id: string): Promise<{ success: boolean; message: string; temporaryPassword: string }> {
  const response = await fetch(`/api/cms/users/${id}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.error || "Failed to reset user password");
  }
  
  return responseData;
}
