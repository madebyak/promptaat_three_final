'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

interface SettingsPageProps {
  params: Promise<{
    locale: string;
  }>
}

interface Translations {
  title: string;
  subtitle: string;
  accountTab: string;
  notificationsTab: string;
  appearanceTab: string;
  // Account tab
  profileSettings: string;
  nameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  changePassword: string;
  saveChanges: string;
  // Notifications tab
  emailNotifications: string;
  emailNotificationsDescription: string;
  marketingEmails: string;
  marketingEmailsDescription: string;
  // Appearance tab
  themeSettings: string;
  themeSettingsDescription: string;
  loading: string;
}

const translations: Record<string, Translations> = {
  en: {
    title: 'Settings',
    subtitle: 'Manage your account settings and preferences',
    accountTab: 'Account',
    notificationsTab: 'Notifications',
    appearanceTab: 'Appearance',
    profileSettings: 'Profile Settings',
    nameLabel: 'Name',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    changePassword: 'Change Password',
    saveChanges: 'Save Changes',
    emailNotifications: 'Email Notifications',
    emailNotificationsDescription: 'Receive emails about your account activity, security, and prompts',
    marketingEmails: 'Marketing Emails',
    marketingEmailsDescription: 'Receive emails about new features, promotions, and events',
    themeSettings: 'Theme Settings',
    themeSettingsDescription: 'Customize the appearance of the application',
    loading: 'Loading your settings...',
  },
  ar: {
    title: 'الإعدادات',
    subtitle: 'إدارة إعدادات وتفضيلات حسابك',
    accountTab: 'الحساب',
    notificationsTab: 'الإشعارات',
    appearanceTab: 'المظهر',
    profileSettings: 'إعدادات الملف الشخصي',
    nameLabel: 'الاسم',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    changePassword: 'تغيير كلمة المرور',
    saveChanges: 'حفظ التغييرات',
    emailNotifications: 'إشعارات البريد الإلكتروني',
    emailNotificationsDescription: 'تلقي رسائل البريد الإلكتروني حول نشاط حسابك والأمان والنماذج',
    marketingEmails: 'رسائل البريد الإلكتروني التسويقية',
    marketingEmailsDescription: 'تلقي رسائل البريد الإلكتروني حول الميزات الجديدة والعروض الترويجية والأحداث',
    themeSettings: 'إعدادات المظهر',
    themeSettingsDescription: 'تخصيص مظهر التطبيق',
    loading: 'جاري تحميل الإعدادات الخاصة بك...',
  }
};

export default function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = React.use(params);
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect(`/${locale}/auth/login`);
    },
  });
  
  const t = translations[locale] || translations.en;
  const isRtl = locale === 'ar';
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }
  
  const user = session.user || { name: "", email: "" };
  
  return (
    <div className="container py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t.title}</h1>
        <p className="text-muted-foreground mb-8">{t.subtitle}</p>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="account">{t.accountTab}</TabsTrigger>
            <TabsTrigger value="notifications">{t.notificationsTab}</TabsTrigger>
            <TabsTrigger value="appearance">{t.appearanceTab}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>{t.profileSettings}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.nameLabel}</Label>
                  <Input id="name" defaultValue={user?.name || ''} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t.emailLabel}</Label>
                  <Input id="email" defaultValue={user?.email || ''} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">{t.passwordLabel}</Label>
                  <div className="flex items-center gap-4">
                    <Input id="password" type="password" value="••••••••" disabled />
                    <Button variant="outline">{t.changePassword}</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>{t.saveChanges}</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t.emailNotifications}</CardTitle>
                <CardDescription>{t.emailNotificationsDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{t.emailNotifications}</p>
                    <p className="text-sm text-muted-foreground">{t.emailNotificationsDescription}</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{t.marketingEmails}</p>
                    <p className="text-sm text-muted-foreground">{t.marketingEmailsDescription}</p>
                  </div>
                  <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                </div>
              </CardContent>
              <CardFooter>
                <Button>{t.saveChanges}</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>{t.themeSettings}</CardTitle>
                <CardDescription>{t.themeSettingsDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Theme controls would go here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
