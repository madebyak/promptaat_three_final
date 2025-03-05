'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export interface VerifyFormProps {
  email?: string;
  locale?: string;
}

export function VerifyForm({ email = '', locale = 'en' }: VerifyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const isRtl = locale === 'ar';

  const translations = {
    placeholder: locale === 'ar' ? 'أدخل رمز التحقق' : 'Enter verification code',
    verifying: locale === 'ar' ? 'جاري التحقق...' : 'Verifying...',
    verify: locale === 'ar' ? 'تحقق من البريد الإلكتروني' : 'Verify Email',
    successTitle: locale === 'ar' ? 'تم بنجاح' : 'Success',
    successMessage: locale === 'ar' ? 'تم التحقق من البريد الإلكتروني بنجاح' : 'Email verified successfully',
    errorTitle: locale === 'ar' ? 'خطأ' : 'Error',
    errorMessage: locale === 'ar' ? 'فشل التحقق من البريد الإلكتروني' : 'Failed to verify email',
    invalidCode: locale === 'ar' ? 'رمز التحقق غير صالح' : 'Invalid verification code'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        throw new Error(translations.invalidCode);
      }

      toast({
        title: translations.successTitle,
        description: translations.successMessage,
      });

      router.push(`/${locale}/auth/login`);
    } catch {
      toast({
        title: translations.errorTitle,
        description: translations.errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder={translations.placeholder}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isLoading}
          dir={isRtl ? "rtl" : "ltr"}
          className={isRtl ? "text-right" : "text-left"}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? translations.verifying : translations.verify}
      </Button>
    </form>
  );
}
