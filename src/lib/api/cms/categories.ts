/**
 * API functions for category operations
 */

// Type for category data
export interface CategoryData {
  id?: string;
  nameEn: string;
  nameAr: string;
  iconName: string;
  parentId: string | null;
  sortOrder: number;
}

/**
 * Create a new category
 */
export async function createCategory(data: CategoryData) {
  const response = await fetch("/api/cms/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "Failed to create category");
  }
  
  return responseData;
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, data: CategoryData) {
  const response = await fetch("/api/cms/categories", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, id }),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "Failed to update category");
  }
  
  return responseData;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string) {
  console.log('Deleting category with ID:', id);
  try {
    const response = await fetch(`/api/cms/categories?id=${id}`, {
      method: "DELETE",
    });
    
    const responseData = await response.json();
    console.log('Delete category response:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to delete category");
    }
    
    return responseData;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

/**
 * Reorder categories
 */
export async function reorderCategories(updates: { id: string; sortOrder: number }[]) {
  const response = await fetch("/api/cms/categories/reorder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ updates }),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "Failed to reorder categories");
  }
  
  return responseData;
}

/**
 * Fetch all categories
 */
export async function fetchCategories() {
  const response = await fetch("/api/cms/categories");
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "Failed to fetch categories");
  }
  
  return responseData.data || [];
}

/**
 * Fetch a single category by ID
 */
export async function fetchCategoryById(id: string) {
  const response = await fetch(`/api/cms/categories?id=${id}`);
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "Failed to fetch category");
  }
  
  return responseData.data;
} 