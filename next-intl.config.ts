import { getRequestConfig } from "next-intl/server"

// Define supported locales
export const locales = ['en', 'ar'];
export const defaultLocale = 'en';

// Define paths that should be excluded from internationalization
export const nonLocalizedPaths = ['/cms', '/api/cms'];

export default getRequestConfig(async ({ locale }) => {
  // Check if we're using the default locale as a fallback for CMS routes
  const localeToUse = locale || defaultLocale;
  
  // Load messages for the requested locale
  let messages;
  try {
    messages = (await import(`./messages/${localeToUse}.json`)).default;
    console.log(`Successfully loaded messages for locale: ${localeToUse}`);
  } catch (error) {
    console.error(`Failed to load messages for locale: ${localeToUse}`, error);
    // Fallback to English if the requested locale fails
    messages = (await import(`./messages/en.json`)).default;
  }
  
  return {
    messages,
    // You can add other configuration options here if needed
    timeZone: 'Asia/Riyadh',
    now: new Date(),
  }
})
