'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function VerifyRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // Default to English locale, but could detect from browser settings
    const locale = 'en';
    
    // Ensure the token is properly encoded in the URL
    const encodedToken = token ? encodeURIComponent(token) : '';
    const redirectUrl = `/${locale}/auth/verify${encodedToken ? `?token=${encodedToken}` : ''}`;
    
    console.log('Redirecting to verification page:', redirectUrl);
    router.replace(redirectUrl);
  }, [router, token]);

  return null;
}
