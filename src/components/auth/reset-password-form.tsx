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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetPasswordData = z.infer<typeof schema>

export interface ResetPasswordFormProps {
  token: string;
  locale?: string;
}

export function ResetPasswordForm({ token, locale = 'en' }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isRtl = locale === 'ar';

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
  })

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to reset password")
      }

      toast({
        title: "Success",
        description: "Password has been reset successfully. Please sign in.",
      })

      router.push(`/${locale}/auth/login`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
            <Label htmlFor="password" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
              {translations.password}
            </Label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
                <FiLock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                {...register("password")}
                type="password"
                placeholder={translations.passwordPlaceholder}
                disabled={isLoading}
                className={`${isRtl ? 'text-right pr-10' : 'pl-10'}`}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
            {errors.password && (
              <p className={`text-sm text-destructive ${isRtl ? 'text-right' : ''}`}>{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
              {translations.confirmPassword}
            </Label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
                <FiLock className="h-5 w-5" />
              </div>
              <Input
                id="confirmPassword"
                {...register("confirmPassword")}
                type="password"
                placeholder={translations.confirmPasswordPlaceholder}
                disabled={isLoading}
                className={`${isRtl ? 'text-right pr-10' : 'pl-10'}`}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
            {errors.confirmPassword && (
              <p className={`text-sm text-destructive ${isRtl ? 'text-right' : ''}`}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
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
  )
}
