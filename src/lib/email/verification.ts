import { Resend } from 'resend';
import { verificationTemplate, passwordResetTemplate } from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);
// Determine the base URL based on environment
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'));

// In production, this should be set to the actual domain (e.g., https://promptaat.com)
// Make sure NEXT_PUBLIC_APP_URL is set in the production environment variables

interface VerificationEmailProps {
  email: string;
  name: string;
  token: string;
}

export async function sendVerificationEmail({ email, name, token }: VerificationEmailProps) {
  console.log(`Attempting to send verification email to ${email} with token ${token.substring(0, 8)}...`);
  console.log(`Using base URL: ${baseUrl}`);
  
  // Use the provided locale or default to English
  const locale = process.env.DEFAULT_LOCALE || 'en';
  const verificationLink = `${baseUrl}/${locale}/auth/verify?token=${token}`;
  console.log(`Verification link: ${verificationLink}`);

  try {
    // Replace template variables
    const html = verificationTemplate
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{verificationLink\}\}/g, verificationLink)
      .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

    const { data, error } = await resend.emails.send({
      from: 'Promptaat <noreply@verify.promptaat.com>',
      to: email,
      subject: 'Verify your email address',
      html,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      console.error('Error details:', JSON.stringify(error));
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    console.log(`Verification email sent successfully to ${email}. Email ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error('Exception while sending verification email:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

interface PasswordResetEmailProps {
  email: string;
  name: string;
  token: string;
}

export async function sendPasswordResetEmail({ email, name, token }: PasswordResetEmailProps) {
  console.log(`Sending password reset email to ${email}`);
  
  // Use the provided locale or default to English
  const locale = process.env.DEFAULT_LOCALE || 'en';
  const resetLink = `${baseUrl}/${locale}/auth/reset-password?token=${token}`;
  
  try {
    // Replace template variables
    const html = passwordResetTemplate
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{resetLink\}\}/g, resetLink)
      .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

    const { data, error } = await resend.emails.send({
      from: 'Promptaat <noreply@verify.promptaat.com>',
      to: email,
      subject: 'Reset your password',
      html,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      console.error('Error details:', JSON.stringify(error));
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }

    console.log(`Password reset email sent successfully to ${email}. Email ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error('Exception while sending password reset email:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}
