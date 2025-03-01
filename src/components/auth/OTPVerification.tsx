import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface OTPVerificationProps {
  email: string;
  onSuccess?: () => void;
  locale?: string;
}

const translations = {
  en: {
    title: 'Verify Your Email',
    subtitle: "We've sent a verification code to",
    verifyButton: 'Verify Email',
    verifying: 'Verifying...',
    resendButton: 'Resend Code',
    resendTimer: 'Resend code in',
    seconds: 's',
    codePlaceholder: 'Enter verification code',
  },
  ar: {
    title: 'تأكيد بريدك الإلكتروني',
    subtitle: 'لقد أرسلنا رمز التحقق إلى',
    verifyButton: 'تأكيد البريد',
    verifying: 'جاري التحقق...',
    resendButton: 'إعادة إرسال الرمز',
    resendTimer: 'إعادة إرسال الرمز خلال',
    seconds: 'ث',
    codePlaceholder: 'أدخل رمز التحقق',
  },
};

export function OTPVerification({ email, onSuccess, locale = 'en' }: OTPVerificationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const t = translations[locale as keyof typeof translations];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const otp = formData.get('otp') as string;

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{t.title}</CardTitle>
        <p className="text-center text-neutral-600 dark:text-neutral-400">
          {t.subtitle}{' '}
          <span className="font-medium text-neutral-900 dark:text-neutral-200">
            {email}
          </span>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="otp"
              name="otp"
              type="text"
              placeholder={t.codePlaceholder}
              required
              className="text-center text-2xl tracking-wider"
              maxLength={6}
              pattern="[0-9]{6}"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="text-sm text-error p-2 bg-error/10 rounded-md text-center">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                {t.verifying}
              </span>
            ) : (
              t.verifyButton
            )}
          </Button>
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={!canResend || isLoading}
              className="text-sm"
            >
              {canResend ? t.resendButton : `${t.resendTimer} ${timer}${t.seconds}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
