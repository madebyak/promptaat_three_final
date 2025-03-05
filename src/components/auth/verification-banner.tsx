"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { FiMail, FiAlertTriangle } from "react-icons/fi"
import { Spinner } from "@/components/ui/spinner"

export interface VerificationBannerProps {
  email?: string;
  locale?: string;
}

export function VerificationBanner({ email, locale = 'en' }: VerificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()
  const isRtl = locale === 'ar';

  if (!session?.user || session.user.emailVerified) {
    return null
  }

  const translations = {
    message: locale === 'ar' 
      ? 'يرجى التحقق من عنوان بريدك الإلكتروني للوصول إلى جميع الميزات.'
      : 'Please verify your email address to access all features.',
    resend: locale === 'ar' 
      ? 'إعادة إرسال التحقق'
      : 'Resend Verification',
    sending: locale === 'ar' 
      ? 'جاري الإرسال...'
      : 'Sending...',
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || session.user.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to resend verification email")
      }

      toast({
        title: "Success",
        description: "Verification email has been sent",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to resend verification email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg shadow-sm p-3 mb-4">
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${isRtl ? 'text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full">
            <FiAlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {translations.message}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendVerification}
          disabled={isLoading}
          className={`shrink-0 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800 ${isRtl ? 'flex-row-reverse' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              {translations.sending}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FiMail className="h-4 w-4" />
              {translations.resend}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
