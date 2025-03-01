import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface ForgotPasswordFormProps {
  locale?: string;
}

const translations = {
  en: {
    title: 'Reset Your Password',
    subtitle: 'Enter your email address and we will send you a password reset link.',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    resetButton: 'Send Reset Link',
    sending: 'Sending...',
    backToLogin: 'Back to Login',
    successMessage: 'If an account exists with this email, you will receive a password reset link.',
  },
  ar: {
    title: 'إعادة تعيين كلمة المرور',
    subtitle: 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'أدخل بريدك الإلكتروني',
    resetButton: 'إرسال رابط إعادة التعيين',
    sending: 'جاري الإرسال...',
    backToLogin: 'العودة لتسجيل الدخول',
    successMessage: 'إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، ستتلقى رابط إعادة تعيين كلمة المرور.',
  },
};

export function ForgotPasswordForm({ locale = 'en' }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const t = translations[locale as keyof typeof translations];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t.title}</CardTitle>
        <p className="text-center text-neutral-600 dark:text-neutral-400">
          {t.subtitle}
        </p>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="text-center text-success p-4">{t.successMessage}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t.emailPlaceholder}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-error p-2 bg-error/10 rounded-md">
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
                  {t.sending}
                </span>
              ) : (
                t.resetButton
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href={`/${locale}/auth/login`}
          className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          {t.backToLogin}
        </Link>
      </CardFooter>
    </Card>
  );
}
