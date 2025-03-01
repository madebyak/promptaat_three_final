import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, otp: string) {
  const { data, error } = await resend.emails.send({
    from: 'Promptaat <no-reply@promptaat.com>',
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0EA5E9; text-align: center;">Welcome to Promptaat!</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #475569;">
          Please use the following verification code to complete your registration:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0EA5E9;">
            ${otp}
          </div>
        </div>
        <p style="font-size: 14px; color: #64748B; text-align: center;">
          This code will expire in 10 minutes.
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #94A3B8; text-align: center;">
          If you didn't request this verification code, please ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
