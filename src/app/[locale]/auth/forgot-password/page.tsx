"use client";

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AuthLayout } from '@/components/auth/auth-layout';
import { useParams } from 'next/navigation';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <AuthLayout 
      locale={locale}
      heading={locale === 'ar' ? "استعادة كلمة المرور" : "Recover Password"}
      subheading={locale === 'ar' ? "لا تقلق، سنساعدك" : "Don't Worry, We'll Help"}
    >
      <ForgotPasswordForm locale={locale} />
    </AuthLayout>
  );
}
