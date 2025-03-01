export interface Category {
  id: string;
  name: string;  // Will be name_en or name_ar based on locale
}

export type CategoryType = {
  id: string;
  name: string;
};

export interface Tool {
  id: string;
  name: string;
}

export type ToolType = {
  id: string;
  name: string;
};

export interface Prompt {
  id: string;
  title: string;  // Will be title_en or title_ar based on locale
  preview: string; // Will be prompt_text_en or prompt_text_ar based on locale
  isPro: boolean;
  copyCount: number;
  categories: Category[];
  tools: Tool[];
}

export interface PromptsResponse {
  prompts: Prompt[];
  total: number;
  page: number;
  hasMore: boolean;
  nextPage: number | null;
}

export interface PromptsQueryParams {
  page: number;
  limit: number;
  sort?: 'popular' | 'newest' | 'most_used';
  category?: string;
  tool?: string;
  search?: string;
  type?: 'free' | 'pro';
  locale?: string;
}
