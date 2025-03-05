import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { FiMail, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    instructions: 'Enter the 6-digit code we sent to your email',
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
    instructions: 'أدخل الرمز المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني',
  },
};

export function OTPVerification({ email, onSuccess, locale = 'en' }: OTPVerificationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const t = translations[locale as keyof typeof translations];
  const isRtl = locale === 'ar';

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
    <Card className="w-full shadow-md max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="mx-auto bg-primary/10 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-2">
          <FiMail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">{t.title}</CardTitle>
        <CardDescription className="text-center">
          {t.subtitle}{' '}
          <span className="font-medium text-foreground">
            {email}
          </span>
        </CardDescription>
        <p className={`text-sm text-muted-foreground text-center ${isRtl ? 'text-right' : ''}`}>
          {t.instructions}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="space-y-2">
            <Input
              id="otp"
              name="otp"
              type="text"
              placeholder={t.codePlaceholder}
              required
              className="text-center text-2xl tracking-wider h-14"
              maxLength={6}
              pattern="[0-9]{6}"
              disabled={isLoading}
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>
          {error && (
            <Alert variant="destructive" className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            className="w-full h-10"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                {t.verifying}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FiCheckCircle className="h-4 w-4" />
                {t.verifyButton}
              </span>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={handleResendOTP}
          disabled={!canResend || isLoading}
          className="text-sm flex items-center gap-2"
        >
          <FiRefreshCw className={`h-4 w-4 ${!canResend && 'animate-spin'}`} />
          {canResend ? t.resendButton : `${t.resendTimer} ${timer}${t.seconds}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
