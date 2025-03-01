"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export interface VerificationBannerProps {
  email?: string;
  locale?: string;
}

export function VerificationBanner({ email, locale = 'en' }: VerificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  if (!session?.user || session.user.emailVerified) {
    return null
  }

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
    <div className="bg-yellow-100 dark:bg-yellow-900 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Please verify your email address to access all features.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendVerification}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Resend Verification"}
        </Button>
      </div>
    </div>
  )
}
