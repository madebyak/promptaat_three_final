# Promptaat Authentication System Documentation

## Overview

The Promptaat authentication system provides a comprehensive solution for user authentication, including:

- Email/password registration and login
- Email verification
- Password reset functionality
- Google OAuth integration
- Session management

## Environment Variables

The following environment variables are required for the authentication system:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service (Resend.com)
RESEND_API_KEY=your-resend-api-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Authentication Flow

### Registration Flow

1. User submits registration form with email, password, and other required fields
2. System checks if the email already exists
3. If email is new, system creates a user record with a verification token
4. System sends a verification email to the user
5. User clicks the verification link in the email
6. System verifies the token and marks the user's email as verified
7. User can now log in

### Login Flow

1. User submits login form with email and password
2. System validates credentials
3. If valid, system creates a session and redirects to the dashboard
4. If invalid, system shows an error message

### Password Reset Flow

1. User requests a password reset by providing their email
2. System generates a reset token and sends a reset link to the user's email
3. User clicks the reset link and enters a new password
4. System verifies the token and updates the user's password
5. User can now log in with the new password

### Google Authentication Flow

1. User clicks "Sign in with Google" button
2. User is redirected to Google's authentication page
3. User authorizes the application
4. Google redirects back to the application with an authorization code
5. System exchanges the code for an access token and user information
6. System creates or updates the user record and creates a session

## API Endpoints

### `/api/auth/[...nextauth]`

Handles all NextAuth authentication routes, including:
- `/api/auth/signin`
- `/api/auth/callback`
- `/api/auth/signout`
- `/api/auth/session`

### `/api/auth/register`

- **Method**: POST
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "country": "US"
  }
  ```
- **Response**: 
  ```json
  {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "message": "User created successfully. Please verify your email."
  }
  ```

### `/api/auth/verify`

- **Method**: GET
- **Query Parameters**: `token`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Email verified successfully"
  }
  ```

- **Method**: POST (for resending verification email)
- **Body**: 
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Verification email sent"
  }
  ```

### `/api/auth/forgot-password`

- **Method**: POST
- **Body**: 
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "If an account exists with this email, you will receive a password reset link"
  }
  ```

### `/api/auth/reset-password`

- **Method**: GET (for verifying token)
- **Query Parameters**: `token`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Token is valid",
    "email": "user@example.com"
  }
  ```

- **Method**: POST (for resetting password)
- **Body**: 
  ```json
  {
    "token": "reset-token",
    "password": "NewSecurePassword123"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Password has been reset successfully"
  }
  ```

## Database Schema

The authentication system uses the following database schema:

```prisma
model User {
  id                     String    @id @default(uuid())
  firstName              String    @map("first_name")
  lastName               String    @map("last_name")
  email                  String    @unique
  passwordHash           String?   @map("password_hash")
  profileImageUrl        String?   @map("profile_image_url")
  emailVerified          Boolean   @default(false) @map("email_verified")
  googleId               String?   @map("google_id")
  verificationToken      String?   @map("verification_token")
  verificationTokenExpires DateTime? @map("verification_token_expires")
  resetPasswordToken     String?   @map("reset_password_token")
  resetPasswordExpires   DateTime? @map("reset_password_expires")
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")
}
```

## Security Considerations

1. **Password Storage**: Passwords are hashed using bcrypt with a salt of 10 rounds
2. **Token Expiration**: Verification and reset tokens expire after a set period (24 hours for verification, 1 hour for password reset)
3. **Email Verification**: Users must verify their email address before they can fully use the system
4. **CSRF Protection**: NextAuth provides CSRF protection for authentication routes
5. **Session Management**: Sessions are securely managed by NextAuth

## Troubleshooting

### Common Issues

1. **Verification Email Not Received**
   - Check spam folder
   - Verify the email address is correct
   - Check Resend.com dashboard for delivery issues
   - Resend the verification email

2. **Password Reset Link Not Working**
   - Links expire after 1 hour
   - Request a new password reset link

3. **Google Authentication Issues**
   - Ensure Google OAuth credentials are correct
   - Verify the authorized redirect URIs in Google Cloud Console

## Testing

To test the authentication system:

1. Register a new user
2. Check email for verification link
3. Verify email
4. Log in with the new user
5. Log out
6. Request password reset
7. Reset password
8. Log in with the new password
9. Test Google authentication
