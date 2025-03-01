import { PromptsQueryParams, PromptsResponse } from '@/types/prompts';

export async function fetchPrompts(
  params: PromptsQueryParams,
  locale: string
): Promise<PromptsResponse> {
  const searchParams = new URLSearchParams();
  
  // Add all params to search params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });
  
  // Add locale for server to return correct language content
  searchParams.append('locale', locale);

  const response = await fetch(`/api/prompts?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch prompts');
  }

  return response.json();
}
