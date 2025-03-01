import { Resend } from 'resend';

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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Welcome to Promptaat!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with Promptaat. To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Promptaat. All rights reserved.</p>
          </div>
        </div>
      `,
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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Promptaat. All rights reserved.</p>
          </div>
        </div>
      `,
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
