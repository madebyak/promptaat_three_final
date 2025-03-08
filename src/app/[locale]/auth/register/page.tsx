"use client";

import { RegisterForm } from '@/components/auth/register-form';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Country data with flags (emoji)
const countries = [
  { value: 'ae', label: 'United Arab Emirates', labelAr: 'الإمارات العربية المتحدة', flag: '🇦🇪' },
  { value: 'sa', label: 'Saudi Arabia', labelAr: 'المملكة العربية السعودية', flag: '🇸🇦' },
  { value: 'kw', label: 'Kuwait', labelAr: 'الكويت', flag: '🇰🇼' },
  { value: 'bh', label: 'Bahrain', labelAr: 'البحرين', flag: '🇧🇭' },
  { value: 'qa', label: 'Qatar', labelAr: 'قطر', flag: '🇶🇦' },
  { value: 'om', label: 'Oman', labelAr: 'عمان', flag: '🇴🇲' },
  { value: 'eg', label: 'Egypt', labelAr: 'مصر', flag: '🇪🇬' },
  { value: 'jo', label: 'Jordan', labelAr: 'الأردن', flag: '🇯🇴' },
  { value: 'lb', label: 'Lebanon', labelAr: 'لبنان', flag: '🇱🇧' },
  { value: 'iq', label: 'Iraq', labelAr: 'العراق', flag: '🇮🇶' },
  { value: 'ye', label: 'Yemen', labelAr: 'اليمن', flag: '🇾🇪' },
  { value: 'ps', label: 'Palestine', labelAr: 'فلسطين', flag: '🇵🇸' },
  { value: 'sy', label: 'Syria', labelAr: 'سوريا', flag: '🇸🇾' },
  { value: 'sd', label: 'Sudan', labelAr: 'السودان', flag: '🇸🇩' },
  { value: 'ly', label: 'Libya', labelAr: 'ليبيا', flag: '🇱🇾' },
  { value: 'ma', label: 'Morocco', labelAr: 'المغرب', flag: '🇲🇦' },
  { value: 'tn', label: 'Tunisia', labelAr: 'تونس', flag: '🇹🇳' },
  { value: 'dz', label: 'Algeria', labelAr: 'الجزائر', flag: '🇩🇿' },
  { value: 'us', label: 'United States', labelAr: 'الولايات المتحدة', flag: '🇺🇸' },
  { value: 'gb', label: 'United Kingdom', labelAr: 'المملكة المتحدة', flag: '🇬🇧' },
  { value: 'ca', label: 'Canada', labelAr: 'كندا', flag: '🇨🇦' },
  { value: 'au', label: 'Australia', labelAr: 'أستراليا', flag: '🇦🇺' },
  { value: 'fr', label: 'France', labelAr: 'فرنسا', flag: '🇫🇷' },
  { value: 'de', label: 'Germany', labelAr: 'ألمانيا', flag: '🇩🇪' },
  { value: 'it', label: 'Italy', labelAr: 'إيطاليا', flag: '🇮🇹' },
  { value: 'es', label: 'Spain', labelAr: 'إسبانيا', flag: '🇪🇸' },
  { value: 'jp', label: 'Japan', labelAr: 'اليابان', flag: '🇯🇵' },
  { value: 'kr', label: 'South Korea', labelAr: 'كوريا الجنوبية', flag: '🇰🇷' },
  { value: 'cn', label: 'China', labelAr: 'الصين', flag: '🇨🇳' },
  { value: 'in', label: 'India', labelAr: 'الهند', flag: '🇮🇳' },
  { value: 'br', label: 'Brazil', labelAr: 'البرازيل', flag: '🇧🇷' },
  { value: 'mx', label: 'Mexico', labelAr: 'المكسيك', flag: '🇲🇽' },
  { value: 'za', label: 'South Africa', labelAr: 'جنوب أفريقيا', flag: '🇿🇦' },
  { value: 'ng', label: 'Nigeria', labelAr: 'نيجيريا', flag: '🇳🇬' },
  { value: 'ru', label: 'Russia', labelAr: 'روسيا', flag: '🇷🇺' },
  { value: 'tr', label: 'Turkey', labelAr: 'تركيا', flag: '🇹🇷' },
];

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;
  
  return <RegisterForm locale={locale} countries={countries} />;
}
