'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SecuritySettingsProps {
  locale: string;
}

interface Translations {
  securitySettings: string;
  securitySettingsDescription: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  updatePassword: string;
  twoFactorAuth: string;
  twoFactorAuthDescription: string;
  enable: string;
  disable: string;
  loginAlerts: string;
  loginAlertsDescription: string;
  securitySuccess: string;
  securityError: string;
  passwordRequirements: string;
  requirements: {
    length: string;
    uppercase: string;
    lowercase: string;
    number: string;
    special: string;
  };
  passwordsDoNotMatch: string;
}

const translations: Record<string, Translations> = {
  en: {
    securitySettings: 'Security Settings',
    securitySettingsDescription: 'Manage your password and account security',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    updatePassword: 'Update Password',
    twoFactorAuth: 'Two-Factor Authentication',
    twoFactorAuthDescription: 'Add an extra layer of security to your account',
    enable: 'Enable',
    disable: 'Disable',
    loginAlerts: 'Login Alerts',
    loginAlertsDescription: 'Receive alerts when someone logs into your account',
    securitySuccess: 'Your security settings have been updated successfully.',
    securityError: 'There was an error updating your security settings. Please try again.',
    passwordRequirements: 'Password Requirements',
    requirements: {
      length: 'At least 8 characters',
      uppercase: 'At least one uppercase letter',
      lowercase: 'At least one lowercase letter',
      number: 'At least one number',
      special: 'At least one special character',
    },
    passwordsDoNotMatch: 'Passwords do not match',
  },
  ar: {
    securitySettings: 'إعدادات الأمان',
    securitySettingsDescription: 'إدارة كلمة المرور وأمان الحساب',
    changePassword: 'تغيير كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    updatePassword: 'تحديث كلمة المرور',
    twoFactorAuth: 'المصادقة الثنائية',
    twoFactorAuthDescription: 'إضافة طبقة إضافية من الأمان إلى حسابك',
    enable: 'تفعيل',
    disable: 'تعطيل',
    loginAlerts: 'تنبيهات تسجيل الدخول',
    loginAlertsDescription: 'تلقي تنبيهات عند قيام شخص ما بتسجيل الدخول إلى حسابك',
    securitySuccess: 'تم تحديث إعدادات الأمان بنجاح.',
    securityError: 'حدث خطأ أثناء تحديث إعدادات الأمان. يرجى المحاولة مرة أخرى.',
    passwordRequirements: 'متطلبات كلمة المرور',
    requirements: {
      length: 'على الأقل 8 أحرف',
      uppercase: 'حرف كبير واحد على الأقل',
      lowercase: 'حرف صغير واحد على الأقل',
      number: 'رقم واحد على الأقل',
      special: 'رمز خاص واحد على الأقل',
    },
    passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
  }
};

export function SecuritySettings({ locale }: SecuritySettingsProps) {
  const t = translations[locale] || translations.en;
  const isRtl = locale === 'ar';
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [alertStatus, setAlertStatus] = useState<'success' | 'error' | null>(null);
  
  // Password validation
  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };
  
  const passwordValidation = validatePassword(newPassword);
  const allRequirementsMet = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword;
  
  // Handle password update
  const handleUpdatePassword = () => {
    if (!allRequirementsMet || !passwordsMatch || !currentPassword) {
      setAlertStatus('error');
      return;
    }
    
    // This would normally be an API call to update the password
    console.log('Updating password...');
    setAlertStatus('success');
    
    // Reset fields after successful update
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    // Clear success message after a few seconds
    setTimeout(() => {
      setAlertStatus(null);
    }, 3000);
  };
  
  // Handle two-factor authentication toggle
  const handleTwoFactorToggle = (checked: boolean) => {
    // In a real application, this would trigger a setup flow for 2FA
    setTwoFactorEnabled(checked);
    console.log('Two-factor authentication:', checked ? 'enabled' : 'disabled');
  };
  
  // Handle login alerts toggle
  const handleLoginAlertsToggle = (checked: boolean) => {
    setLoginAlertsEnabled(checked);
    console.log('Login alerts:', checked ? 'enabled' : 'disabled');
  };
  
  return (
    <Card dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle>{t.securitySettings}</CardTitle>
        <CardDescription>{t.securitySettingsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Alert for success or error */}
        {alertStatus && (
          <Alert variant={alertStatus === 'success' ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {alertStatus === 'success' ? t.securitySuccess : t.securityError}
            </AlertTitle>
            <AlertDescription>
              {alertStatus === 'error' && t.passwordsDoNotMatch}
            </AlertDescription>
          </Alert>
        )}
      
        {/* Change Password Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">{t.changePassword}</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t.currentPassword}</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">{t.newPassword}</Label>
              <Input 
                id="new-password" 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
              <Input 
                id="confirm-password" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {newPassword && confirmPassword && !passwordsMatch && (
                <p className="text-sm text-destructive mt-1">{t.passwordsDoNotMatch}</p>
              )}
            </div>
            
            {/* Password Requirements */}
            {newPassword && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-2">{t.passwordRequirements}</p>
                <ul className="space-y-1">
                  {Object.entries(passwordValidation).map(([key, valid]) => (
                    <li key={key} className="text-sm flex items-center gap-2">
                      {valid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                      <span className={valid ? 'text-green-500' : 'text-destructive'}>
                        {t.requirements[key as keyof typeof t.requirements]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              className="mt-2" 
              onClick={handleUpdatePassword}
              disabled={!allRequirementsMet || !passwordsMatch || !currentPassword}
            >
              {t.updatePassword}
            </Button>
          </div>
        </div>
        
        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between py-3 border-t">
          <div className="space-y-0.5">
            <h3 className="text-lg font-medium">{t.twoFactorAuth}</h3>
            <p className="text-muted-foreground text-sm">{t.twoFactorAuthDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{twoFactorEnabled ? t.disable : t.enable}</span>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
        </div>
        
        {/* Login Alerts */}
        <div className="flex items-center justify-between py-3 border-t">
          <div className="space-y-0.5">
            <h3 className="text-lg font-medium">{t.loginAlerts}</h3>
            <p className="text-muted-foreground text-sm">{t.loginAlertsDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{loginAlertsEnabled ? t.disable : t.enable}</span>
            <Switch
              checked={loginAlertsEnabled}
              onCheckedChange={handleLoginAlertsToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
