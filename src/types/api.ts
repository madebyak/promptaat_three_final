export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}

export interface SearchParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categoryId?: string;
  subcategoryId?: string;
  status?: string;
  isPro?: boolean;
}
