export interface Category {
  id: string;
  name: string;  // Will be name_en or name_ar based on locale
  iconName?: string;
  subcategory?: {
    id: string;
    name: string;
    iconName?: string;
  };
}

export type CategoryType = {
  id: string;
  name: string;
  iconName?: string;
  subcategory?: {
    id: string;
    name: string;
    iconName?: string;
  };
};

export interface Tool {
  id: string;
  name: string;
  iconUrl?: string;
}

export type ToolType = {
  id: string;
  name: string;
  iconUrl?: string;
};

export interface PromptDetail {
  id: string;
  title: string;  // Will be title_en or title_ar based on locale
  description: string;
  instruction: string;
  promptText: string;
  isPro: boolean;
  copyCount: number;
  bookmarkCount: number;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  tools: Tool[];
  keywords: string[];
}

export interface Prompt {
  id: string;
  title: string;  // Will be title_en or title_ar based on locale
  preview: string; // Will be prompt_text_en or prompt_text_ar based on locale
  isPro: boolean;
  copyCount: number;
  categories: Category[];
  tools: Tool[];
}

export interface PromptCardProps {
  id: string;
  title: string;
  preview: string;
  isPro: boolean;
  copyCount: number;
  categories: Category[];
  tools: Tool[];
  isRTL?: boolean;
  locale?: string;
  isBookmarked?: boolean;
}

export interface PromptModalProps {
  promptId: string;
  isOpen: boolean;
  onClose: () => void;
  isRTL?: boolean;
  locale?: string;
  isBookmarked?: boolean;
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
  tool?: string;       // Single tool (legacy support)
  tools?: string[];    // Multiple tools (new implementation)
  search?: string;
  type?: 'free' | 'pro';
  locale?: string;
}
