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
import { cn } from '@/lib/utils';

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

      // Redirect to verification pending page instead of login
      router.push(`/${locale}/auth/verification-pending?email=${encodeURIComponent(data.email)}`);
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
    <div className="w-full">
      <div className="mb-8">
        <h1 className={cn("text-3xl font-bold", isRtl && "text-right")}>{translations.title}</h1>
        <p className={cn("text-muted-foreground mt-2", isRtl && "text-right")}>{translations.subtitle}</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* First and Last Name - Responsive Grid */}
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-4",
          isRtl && "sm:flex-row-reverse"
        )}>
          <div className="space-y-2">
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

          <div className="space-y-2">
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

        <div className="space-y-2">
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

        <div className="space-y-2">
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

        <div className="space-y-2">
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

        <div className="space-y-2">
          <Label htmlFor="country" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
            {translations.country}
          </Label>
          <SearchableSelect
            value={watch('country')}
            onValueChange={(value) => setValue('country', value, { shouldValidate: true })}
            options={countries}
            placeholder={translations.countryPlaceholder}
            searchPlaceholder={translations.searchCountries}
            isRtl={isRtl}
            disabled={isLoading}
            className="h-12"
            icon={<FiGlobe className="h-5 w-5" />}
          />
          {errors.country && (
            <p className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`}>{errors.country.message}</p>
          )}
        </div>

        <div className={`flex items-center ${isRtl ? 'flex-row-reverse justify-end' : ''} space-x-2 ${isRtl ? 'space-x-reverse' : ''}`}>
          <Checkbox
            id="termsAccepted"
            checked={termsAccepted}
            onCheckedChange={(checked) => setValue('termsAccepted', checked as boolean)}
            disabled={isLoading}
          />
          <Label
            htmlFor="termsAccepted"
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
              isRtl && "text-right"
            )}
          >
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

        <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
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
      
      <div className="mt-8">
        <p className={cn("text-center text-sm text-muted-foreground", isRtl && "text-right")}>
          {translations.haveAccount}{' '}
          <Link href={`/${locale}/auth/login`} className="text-primary font-medium hover:underline">
            {translations.signIn}
          </Link>
        </p>
      </div>
      
      <div className="mt-12 pt-6 border-t border-border">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Link href={`/${locale}/privacy`} className="hover:underline">
            {locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:underline">
            {locale === 'ar' ? 'شروط الخدمة' : 'Terms and Conditions'}
          </Link>
          <Link href={`/${locale}/refund`} className="hover:underline">
            {locale === 'ar' ? 'سياسة الاسترداد' : 'Refund Policy'}
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {new Date().getFullYear()} - {locale === 'ar' ? 'جميع الحقوق محفوظة لبرومبتات' : 'All rights reserved to Promptaat'}
        </p>
      </div>
    </div>
  );
}
