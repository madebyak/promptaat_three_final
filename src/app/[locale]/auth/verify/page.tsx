"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyPage() {
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { toast } = useToast();
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  const translations = {
    verifying: locale === 'ar' ? 'جاري التحقق من البريد الإلكتروني...' : 'Verifying your email...',
    success: locale === 'ar' ? 'تم التحقق من البريد الإلكتروني بنجاح' : 'Email verified successfully',
    error: locale === 'ar' ? 'فشل التحقق من البريد الإلكتروني' : 'Failed to verify email',
    invalidToken: locale === 'ar' ? 'رمز التحقق غير صالح أو منتهي الصلاحية' : 'Invalid or expired verification token',
    goToLogin: locale === 'ar' ? 'الذهاب إلى تسجيل الدخول' : 'Go to Login',
    tryAgain: locale === 'ar' ? 'حاول مرة أخرى' : 'Try Again',
    backToHome: locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home',
  };
  
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage(translations.invalidToken);
        return;
      }
      
      try {
        // Check if we have already processed this token in this session
        const processedToken = sessionStorage.getItem('processed_verification_token');
        if (processedToken === token) {
          // Token already processed, show success
          setVerificationStatus('success');
          
          // Show success toast
          toast({
            title: translations.success,
            description: locale === 'ar' 
              ? 'يمكنك الآن تسجيل الدخول إلى حسابك' 
              : 'You can now log in to your account',
          });
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push(`/${locale}/auth/login`);
          }, 3000);
          
          return;
        }
        
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || translations.error);
        }
        
        // Store the processed token in session storage
        sessionStorage.setItem('processed_verification_token', token);
        
        setVerificationStatus('success');
        
        // Show success toast
        toast({
          title: translations.success,
          description: locale === 'ar' 
            ? 'يمكنك الآن تسجيل الدخول إلى حسابك' 
            : 'You can now log in to your account',
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push(`/${locale}/auth/login`);
        }, 3000);
        
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus('error');
        setErrorMessage(error instanceof Error ? error.message : translations.error);
        
        // Show error toast
        toast({
          title: translations.error,
          description: error instanceof Error ? error.message : translations.error,
          variant: 'destructive',
        });
      }
    };
    
    verifyEmail();
  }, [token, locale, router, toast, translations]);
  
  return (
    <Card className="w-full mx-auto shadow-md border-0">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          {verificationStatus === 'loading' && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
          {verificationStatus === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
          {verificationStatus === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
        </div>
        <CardTitle className="text-2xl">
          {verificationStatus === 'loading' && translations.verifying}
          {verificationStatus === 'success' && translations.success}
          {verificationStatus === 'error' && translations.error}
        </CardTitle>
        {verificationStatus === 'error' && (
          <CardDescription className="text-center text-destructive">
            {errorMessage}
          </CardDescription>
        )}
        {verificationStatus === 'success' && (
          <CardDescription className="text-center">
            {locale === 'ar' 
              ? 'تم تأكيد بريدك الإلكتروني بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول...' 
              : 'Your email has been successfully verified. Redirecting to login page...'}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Additional content can go here */}
      </CardContent>
      <CardFooter className="flex justify-center">
        {verificationStatus === 'success' && (
          <Link href={`/${locale}/auth/login`} passHref>
            <Button>{translations.goToLogin}</Button>
          </Link>
        )}
        {verificationStatus === 'error' && (
          <div className="flex flex-col space-y-2 w-full">
            <Link href={`/${locale}/auth/verification-pending`} passHref>
              <Button variant="outline" className="w-full">{translations.tryAgain}</Button>
            </Link>
            <Link href={`/${locale}`} passHref>
              <Button variant="ghost" className="w-full">{translations.backToHome}</Button>
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
