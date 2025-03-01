import { redirect } from 'next/navigation';

export default function LoginRedirect() {
  // Default to English locale
  redirect('/en/auth/login');
}
