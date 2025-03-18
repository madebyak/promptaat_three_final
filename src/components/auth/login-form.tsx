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
import { FiMail, FiLock } from "react-icons/fi"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

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

  const translations = {
    title: locale === 'ar' ? 'تسجيل الدخول' : 'Sign In',
    subtitle: locale === 'ar' ? 'أدخل بياناتك للوصول إلى حسابك' : 'Enter your credentials to access your account',
    email: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
    emailPlaceholder: locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
    password: locale === 'ar' ? 'كلمة المرور' : 'Password',
    passwordPlaceholder: locale === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password',
    rememberMe: locale === 'ar' ? 'تذكرني' : 'Remember me',
    forgotPassword: locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?',
    signIn: locale === 'ar' ? 'تسجيل الدخول' : 'Sign in',
    signingIn: locale === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...',
    noAccount: locale === 'ar' ? 'ليس لديك حساب؟' : 'Don\'t have an account?',
    register: locale === 'ar' ? 'التسجيل' : 'Register',
  }

  return (
    <Card className="w-full shadow-md max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className={cn("text-2xl font-bold text-center", isRtl && "text-right")}>{translations.title}</CardTitle>
        <CardDescription className={cn("text-center", isRtl && "text-right")}>{translations.subtitle}</CardDescription>
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
                {...register("email")}
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
          <div className="space-y-2">
            <div className={cn(
              "flex items-center justify-between flex-wrap gap-2",
              isRtl && "flex-row-reverse"
            )}>
              <Label htmlFor="password" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
                {translations.password}
              </Label>
              <Link 
                href={`/${locale}/auth/forgot-password`} 
                className="text-sm font-medium text-primary hover:underline"
              >
                {translations.forgotPassword}
              </Link>
            </div>
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
          <div className={`flex items-center ${isRtl ? 'flex-row-reverse justify-end' : 'justify-start'} space-x-2 ${isRtl ? 'space-x-reverse' : ''}`}>
            <Checkbox 
              id="rememberMe" 
              checked={rememberMe}
              onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
              disabled={isLoading}
            />
            <Label 
              htmlFor="rememberMe" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {translations.rememberMe}
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                {translations.signingIn}
              </span>
            ) : (
              translations.signIn
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center text-sm">
          <span className="text-muted-foreground">{translations.noAccount}</span>{' '}
          <Link href={`/${locale}/auth/register`} className="text-primary font-medium hover:underline">
            {translations.register}
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
