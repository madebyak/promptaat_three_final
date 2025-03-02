'use client';

import { Suspense } from 'react';
import { ResetPasswordRedirect } from './reset-password-redirect';
import { Spinner } from '@/components/ui/spinner';

export default function ResetPasswordRedirectPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Suspense fallback={
          <>
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading password reset page...</p>
          </>
        }>
          <ResetPasswordRedirect />
        </Suspense>
      </div>
    </div>
  );
}
