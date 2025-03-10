/**
 * API functions for tool operations
 */

// Type for tool data
export interface ToolData {
  id?: string;
  name: string;
  iconUrl?: string;
}

/**
 * Create a new tool
 */
export async function createTool(data: ToolData) {
  const response = await fetch("/api/cms/tools", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "Failed to create tool");
  }
  
  return responseData;
}

/**
 * Update an existing tool
 */
export async function updateTool(id: string, data: ToolData) {
  const response = await fetch("/api/cms/tools", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, id }),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "Failed to update tool");
  }
  
  return responseData;
}

/**
 * Delete a tool
 */
export async function deleteTool(id: string) {
  const response = await fetch(`/api/cms/tools?id=${id}`, {
    method: "DELETE",
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "Failed to delete tool");
  }
  
  return responseData;
}

/**
 * Fetch tools with pagination
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export async function fetchTools(search?: string, pagination?: PaginationParams) {
  const url = new URL("/api/cms/tools", window.location.origin);
  
  if (search) {
    url.searchParams.append("search", search);
  }
  
  // Add pagination parameters if provided
  if (pagination) {
    if (pagination.page !== undefined) {
      url.searchParams.append("page", pagination.page.toString());
    }
    if (pagination.pageSize !== undefined) {
      url.searchParams.append("pageSize", pagination.pageSize.toString());
    }
  }
  
  const response = await fetch(url.toString());
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "Failed to fetch tools");
  }
  
  // If the API returns paginated data, use it, otherwise assume all data is returned
  if (responseData.pagination) {
    return responseData as PaginatedResponse<Record<string, unknown>>;
  }
  
  // For backward compatibility, if the API doesn't support pagination yet
  return {
    data: responseData.data || [],
    pagination: {
      total: (responseData.data || []).length,
      page: 1,
      pageSize: (responseData.data || []).length,
      totalPages: 1
    }
  };
}

/**
 * Fetch a single tool by ID
 */
export async function fetchToolById(id: string) {
  const response = await fetch(`/api/cms/tools?id=${id}`);
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "Failed to fetch tool");
  }
  
  return responseData.tool;
} 