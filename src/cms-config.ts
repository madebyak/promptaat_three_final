/**
 * CMS-specific configuration to ensure proper handling of CMS routes
 * This file helps prevent 404 errors in the CMS by providing proper locale handling
 */

import { createSharedPathnamesNavigation } from 'next-intl/navigation';

// Define locales for CMS (only English is used for admin)
export const locales = ['en'];
export const defaultLocale = 'en';

// Create navigation functions specifically for CMS
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ 
  locales,
  localePrefix: 'never' // CMS doesn't use locale prefixes
});
