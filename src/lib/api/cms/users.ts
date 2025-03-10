/**
 * API functions for user operations
 */

import { User } from "@prisma/client";

// Types for user data
export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  country: string;
  occupation?: string;
  _count?: {
    bookmarks: number;
    history: number;
    catalogs: number;
  };
  subscription?: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    planId: string;
  } | null;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
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
