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
    router.replace(`/${locale}/auth/verify${token ? `?token=${token}` : ''}`);
  }, [router, token]);

  return null;
}
