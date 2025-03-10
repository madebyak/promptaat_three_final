import { PaginatedResponse, PaginationParams } from "@/types/api";

export interface PromptData {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  instructionEn: string | null;
  instructionAr: string | null;
  promptTextEn: string;
  promptTextAr: string;
  isPro: boolean;
  copyCount: number;
  initialCopyCount: number;
  createdAt: string;
  updatedAt: string;
  categoryId?: string;
  subcategoryId?: string;
  category?: {
    id: string;
    name: string;
    nameAr: string;
  };
  subcategory?: {
    id: string;
    name: string;
    nameAr: string;
  };
  keywords: string[];
  tools: {
    id: string;
    name: string;
    iconUrl?: string;
  }[];
}

export interface PromptFormData {
  titleEn: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  instructionEn?: string | null;
  instructionAr?: string | null;
  promptTextEn: string;
  promptTextAr: string;
  isPro: boolean;
  categoryId?: string;
  subcategoryId?: string;
  keywords?: string[];
  toolIds?: string[];
}

export interface BulkActionParams {
  promptIds: string[];
  action: 'delete' | 'togglePro' | 'activate' | 'deactivate';
}

export async function fetchPrompts(params?: PaginationParams & {
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<PromptData>> {
  const url = new URL("/api/cms/prompts", window.location.origin);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error("Failed to fetch prompts");
  }
  
  return response.json();
}

export async function fetchPrompt(id: string): Promise<PromptData> {
  const response = await fetch(`/api/cms/prompts/${id}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch prompt");
  }
  
  return response.json();
}

export async function createPrompt(data: PromptFormData): Promise<PromptData> {
  const response = await fetch("/api/cms/prompts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create prompt");
  }
  
  return response.json();
}

export async function updatePrompt(id: string, data: Partial<PromptFormData>): Promise<PromptData> {
  const response = await fetch(`/api/cms/prompts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update prompt");
  }
  
  return response.json();
}

export async function deletePrompt(id: string): Promise<void> {
  const response = await fetch(`/api/cms/prompts/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete prompt");
  }
}

export async function performBulkAction(params: BulkActionParams): Promise<void> {
  const response = await fetch("/api/cms/prompts/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to perform bulk action");
  }
}

export async function downloadPromptsCsvTemplate(): Promise<Blob> {
  const response = await fetch("/api/cms/prompts/template", {
    method: "GET",
  });
  
  if (!response.ok) {
    throw new Error("Failed to download CSV template");
  }
  
  return response.blob();
}

export async function uploadPromptsCsv(file: File): Promise<{ 
  success: boolean; 
  imported: number; 
  errors?: Array<{ row: number; message: string }> 
}> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch("/api/cms/prompts/import", {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to import prompts");
  }
  
  return response.json();
}

export async function exportPromptsToCsv(ids?: string[]): Promise<Blob> {
  const url = new URL("/api/cms/prompts/export", window.location.origin);
  
  if (ids && ids.length > 0) {
    url.searchParams.append("ids", ids.join(","));
  }
  
  const response = await fetch(url.toString(), {
    method: "GET",
  });
  
  if (!response.ok) {
    throw new Error("Failed to export prompts");
  }
  
  return response.blob();
}
