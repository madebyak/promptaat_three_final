"use client";

import { LoginForm } from '@/components/auth/login-form';
import { useParams } from 'next/navigation';

export default function LoginPage() {
  const params = useParams();
  const locale = params.locale as string;
  
  return <LoginForm locale={locale} />;
}
