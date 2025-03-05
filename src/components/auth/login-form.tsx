"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
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

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/",
        // Pass the remember me value to the authentication handler
        rememberMe: data.rememberMe,
      })

      if (!result?.ok) {
        throw new Error(result?.error || "Failed to sign in")
      }

      toast({
        title: "Success",
        description: "Signed in successfully",
      })

      router.push(`/${locale}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
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
            <div className="flex items-center justify-between">
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
