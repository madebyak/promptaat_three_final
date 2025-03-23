"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FiMail, FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";

interface PasswordResetSentProps {
  email: string;
  locale?: string;
  cooldownPeriod?: number; // Cooldown period in seconds
}

export function PasswordResetSent({ 
  email, 
  locale = 'en',
  cooldownPeriod = 60 // Default to 60 seconds (1 minute)
}: PasswordResetSentProps) {
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const isRtl = locale === 'ar';
  
  const translations = {
    title: locale === 'ar' ? 'تم إرسال رابط إعادة التعيين' : 'Reset Link Sent',
    checkEmail: locale === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check your email',
    instructions: locale === 'ar'
      ? `لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى ${email}. يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور الخاصة بك.`
      : `We've sent a password reset link to ${email}. Please check your email and follow the instructions to reset your password.`,
    note: locale === 'ar'
      ? 'إذا لم تتلق البريد الإلكتروني، يرجى التحقق من مجلد البريد العشوائي أو إعادة إرسال البريد الإلكتروني أدناه.'
      : 'If you don\'t receive the email, please check your spam folder or resend the email below.',
    resendEmail: locale === 'ar' ? 'إعادة إرسال البريد الإلكتروني' : 'Resend Email',
    resendEmailIn: locale === 'ar' 
      ? (seconds: number) => `إعادة إرسال البريد الإلكتروني في (${seconds} ثانية)`
      : (seconds: number) => `Resend Email in (${seconds}s)`,
    resending: locale === 'ar' ? 'جاري إعادة الإرسال...' : 'Resending...',
    backToLogin: locale === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Back to Login',
    resendSuccess: locale === 'ar'
      ? 'تم إعادة إرسال البريد الإلكتروني بنجاح'
      : 'Email resent successfully',
    resendError: locale === 'ar'
      ? 'فشل في إعادة إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.'
      : 'Failed to resend email. Please try again.',
    privacyPolicy: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
    termsOfService: locale === 'ar' ? 'شروط الخدمة' : 'Terms and Conditions',
    refundPolicy: locale === 'ar' ? 'سياسة الاسترداد' : 'Refund Policy',
    allRightsReserved: locale === 'ar' ? 'جميع الحقوق محفوظة لبرومبتات' : 'All rights reserved to Promptaat',
  };

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    try {
      setIsResending(true);
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend reset email');
      }

      toast({
        title: 'Success',
        description: translations.resendSuccess,
      });
      
      // Start the countdown after successful resend
      setCountdown(cooldownPeriod);
    } catch {
      toast({
        title: 'Error',
        description: translations.resendError,
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const isResendDisabled = isResending || countdown > 0;
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            <FiMail className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">{translations.title}</h1>
        <p className="text-xl font-medium mt-2 text-muted-foreground">{translations.checkEmail}</p>
      </div>
      
      <div className={cn("text-center mb-8", isRtl && "text-right")}>
        <p className="text-muted-foreground mb-4">{translations.instructions}</p>
        <p className="text-sm text-muted-foreground">{translations.note}</p>
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={handleResendEmail} 
          variant="outline" 
          className="w-full h-12 text-base" 
          disabled={isResendDisabled}
        >
          {isResending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              {translations.resending}
            </span>
          ) : countdown > 0 ? (
            <span className="flex items-center justify-center gap-2">
              <FiRefreshCw className="h-4 w-4 animate-spin" />
              {translations.resendEmailIn(countdown)}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FiRefreshCw className="h-4 w-4" />
              {translations.resendEmail}
            </span>
          )}
        </Button>
        
        <div className={cn("text-center", isRtl && "text-right")}>
          <Link 
            href={`/${locale}/auth/login`} 
            className={`text-primary font-medium hover:underline flex items-center gap-2 justify-center ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <FiArrowLeft className="h-4 w-4" />
            {translations.backToLogin}
          </Link>
        </div>
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
