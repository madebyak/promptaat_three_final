"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import { FcGoogle } from "react-icons/fc"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import Head from "next/head"

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
})

type LoginData = z.infer<typeof schema>

interface LoginFormProps {
  locale?: string;
}

export function LoginForm({ locale = 'en' }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const isRtl = locale === 'ar'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (data: LoginData) => {
    try {
      setIsLoading(true)
      console.log('[Login] Attempting login with email:', data.email)

      // Log environment information in production to help diagnose issues
      if (process.env.NODE_ENV === 'production') {
        console.log('[Login] Production environment details:', {
          nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          vercelUrl: process.env.VERCEL_URL || 'not set',
          nodeEnv: process.env.NODE_ENV,
          locale,
        });
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: `/${locale}`,
        // Pass the remember me value to the authentication handler
        rememberMe: data.rememberMe,
      })

      console.log('[Login] Sign in result:', { 
        ok: result?.ok, 
        error: result?.error,
        status: result?.status,
        url: result?.url
      })

      if (!result?.ok) {
        let errorMessage = "Failed to sign in"
        let errorDetails = {}
        
        // Handle specific error cases
        if (result?.error === "CredentialsSignin") {
          errorMessage = "Invalid email or password"
          errorDetails = { type: 'credentials' }
        } else if (result?.error === "Database connection error") {
          errorMessage = "Database connection error. Please try again later."
          errorDetails = { type: 'database' }
        } else if (result?.error?.includes('NEXTAUTH_SECRET')) {
          errorMessage = "Authentication configuration error. Please contact support."
          errorDetails = { type: 'config', missing: 'NEXTAUTH_SECRET' }
        } else if (result?.error) {
          errorMessage = result.error
          errorDetails = { type: 'unknown', rawError: result.error }
        }
        
        console.error('[Login] Authentication failed:', { errorMessage, ...errorDetails, status: result?.status })
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Signed in successfully",
      })

      console.log('[Login] Waiting for session establishment')
      // Wait for session to be fully established - increased timeout for production
      const sessionWaitTime = process.env.NODE_ENV === 'production' ? 1500 : 1000
      await new Promise(resolve => setTimeout(resolve, sessionWaitTime))
      
      console.log('[Login] Session established, redirecting to home')
      
      // Use window.location for a full page reload to ensure session is properly reflected in the UI
      window.location.href = `/${locale}`
    } catch (error) {
      console.error('[Login] Error during sign in:', error)
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn("google", { 
        callbackUrl: `/${locale}`,
        redirect: false 
      });
      
      // Wait for session establishment
      const sessionWaitTime = process.env.NODE_ENV === 'production' ? 1500 : 1000;
      await new Promise(resolve => setTimeout(resolve, sessionWaitTime));
      
      // Check if we need to get the user's profile data
      const session = await fetch("/api/auth/session");
      const sessionData = await session.json();
      
      if (sessionData?.user?.needsProfileCompletion) {
        // Set a cookie to indicate profile completion is needed
        document.cookie = "needs_profile_completion=true; path=/; max-age=3600";
        // Redirect to profile completion page
        window.location.href = `/${locale}/auth/profile-completion`;
      } else {
        // Normal redirect to homepage
        window.location.href = result?.url || `/${locale}`;
      }
    } catch (error) {
      console.error('[Google Login] Error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    title: locale === 'ar' ? 'مرحبًا بعودتك إلى برومبتات' : 'Welcome Back to Promptaat',
    subtitle: locale === 'ar' ? 'سجل الدخول لإطلاق رحلتك الإبداعية' : 'Log in to unlock your creative journey',
    email: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
    emailPlaceholder: locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
    password: locale === 'ar' ? 'كلمة المرور' : 'Password',
    passwordPlaceholder: locale === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password',
    rememberMe: locale === 'ar' ? 'تذكرني' : 'Remember me',
    forgotPassword: locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?',
    signIn: locale === 'ar' ? 'تسجيل الدخول' : 'Login',
    signingIn: locale === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...',
    noAccount: locale === 'ar' ? 'ليس لديك حساب؟' : 'Don\'t have an account?',
    register: locale === 'ar' ? 'التسجيل مجانًا' : 'Sign up for free',
    or: locale === 'ar' ? 'أو' : 'OR',
    continueWithGoogle: locale === 'ar' ? 'المتابعة باستخدام جوجل' : 'Continue with Google',
    privacyPolicy: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
    termsOfService: locale === 'ar' ? 'شروط الخدمة' : 'Terms and Conditions',
    refundPolicy: locale === 'ar' ? 'سياسة الاسترداد' : 'Refund Policy',
    allRightsReserved: locale === 'ar' ? 'جميع الحقوق محفوظة لبرومبتات' : 'All rights reserved to Promptaat',
  }

  return (
    <div className="w-full">
      <Head>
        <title>{translations.title}</title>
        <meta name="description" content={translations.subtitle} />
      </Head>
      <div className="mb-8">
        <h1 className={cn("text-3xl font-bold", isRtl && "text-right")}>{translations.title}</h1>
        <p className={cn("text-muted-foreground mt-2", isRtl && "text-right")}>{translations.subtitle}</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-label="Login Form">
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
              {...register("email")}
              type="email"
              placeholder={translations.emailPlaceholder}
              disabled={isLoading}
              className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12`}
              dir={isRtl ? "rtl" : "ltr"}
              aria-required="true"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby="email-error"
            />
          </div>
          {errors.email && (
            <p id="email-error" className={`text-sm text-destructive ${isRtl ? 'text-right' : ''}`}>{errors.email.message}</p>
          )}
        </div>
        
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
              type={showPassword ? "text" : "password"}
              placeholder={translations.passwordPlaceholder}
              disabled={isLoading}
              className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 ${isRtl ? 'pr-12' : 'pr-12'}`}
              dir={isRtl ? "rtl" : "ltr"}
              aria-required="true"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby="password-error"
            />
            <button
              type="button"
              className={`absolute inset-y-0 ${isRtl ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-muted-foreground hover:text-foreground`}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className={`text-sm text-destructive ${isRtl ? 'text-right' : ''}`}>{errors.password.message}</p>
          )}
        </div>
        
        <div className={cn(
          "flex items-center justify-between",
          isRtl && "flex-row-reverse"
        )}>
          <div className={`flex items-center ${isRtl ? 'flex-row-reverse' : ''} space-x-2 ${isRtl ? 'space-x-reverse' : ''}`}>
            <Checkbox 
              id="rememberMe" 
              checked={rememberMe}
              onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
              disabled={isLoading}
              aria-label="Remember me"
            />
            <Label 
              htmlFor="rememberMe" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {translations.rememberMe}
            </Label>
          </div>
          <Link 
            href={`/${locale}/auth/forgot-password`} 
            className="text-sm font-medium text-primary hover:underline"
            aria-label="Forgot password"
          >
            {translations.forgotPassword}
          </Link>
        </div>
        
        <Button type="submit" className="w-full h-12 text-base" disabled={isLoading} aria-label="Login">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              {translations.signingIn}
            </span>
          ) : (
            translations.signIn
          )}
        </Button>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {translations.or}
            </span>
          </div>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-12 text-base"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          aria-label="Continue with Google"
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          {translations.continueWithGoogle}
        </Button>
      </form>
      
      <div className="mt-8">
        <p className={cn("text-center text-sm text-muted-foreground", isRtl && "text-right")}>
          {translations.noAccount}{' '}
          <Link href={`/${locale}/auth/register`} className="text-primary font-medium hover:underline" aria-label="Sign up for free">
            {translations.register}
          </Link>
        </p>
      </div>
      
      <div className="mt-12 pt-6 border-t border-border">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Link href={`/${locale}/privacy`} className="hover:underline" aria-label="Privacy Policy">
            {translations.privacyPolicy}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:underline" aria-label="Terms and Conditions">
            {translations.termsOfService}
          </Link>
          <Link href={`/${locale}/refund`} className="hover:underline" aria-label="Refund Policy">
            {translations.refundPolicy}
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {new Date().getFullYear()} - {translations.allRightsReserved}
        </p>
      </div>
    </div>
  )
}
