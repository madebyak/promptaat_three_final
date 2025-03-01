"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface ResetPasswordFormProps {
  token: string;
  locale?: string;
}

const translations = {
  en: {
    title: 'Create New Password',
    subtitle: 'Please enter your new password.',
    password: 'New Password',
    passwordPlaceholder: 'Enter new password',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    resetButton: 'Reset Password',
    resetting: 'Resetting...',
    passwordMismatch: 'Passwords do not match',
  },
  ar: {
    title: 'إنشاء كلمة مرور جديدة',
    subtitle: 'الرجاء إدخال كلمة المرور الجديدة.',
    password: 'كلمة المرور الجديدة',
    passwordPlaceholder: 'أدخل كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    confirmPasswordPlaceholder: 'تأكيد كلمة المرور',
    resetButton: 'إعادة تعيين كلمة المرور',
    resetting: 'جاري إعادة التعيين...',
    passwordMismatch: 'كلمات المرور غير متطابقة',
  },
};

export function ResetPasswordForm({ token, locale = 'en' }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const t = translations[locale as keyof typeof translations];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      router.push(`/${locale}/auth/login`);
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t.passwordPlaceholder}
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password && <PasswordStrengthMeter password={password} locale={locale} />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t.confirmPasswordPlaceholder}
              required
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                {t.resetting}
              </span>
            ) : (
              t.resetButton
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
