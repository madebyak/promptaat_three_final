'use client';

import { Suspense } from 'react';
import { VerifyRedirect } from './verify-redirect';
import { Spinner } from '@/components/ui/spinner';

export default function VerifyRedirectPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Suspense fallback={
          <>
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading verification page...</p>
          </>
        }>
          <VerifyRedirect />
        </Suspense>
      </div>
    </div>
  );
}
