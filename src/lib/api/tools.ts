import { Tool } from '@/types/prompts';

/**
 * Fetch all tools
 */
/**
 * Fetch all tools from the API
 * @param locale The current locale
 * @returns An array of Tool objects
 */
export async function fetchTools(locale: string): Promise<{ tools: Tool[] }> {
  try {
    const url = new URL("/api/tools", window.location.origin);
    
    // Add locale for proper translation if needed
    url.searchParams.append("locale", locale);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch tools');
    }

    // The API returns { tools: Tool[], metadata: { locale: string } }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tools:', error);
    return { tools: [] };
  }
}
