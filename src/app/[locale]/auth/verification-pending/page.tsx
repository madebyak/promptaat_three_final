"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerificationPendingPage() {
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  const isRtl = locale === 'ar';

  const translations = {
    title: locale === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email',
    description: locale === 'ar' 
      ? 'لقد أرسلنا رابط تحقق إلى بريدك الإلكتروني. يرجى النقر على الرابط في البريد الإلكتروني لتأكيد حسابك.' 
      : 'We have sent a verification link to your email. Please click the link in the email to confirm your account.',
    emailSentTo: locale === 'ar' ? 'تم إرسال البريد الإلكتروني إلى:' : 'Email sent to:',
    didntReceive: locale === 'ar' ? 'لم تستلم البريد الإلكتروني؟' : 'Didn\'t receive the email?',
    resendEmail: locale === 'ar' ? 'إعادة إرسال البريد الإلكتروني' : 'Resend Email',
    resending: locale === 'ar' ? 'جاري إعادة الإرسال...' : 'Resending...',
    backToLogin: locale === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Back to Login',
    successTitle: locale === 'ar' ? 'تم الإرسال' : 'Email Sent',
    successMessage: locale === 'ar' ? 'تم إعادة إرسال رابط التحقق بنجاح' : 'Verification link has been resent successfully',
    errorTitle: locale === 'ar' ? 'خطأ' : 'Error',
    errorMessage: locale === 'ar' ? 'فشل في إعادة إرسال البريد الإلكتروني' : 'Failed to resend email',
  };

  const handleResendEmail = async () => {
    if (!email) return;
    
    try {
      setResending(true);
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      toast({
        title: translations.successTitle,
        description: translations.successMessage,
      });
    } catch (error) {
      toast({
        title: translations.errorTitle,
        description: translations.errorMessage,
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full mx-auto shadow-md border-0">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">{translations.title}</CardTitle>
        <CardDescription className="text-center">
          {translations.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {email && (
          <div className="p-4 rounded-md bg-muted flex items-center justify-center flex-col space-y-2">
            <p className="text-sm text-muted-foreground">{translations.emailSentTo}</p>
            <p className="font-medium">{email}</p>
          </div>
        )}
        
        <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-700">
              {locale === 'ar' 
                ? 'تحقق من صندوق البريد الوارد وصندوق البريد العشوائي. قد يستغرق وصول البريد الإلكتروني بضع دقائق.'
                : 'Check both your inbox and spam folder. The email may take a few minutes to arrive.'}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center w-full">
          <p className="text-sm text-muted-foreground mb-2">{translations.didntReceive}</p>
          <Button 
            onClick={handleResendEmail} 
            disabled={resending || !email} 
            variant="outline" 
            className="w-full"
          >
            {resending ? translations.resending : translations.resendEmail}
          </Button>
        </div>
        <div className="w-full">
          <Link href={`/${locale}/auth/login`} passHref>
            <Button variant="ghost" className="w-full">
              {translations.backToLogin}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
