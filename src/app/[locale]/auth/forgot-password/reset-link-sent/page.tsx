"use client";

import { useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { PasswordResetSent } from "@/components/auth/password-reset-sent";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function ResetLinkSentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const email = searchParams.get('email') || '';
  
  // Parse cooldown period, default to 3 minutes (180 seconds) if not specified
  // or if the value is not a valid number
  const cooldownParam = searchParams.get('cooldown');
  const cooldownPeriod = cooldownParam ? parseInt(cooldownParam, 10) : 180;
  const finalCooldown = isNaN(cooldownPeriod) ? 180 : cooldownPeriod;

  return (
    <AuthLayout 
      locale={locale}
      heading={locale === 'ar' ? "استعادة كلمة المرور" : "Recover Password"}
      subheading={locale === 'ar' ? "لا تقلق، سنساعدك" : "Don't Worry, We'll Help"}
    >
      <PasswordResetSent 
        email={email} 
        locale={locale} 
        cooldownPeriod={finalCooldown}
      />
    </AuthLayout>
  );
}
