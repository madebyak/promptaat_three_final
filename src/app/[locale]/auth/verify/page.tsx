"use client";

import { VerifyForm } from '@/components/auth/verify-form';
import { useParams } from 'next/navigation';

export default function VerifyPage() {
  const params = useParams();
  const locale = params.locale as string;
  
  return (
    <VerifyForm locale={locale} />
  );
}
