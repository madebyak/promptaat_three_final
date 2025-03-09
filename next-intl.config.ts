import { getRequestConfig } from "next-intl/server"

// Define supported locales
export const locales = ['en', 'ar'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({ locale }) => {
  // Load messages for the requested locale
  let messages;
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
    console.log(`Successfully loaded messages for locale: ${locale}`);
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
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
