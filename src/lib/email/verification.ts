import { Resend } from 'resend';
import { readFileSync } from "fs"
import { join } from "path"

const resend = new Resend(process.env.RESEND_API_KEY);
// Use a more robust way to determine the base URL
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

interface VerificationEmailProps {
  email: string;
  name: string;
  token: string;
}

export async function sendVerificationEmail({ email, name, token }: VerificationEmailProps) {
  console.log(`Attempting to send verification email to ${email} with token ${token.substring(0, 8)}...`);
  console.log(`Using base URL: ${baseUrl}`);
  
  // Updated to include locale in the path
  const verificationLink = `${baseUrl}/en/auth/verify?token=${token}`;
  console.log(`Verification link: ${verificationLink}`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Promptaat <noreply@verify.promptaat.com>',
      to: email,
      subject: 'Verify your email address',
      html: await compileEmailTemplate('verification', { 
        name, 
        verificationLink,
        year: new Date().getFullYear()
      }),
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
  
  // Updated to include locale in the path
  const resetLink = `${baseUrl}/en/auth/reset-password?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Promptaat <noreply@verify.promptaat.com>',
      to: email,
      subject: 'Reset your password',
      html: await compileEmailTemplate('password-reset', { 
        name, 
        resetLink,
        year: new Date().getFullYear()
      }),
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

export async function compileEmailTemplate(templateName: string, data: Record<string, any>) {
  // Dynamic import of Handlebars to avoid webpack issues
  const Handlebars = (await import('handlebars')).default;
  
  try {
    const templatePath = join(process.cwd(), `src/emails/${templateName}.hbs`);
    const templateContent = readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(templateContent);
    
    return template(data);
  } catch (error) {
    console.error(`Error compiling email template ${templateName}:`, error);
    throw new Error(`Failed to compile email template: ${error.message}`);
  }
}
