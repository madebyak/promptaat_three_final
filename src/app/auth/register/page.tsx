import { redirect } from 'next/navigation';

export default function RegisterRedirect() {
  // Default to English locale
  redirect('/en/auth/register');
}
