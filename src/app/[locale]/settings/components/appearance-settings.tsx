'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface AppearanceSettingsProps {
  locale: string;
}

interface Translations {
  themeSettings: string;
  themeSettingsDescription: string;
  themeMode: string;
  light: string;
  dark: string;
  system: string;
  fontSize: string;
  fontSizeSmall: string;
  fontSizeMedium: string;
  fontSizeLarge: string;
  saveChanges: string;
  resetDefaults: string;
}

const translations: Record<string, Translations> = {
  en: {
    themeSettings: 'Theme Settings',
    themeSettingsDescription: 'Customize the appearance of the application',
    themeMode: 'Theme Mode',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    fontSize: 'Font Size',
    fontSizeSmall: 'Small',
    fontSizeMedium: 'Medium',
    fontSizeLarge: 'Large',
    saveChanges: 'Save Changes',
    resetDefaults: 'Reset to Defaults',
  },
  ar: {
    themeSettings: 'إعدادات المظهر',
    themeSettingsDescription: 'تخصيص مظهر التطبيق',
    themeMode: 'وضع السمة',
    light: 'فاتح',
    dark: 'داكن',
    system: 'النظام',
    fontSize: 'حجم الخط',
    fontSizeSmall: 'صغير',
    fontSizeMedium: 'متوسط',
    fontSizeLarge: 'كبير',
    saveChanges: 'حفظ التغييرات',
    resetDefaults: 'إعادة تعيين إلى الإعدادات الافتراضية',
  }
};

export function AppearanceSettings({ locale }: AppearanceSettingsProps) {
  const { theme, setTheme } = useTheme();
  const t = translations[locale] || translations.en;
  const [fontSize, setFontSize] = useState('medium');
  const isRtl = locale === 'ar';
  
  // Function to apply font size changes to HTML document
  const applyFontSize = (size: string) => {
    const root = document.documentElement;
    
    switch (size) {
      case 'small':
        root.style.setProperty('--font-size-multiplier', '0.9');
        break;
      case 'medium':
        root.style.setProperty('--font-size-multiplier', '1');
        break;
      case 'large':
        root.style.setProperty('--font-size-multiplier', '1.1');
        break;
      default:
        root.style.setProperty('--font-size-multiplier', '1');
    }
  };
  
  // Initialize font size from localStorage if available
  useEffect(() => {
    const savedFontSize = localStorage.getItem('promptaat-font-size');
    if (savedFontSize) {
      setFontSize(savedFontSize);
      applyFontSize(savedFontSize);
    }
  }, []);
  
  // Handle font size change
  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    localStorage.setItem('promptaat-font-size', value);
    applyFontSize(value);
  };
  
  // Handle save changes
  const saveChanges = () => {
    // Theme changes are immediately applied by the theme provider
    // Font size changes are already applied and saved to localStorage
    
    // This function could handle API calls to save preferences to user profile
    console.log('Saving appearance settings:', { theme, fontSize });
  };
  
  // Reset to defaults
  const resetDefaults = () => {
    setTheme('system');
    setFontSize('medium');
    localStorage.setItem('promptaat-font-size', 'medium');
    applyFontSize('medium');
  };
  
  return (
    <Card dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle>{t.themeSettings}</CardTitle>
        <CardDescription>{t.themeSettingsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>{t.themeMode}</Label>
          <RadioGroup 
            value={theme} 
            onValueChange={setTheme}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="font-normal">{t.light}</Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="font-normal">{t.dark}</Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system" className="font-normal">{t.system}</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-4">
          <Label>{t.fontSize}</Label>
          <Select value={fontSize} onValueChange={handleFontSizeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t.fontSizeMedium} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">{t.fontSizeSmall}</SelectItem>
              <SelectItem value="medium">{t.fontSizeMedium}</SelectItem>
              <SelectItem value="large">{t.fontSizeLarge}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetDefaults}>{t.resetDefaults}</Button>
        <Button onClick={saveChanges}>{t.saveChanges}</Button>
      </CardFooter>
    </Card>
  );
}
