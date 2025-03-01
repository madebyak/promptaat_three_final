'use client';

import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '@/lib/auth/password-validation';
import { CheckCircle2, Circle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  locale?: string;
}

export function PasswordStrengthMeter({ password, locale = 'en' }: PasswordStrengthMeterProps) {
  const validation = validatePassword(password);
  const strengthColor = getPasswordStrengthColor(validation.score);
  const strengthText = getPasswordStrengthText(validation.score, locale);
  const isRtl = locale === 'ar';

  const translations = {
    en: {
      requirements: 'Password requirements:',
      minLength: 'At least 8 characters',
      upperCase: 'At least one uppercase letter',
      lowerCase: 'At least one lowercase letter',
      number: 'At least one number',
      specialChar: 'At least one special character',
      strength: 'Password strength:',
    },
    ar: {
      requirements: 'متطلبات كلمة المرور:',
      minLength: '8 أحرف على الأقل',
      upperCase: 'حرف كبير واحد على الأقل',
      lowerCase: 'حرف صغير واحد على الأقل',
      number: 'رقم واحد على الأقل',
      specialChar: 'رمز خاص واحد على الأقل',
      strength: 'قوة كلمة المرور:',
    },
  };

  const t = translations[locale as keyof typeof translations];

  return (
    <div className="space-y-3 text-sm mt-2" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs">
          {t.strength} <span className={`font-medium ${strengthColor}`}>{strengthText}</span>
        </p>
        <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColor.replace('text-', 'bg-')}`}
            style={{ width: `${validation.score}%` }}
            role="progressbar"
            aria-valuenow={validation.score}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium">{t.requirements}</p>
        <ul className="space-y-1">
          <li className={`flex items-center gap-1.5 ${validation.hasMinLength ? 'text-success' : 'text-muted-foreground'}`}>
            {validation.hasMinLength ? 
              <CheckCircle2 size={14} className="text-success" /> : 
              <Circle size={14} className="text-muted-foreground" />
            }
            <span className="text-xs">{t.minLength}</span>
          </li>
          <li className={`flex items-center gap-1.5 ${validation.hasUpperCase ? 'text-success' : 'text-muted-foreground'}`}>
            {validation.hasUpperCase ? 
              <CheckCircle2 size={14} className="text-success" /> : 
              <Circle size={14} className="text-muted-foreground" />
            }
            <span className="text-xs">{t.upperCase}</span>
          </li>
          <li className={`flex items-center gap-1.5 ${validation.hasLowerCase ? 'text-success' : 'text-muted-foreground'}`}>
            {validation.hasLowerCase ? 
              <CheckCircle2 size={14} className="text-success" /> : 
              <Circle size={14} className="text-muted-foreground" />
            }
            <span className="text-xs">{t.lowerCase}</span>
          </li>
          <li className={`flex items-center gap-1.5 ${validation.hasNumber ? 'text-success' : 'text-muted-foreground'}`}>
            {validation.hasNumber ? 
              <CheckCircle2 size={14} className="text-success" /> : 
              <Circle size={14} className="text-muted-foreground" />
            }
            <span className="text-xs">{t.number}</span>
          </li>
          <li className={`flex items-center gap-1.5 ${validation.hasSpecialChar ? 'text-success' : 'text-muted-foreground'}`}>
            {validation.hasSpecialChar ? 
              <CheckCircle2 size={14} className="text-success" /> : 
              <Circle size={14} className="text-muted-foreground" />
            }
            <span className="text-xs">{t.specialChar}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
