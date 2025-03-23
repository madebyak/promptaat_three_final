'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof schema>;

interface ForgotPasswordFormProps {
  locale?: string;
}

export function ForgotPasswordForm({ locale = 'en' }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const isRtl = locale === 'ar';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
      }

      router.push(`/${locale}/auth/forgot-password/reset-link-sent?email=${encodeURIComponent(data.email)}`);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const translations = {
    title: locale === 'ar' ? 'استعادة كلمة المرور' : 'Forgot Password',
    subtitle: locale === 'ar' 
      ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور' 
      : 'Enter your email and we will send you a password reset link',
    email: locale === 'ar' ? 'البريد الإلكتروني' : 'Email address',
    emailPlaceholder: locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
    sendResetLink: locale === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link',
    sending: locale === 'ar' ? 'جاري الإرسال...' : 'Sending...',
    backToLogin: locale === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Back to Login',
    privacyPolicy: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
    termsOfService: locale === 'ar' ? 'شروط الخدمة' : 'Terms and Conditions',
    refundPolicy: locale === 'ar' ? 'سياسة الاسترداد' : 'Refund Policy',
    allRightsReserved: locale === 'ar' ? 'جميع الحقوق محفوظة لبرومبتات' : 'All rights reserved to Promptaat',
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className={cn("text-3xl font-bold", isRtl && "text-right")}>{translations.title}</h1>
        <p className={cn("text-muted-foreground mt-2", isRtl && "text-right")}>{translations.subtitle}</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
            {translations.email}
          </Label>
          <div className="relative">
            <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
              <FiMail className="h-5 w-5" />
            </div>
            <Input
              id="email"
              {...register('email')}
              type="email"
              placeholder={translations.emailPlaceholder}
              disabled={isLoading}
              className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 text-base`}
              dir={isRtl ? "rtl" : "ltr"}
            />
          </div>
          {errors.email && (
            <p className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`}>{errors.email.message}</p>
          )}
        </div>
        
        <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              {translations.sending}
            </span>
          ) : (
            translations.sendResetLink
          )}
        </Button>
      </form>
      
      <div className="mt-8">
        <p className={cn("text-center text-sm text-muted-foreground", isRtl && "text-right")}>
          <Link 
            href={`/${locale}/auth/login`} 
            className={`text-primary font-medium hover:underline flex items-center gap-2 justify-center ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <FiArrowLeft className="h-4 w-4" />
            {translations.backToLogin}
          </Link>
        </p>
      </div>
      
      <div className="mt-12 pt-6 border-t border-border">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Link href={`/${locale}/privacy`} className="hover:underline">
            {translations.privacyPolicy}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:underline">
            {translations.termsOfService}
          </Link>
          <Link href={`/${locale}/refund`} className="hover:underline">
            {translations.refundPolicy}
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {new Date().getFullYear()} - {translations.allRightsReserved}
        </p>
      </div>
    </div>
  );
}
