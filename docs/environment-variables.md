# Environment Variables for Promptaat

This document outlines the environment variables required for the Promptaat application, with a focus on the authentication system.

## Authentication Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | The base URL of your site | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret used to encrypt the NextAuth.js JWT | A random string, e.g., `your-nextauth-secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Obtained from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Obtained from Google Cloud Console |
| `RESEND_API_KEY` | API key for Resend.com email service | Obtained from Resend.com dashboard |
| `NEXT_PUBLIC_APP_URL` | Public URL of your application | `http://localhost:3000` |

## Database Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string for your database | `postgresql://user:password@localhost:5432/promptaat` |

## Setting Up Environment Variables

1. Create a `.env` file in the root directory of your project
2. Add the required variables with their values
3. Restart your development server for the changes to take effect

## Obtaining API Keys

### Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set the application type to "Web application"
6. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env` file

### Resend.com API Key

1. Sign up or log in to [Resend.com](https://resend.com)
2. Navigate to the API Keys section
3. Create a new API key
4. Copy the API key to your `.env` file

## Testing Environment Variables

To verify that your environment variables are correctly set up:

1. Start your development server
2. Try the authentication flow:
   - Register a new user
   - Verify that verification emails are sent
   - Reset a password
   - Sign in with Google

If any part of the authentication flow fails, check the corresponding environment variables.

## Environment Variables in Production

When deploying to production:

1. Set the environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Make sure to update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain
3. Use different Google OAuth credentials for production
4. Consider using a different Resend.com API key for production

## Security Considerations

- Never commit your `.env` file to version control
- Use different API keys for development and production
- Regularly rotate your API keys and secrets
- Limit the permissions of your API keys to only what's necessary
