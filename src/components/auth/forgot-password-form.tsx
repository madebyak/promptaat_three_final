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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

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

      toast({
        title: 'Success',
        description: 'Password reset email sent. Please check your inbox.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
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
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{translations.title}</CardTitle>
        <CardDescription className="text-center">{translations.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                className={`${isRtl ? 'text-right pr-10' : 'pl-10'}`}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
            {errors.email && (
              <p className={`text-sm text-destructive ${isRtl ? 'text-right' : ''}`}>{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
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
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-center">
          <Link 
            href={`/${locale}/auth/login`} 
            className={`text-sm text-primary hover:underline flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <FiArrowLeft className="h-4 w-4" />
            {translations.backToLogin}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
