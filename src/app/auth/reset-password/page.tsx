'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function ResetPasswordRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // Default to English locale, but could detect from browser settings
    const locale = 'en';
    router.replace(`/${locale}/auth/reset-password${token ? `?token=${token}` : ''}`);
  }, [router, token]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto" />
        <p className="mt-4 text-muted-foreground">Redirecting to password reset page...</p>
      </div>
    </div>
  );
}
