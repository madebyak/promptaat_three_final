"use client";

import { RegisterForm } from '@/components/auth/register-form';
import { useParams } from 'next/navigation';

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;
  
  return <RegisterForm locale={locale} />;
}
