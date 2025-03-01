"use client";

import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { useParams, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const token = searchParams.get('token') || '';
  
  return (
    <ResetPasswordForm locale={locale} token={token} />
  );
}
