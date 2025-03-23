"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { FiLock, FiArrowLeft } from "react-icons/fi"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"

type ResetPasswordFormProps = {
  token: string;
  locale?: string;
}

export function ResetPasswordForm({ token, locale = 'en' }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isRtl = locale === 'ar';

  const translations = {
    title: locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password',
    subtitle: locale === 'ar' 
      ? 'أدخل كلمة المرور الجديدة وتأكيدها' 
      : 'Enter your new password and confirm it',
    password: locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password',
    passwordPlaceholder: locale === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password',
    confirmPassword: locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password',
    confirmPasswordPlaceholder: locale === 'ar' ? 'أكد كلمة المرور الجديدة' : 'Confirm new password',
    resetPassword: locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password',
    resetting: locale === 'ar' ? 'جاري إعادة التعيين...' : 'Resetting...',
    backToLogin: locale === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Back to Login',
    successTitle: locale === 'ar' ? 'تم بنجاح' : 'Success',
    successMessage: locale === 'ar' 
      ? 'تم إعادة تعيين كلمة المرور بنجاح. يرجى تسجيل الدخول.' 
      : 'Password has been reset successfully. Please sign in.',
    errorTitle: locale === 'ar' ? 'خطأ' : 'Error',
    errorMessage: locale === 'ar' 
      ? 'فشل في إعادة تعيين كلمة المرور' 
      : 'Failed to reset password',
    networkError: locale === 'ar'
      ? 'حدث خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.'
      : 'A network error occurred. Please check your internet connection and try again.',
    invalidToken: locale === 'ar'
      ? 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية'
      : 'Password reset link is invalid or has expired',
    passwordMinLength: locale === 'ar'
      ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل'
      : 'Password must be at least 8 characters',
    passwordsDoNotMatch: locale === 'ar'
      ? 'كلمات المرور غير متطابقة'
      : 'Passwords do not match',
    privacyPolicy: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
    termsOfService: locale === 'ar' ? 'شروط الخدمة' : 'Terms and Conditions',
    refundPolicy: locale === 'ar' ? 'سياسة الاسترداد' : 'Refund Policy',
    allRightsReserved: locale === 'ar' ? 'جميع الحقوق محفوظة لبرومبتات' : 'All rights reserved to Promptaat',
  };

  const schema = z.object({
    password: z.string().min(8, translations.passwordMinLength),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: translations.passwordsDoNotMatch,
    path: ["confirmPassword"],
  });

  type ResetPasswordData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          throw new Error(translations.invalidToken);
        }
        throw new Error(error.message || translations.errorMessage);
      }

      toast({
        title: translations.successTitle,
        description: translations.successMessage,
      });

      router.push(`/${locale}/auth/login`);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : error instanceof TypeError 
          ? translations.networkError 
          : translations.errorMessage;

      toast({
        title: translations.errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className={cn("text-3xl font-bold", isRtl && "text-right")}>{translations.title}</h1>
        <p className={cn("text-muted-foreground mt-2", isRtl && "text-right")}>{translations.subtitle}</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
            {translations.password}
          </Label>
          <div className="relative">
            <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
              <FiLock className="h-5 w-5" aria-hidden="true" />
            </div>
            <Input
              id="password"
              {...register("password")}
              type="password"
              placeholder={translations.passwordPlaceholder}
              disabled={isLoading}
              className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 text-base`}
              dir={isRtl ? "rtl" : "ltr"}
              aria-label={translations.password}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
          </div>
          {errors.password && (
            <p id="password-error" className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`} role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
            {translations.confirmPassword}
          </Label>
          <div className="relative">
            <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
              <FiLock className="h-5 w-5" aria-hidden="true" />
            </div>
            <Input
              id="confirmPassword"
              {...register("confirmPassword")}
              type="password"
              placeholder={translations.confirmPasswordPlaceholder}
              disabled={isLoading}
              className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 text-base`}
              dir={isRtl ? "rtl" : "ltr"}
              aria-label={translations.confirmPassword}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            />
          </div>
          {errors.confirmPassword && (
            <p id="confirm-password-error" className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`} role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 text-base" 
          disabled={isLoading}
          aria-label={isLoading ? translations.resetting : translations.resetPassword}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              {translations.resetting}
            </span>
          ) : (
            translations.resetPassword
          )}
        </Button>
      </form>
      
      <div className="mt-8">
        <p className={cn("text-center text-sm text-muted-foreground", isRtl && "text-right")}>
          <Link 
            href={`/${locale}/auth/login`} 
            className={`text-primary font-medium hover:underline flex items-center gap-2 justify-center ${isRtl ? 'flex-row-reverse' : ''}`}
            aria-label={translations.backToLogin}
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
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
