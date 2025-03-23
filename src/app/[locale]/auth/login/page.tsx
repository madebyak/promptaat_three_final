"use client";

import { LoginForm } from '@/components/auth/login-form';
import { AuthLayout } from '@/components/auth/auth-layout';
import { useParams } from 'next/navigation';

export default function LoginPage() {
  const params = useParams();
  const locale = params.locale as string;
  
  return (
    <AuthLayout 
      locale={locale}
      heading={locale === 'ar' ? "مرحبًا بك في" : "Welcome to"}
      subheading={locale === 'ar' ? "مستقبل الموجهات الذكية" : "The Future of Prompting"}
    >
      <LoginForm locale={locale} />
    </AuthLayout>
  );
}