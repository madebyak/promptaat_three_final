"use client";

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { useParams } from 'next/navigation';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <ForgotPasswordForm locale={locale} />
  );
}
