"use client";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useParams } from "next/navigation";

export default function ResetPasswordTokenPage() {
  const params = useParams();
  const locale = params.locale as string;
  const token = params.token as string;
  
  return (
    <AuthLayout 
      locale={locale}
      heading={locale === 'ar' ? "إعادة تعيين كلمة المرور" : "Reset Password"}
      subheading={locale === 'ar' ? "استعد حسابك" : "Reclaim Your Account"}
    >
      <ResetPasswordForm token={token} locale={locale} />
    </AuthLayout>
  );
}
