import { getRequestConfig } from "next-intl/server"

// Define supported locales
export const locales = ['en', 'ar'];
export const defaultLocale = 'en';

// Define paths that should be excluded from internationalization
export const nonLocalizedPaths = [
  '/cms-login',
  '/cms', 
  '/cms/auth',
  '/cms/auth/login',
  '/cms/dashboard',
  '/cms/prompts',
  '/cms/categories',
  '/cms/tools',
  '/cms/users',
  '/cms/api',
  '/api/cms'
];

// This function is used by middleware to check if a path should be excluded from i18n
export function isCmsPath(pathname: string): boolean {
  return pathname.startsWith('/cms-login') || pathname.startsWith('/cms') || pathname.startsWith('/api/cms');
}

export default getRequestConfig(async ({ locale }) => {
  // Get the current URL path from the request context if available
  const timestamp = new Date().toISOString();
  
  // Check if we're using the default locale as a fallback
  const localeToUse = locale || defaultLocale;
  
  // Log the locale being used for debugging
  console.log(`[${timestamp}] [next-intl] Loading messages for locale: ${localeToUse}`);
  
  // Load messages for the requested locale
  let messages;
  try {
    messages = (await import(`./messages/${localeToUse}.json`)).default;
    console.log(`[${timestamp}] [next-intl] Successfully loaded messages for locale: ${localeToUse}`);
  } catch (error) {
    console.error(`[${timestamp}] [next-intl] Failed to load messages for locale: ${localeToUse}`, error);
    // Fallback to English if the requested locale fails
    try {
      messages = (await import(`./messages/en.json`)).default;
      console.log(`[${timestamp}] [next-intl] Falling back to English messages`);
    } catch (fallbackError) {
      console.error(`[${timestamp}] [next-intl] Failed to load fallback English messages`, fallbackError);
      // Initialize with an empty object if all else fails
      messages = {};
    }
  }
  
  return {
    messages,
    // You can add other configuration options here if needed
    timeZone: 'Asia/Riyadh',
    now: new Date(),
  }
})
