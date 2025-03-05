'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { FiMail, FiLock, FiUser, FiGlobe } from 'react-icons/fi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  country: z.string().min(1, 'Please select a country'),
  termsAccepted: z.boolean().refine((val) => val, {
    message: 'You must accept the terms and privacy policy',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof schema>;

export interface RegisterFormProps {
  countries?: { value: string; label: string; flag?: string }[];
  locale?: string;
}

export function RegisterForm({ countries = [], locale = 'en' }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isRtl = locale === 'ar';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      termsAccepted: false,
    },
  });

  const termsAccepted = watch('termsAccepted');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      toast({
        title: 'Success',
        description: 'Registration successful! Please check your email to verify your account.',
      });

      router.push(`/${locale}/auth/login`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Registration failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    title: locale === 'ar' ? 'إنشاء حساب جديد' : 'Create an Account',
    subtitle: locale === 'ar' ? 'أدخل بياناتك لإنشاء حساب جديد' : 'Enter your details to create a new account',
    firstName: locale === 'ar' ? 'الاسم الأول' : 'First Name',
    firstNamePlaceholder: locale === 'ar' ? 'أدخل اسمك الأول' : 'Enter your first name',
    lastName: locale === 'ar' ? 'اسم العائلة' : 'Last Name',
    lastNamePlaceholder: locale === 'ar' ? 'أدخل اسم عائلتك' : 'Enter your last name',
    email: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
    emailPlaceholder: locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
    password: locale === 'ar' ? 'كلمة المرور' : 'Password',
    passwordPlaceholder: locale === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password',
    confirmPassword: locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password',
    confirmPasswordPlaceholder: locale === 'ar' ? 'أكد كلمة المرور' : 'Confirm your password',
    country: locale === 'ar' ? 'الدولة' : 'Country',
    countryPlaceholder: locale === 'ar' ? 'اختر دولة' : 'Select a country',
    searchCountries: locale === 'ar' ? 'البحث عن الدول...' : 'Search countries...',
    termsText: locale === 'ar' 
      ? 'أوافق على' 
      : 'I agree to the',
    termsLink: locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Service',
    andText: locale === 'ar' ? 'و' : 'and',
    privacyLink: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
    register: locale === 'ar' ? 'تسجيل' : 'Register',
    registering: locale === 'ar' ? 'جاري التسجيل...' : 'Registering...',
    haveAccount: locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?',
    signIn: locale === 'ar' ? 'تسجيل الدخول' : 'Sign in',
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md border-0">
      <CardHeader className="space-y-2 pb-8">
        <CardTitle className="text-2xl font-bold text-center">{translations.title}</CardTitle>
        <CardDescription className="text-center text-base">{translations.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="firstName" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
                {translations.firstName}
              </Label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
                  <FiUser className="h-5 w-5" />
                </div>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  type="text"
                  placeholder={translations.firstNamePlaceholder}
                  disabled={isLoading}
                  className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 text-base`}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
              {errors.firstName && (
                <p className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`}>{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="lastName" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
                {translations.lastName}
              </Label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
                  <FiUser className="h-5 w-5" />
                </div>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  type="text"
                  placeholder={translations.lastNamePlaceholder}
                  disabled={isLoading}
                  className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 text-base`}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
              {errors.lastName && (
                <p className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`}>{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="email" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
              {translations.email}
            </Label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
                <FiMail className="h-5 w-5" />
              </div>
              <Input
                id="email"
                {...register('email')}
                type="email"
                placeholder={translations.emailPlaceholder}
                disabled={isLoading}
                className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 text-base`}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
            {errors.email && (
              <p className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`}>{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="password" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
              {translations.password}
            </Label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
                <FiLock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                {...register('password')}
                type="password"
                placeholder={translations.passwordPlaceholder}
                disabled={isLoading}
                className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 text-base`}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
            {errors.password && (
              <p className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`}>{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="confirmPassword" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
              {translations.confirmPassword}
            </Label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
                <FiLock className="h-5 w-5" />
              </div>
              <Input
                id="confirmPassword"
                {...register('confirmPassword')}
                type="password"
                placeholder={translations.confirmPasswordPlaceholder}
                disabled={isLoading}
                className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 text-base`}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
            {errors.confirmPassword && (
              <p className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="country" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
              {translations.country}
            </Label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground z-10`}>
                <FiGlobe className="h-5 w-5" />
              </div>
              <div className={`${isRtl ? 'pr-10' : 'pl-10'}`}>
                <SearchableSelect
                  value={watch('country')}
                  onValueChange={(value) => setValue('country', value)}
                  options={countries}
                  placeholder={translations.countryPlaceholder}
                  searchPlaceholder={translations.searchCountries}
                  isRtl={isRtl}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
            </div>
            {errors.country && (
              <p className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`}>{errors.country.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              id="termsAccepted"
              checked={termsAccepted}
              onCheckedChange={(checked: boolean) => setValue('termsAccepted', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="termsAccepted" className="text-sm">
              {translations.termsText}{' '}
              <Link href={`/${locale}/terms`} className="text-primary hover:underline">
                {translations.termsLink}
              </Link>{' '}
              {translations.andText}{' '}
              <Link href={`/${locale}/privacy`} className="text-primary hover:underline">
                {translations.privacyLink}
              </Link>
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-destructive mt-1">{errors.termsAccepted.message}</p>
          )}

          <Button type="submit" className="w-full h-12 text-base mt-4" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                {translations.registering}
              </span>
            ) : (
              translations.register
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-4 pb-8">
        <div className="text-center text-sm">
          <span className="text-muted-foreground">{translations.haveAccount}</span>{' '}
          <Link href={`/${locale}/auth/login`} className="text-primary font-medium hover:underline">
            {translations.signIn}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
