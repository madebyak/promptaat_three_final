"use client";

import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { AuthLayout } from '@/components/auth/auth-layout';
import { useParams, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const token = searchParams.get('token') || '';
  
  return (
    <AuthLayout 
      locale={locale}
      heading={locale === 'ar' ? "إعادة تعيين كلمة المرور" : "Reset Password"}
      subheading={locale === 'ar' ? "استعد حسابك" : "Reclaim Your Account"}
    >
      <ResetPasswordForm locale={locale} token={token} />
    </AuthLayout>
  );
}
