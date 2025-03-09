import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  try {
    // For CMS routes, we need to handle locale differently to prevent the "Unable to find next-intl locale" error
    // In Next.js app router, we can use the fact that CMS routes don't have locale prefixes
    // If the locale is undefined or doesn't match our supported locales, it's likely a CMS route
    if (!locale || !['en', 'ar'].includes(locale)) {
      console.log(`[i18n] Possible CMS route detected, using default locale`);
      // Always use the default locale for CMS routes
      return {
        locale: 'en',
        messages: (await import(`../messages/en.json`)).default
      };
    }
    
    // For regular routes, use the locale from the URL
    return {
      messages: (await import(`../messages/${locale}.json`)).default
    };
  } catch (error) {
    console.error('[i18n] Error in getRequestConfig:', error);
    // Fallback to English in case of any errors
    return {
      locale: 'en',
      messages: (await import(`../messages/en.json`)).default
    };
  }
});
