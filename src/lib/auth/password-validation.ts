import { z } from 'zod';

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  score: number; // 0-100
}

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export function validatePassword(password: string): PasswordValidationResult {
  const result = passwordSchema.safeParse(password);
  
  if (!result.success) {
    return {
      isValid: false,
      hasMinLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
      score: 0,
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Calculate score (20 points for each criteria)
  const score = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  ].reduce((acc, curr) => acc + (curr ? 20 : 0), 0);

  const isValid = score >= 80; // At least 4 out of 5 criteria must be met

  return {
    isValid,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
    score,
  };
}

export function getPasswordStrengthColor(score: number): string {
  if (score < 40) return 'text-error';
  if (score < 60) return 'text-warning';
  if (score < 80) return 'text-yellow-500';
  return 'text-success';
}

export function getPasswordStrengthText(score: number, locale: string = 'en'): string {
  const translations = {
    en: {
      veryWeak: 'Very Weak',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      veryStrong: 'Very Strong',
    },
    ar: {
      veryWeak: 'ضعيفة جداً',
      weak: 'ضعيفة',
      medium: 'متوسطة',
      strong: 'قوية',
      veryStrong: 'قوية جداً',
    },
  };

  const t = translations[locale as keyof typeof translations];

  if (score < 40) return t.veryWeak;
  if (score < 60) return t.weak;
  if (score < 80) return t.medium;
  if (score < 100) return t.strong;
  return t.veryStrong;
}

// Compare password function for authentication
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // In a real implementation, you would use bcrypt or a similar library
    // For now, we'll use a simple comparison (this is just a placeholder)
    // This should be replaced with proper password comparison logic
    return password === hashedPassword;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}
