# CMS Authentication System Documentation

## Overview

The CMS authentication system provides secure access to the content management system (CMS) for administrators. It uses a combination of JWT tokens and HTTP-only cookies for secure authentication.

## Key Components

### 1. Authentication Flow

The authentication flow consists of the following steps:

1. **Login**: Admin submits credentials via the login form
2. **Validation**: Server validates credentials against the database
3. **Token Generation**: Server generates JWT token and refresh token
4. **Cookie Setting**: Tokens are stored in HTTP-only cookies
5. **Session Management**: Server maintains session state via cookies
6. **Logout**: Admin can log out, which clears the authentication cookies

### 2. Development vs. Production

The system behaves differently in development and production environments:

- **Development Mode**: 
  - Automatically uses a mock admin account for easier testing
  - Can be bypassed with the `x-use-real-auth: true` header for testing real authentication
  - Provides detailed logging for debugging

- **Production Mode**:
  - Requires valid credentials for all authentication
  - Uses secure cookies with appropriate security settings
  - Implements proper error handling and logging

### 3. Key Files

- `src/lib/cms/auth/admin-auth.ts`: Core authentication utilities (token generation, validation)
- `src/lib/cms/auth/server-auth.ts`: Server-side authentication helpers
- `src/lib/crypto.ts`: Password hashing and comparison utilities
- `src/app/api/cms/auth/login/route.ts`: Login API endpoint
- `src/app/api/cms/auth/logout/route.ts`: Logout API endpoint

## Security Considerations

1. **Password Hashing**: Passwords are hashed using SHA-256 with a static salt
2. **JWT Tokens**: Short-lived JWT tokens (15 minutes) with refresh tokens (7 days)
3. **HTTP-Only Cookies**: Prevents client-side JavaScript access to tokens
4. **Secure Cookies**: In production, cookies are set with the `secure` flag
5. **CSRF Protection**: Uses `sameSite: strict` for cookies to prevent CSRF attacks

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Check browser console for detailed error messages
   - Verify that cookies are being set correctly
   - Ensure the JWT secret is properly configured

2. **Development Mode Issues**:
   - Use the `x-use-real-auth: true` header to bypass mock authentication
   - Check server logs for detailed error messages
   - Verify that the database is accessible

3. **Production Mode Issues**:
   - Ensure environment variables are properly configured
   - Check server logs for authentication errors
   - Verify database connection and user records

### Testing Authentication

Use the provided test script to verify authentication functionality:

```bash
# Test in development mode (uses mock admin)
node scripts/test-cms-auth.js

# Test in development mode with real authentication
node scripts/test-cms-auth.js --real-auth

# Test against production
node scripts/test-cms-auth.js --production
```

## Environment Variables

The following environment variables are required for proper authentication:

```
# Required for JWT token generation and validation
ADMIN_JWT_SECRET=your-secure-jwt-secret

# Required for NextAuth.js (used for user authentication)
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app-url.com

# Database connection (required for user lookup)
DATABASE_URL=your-database-connection-string
```

## Best Practices

1. **Always use HTTPS** in production environments
2. **Regularly rotate JWT secrets** for enhanced security
3. **Monitor authentication logs** for suspicious activity
4. **Implement rate limiting** to prevent brute force attacks
5. **Use strong password policies** for admin accounts
6. **Keep dependencies updated** to address security vulnerabilities

## Future Improvements

1. Implement two-factor authentication (2FA)
2. Add IP-based access restrictions
3. Enhance audit logging for security events
4. Implement automatic session termination for inactive users
5. Add support for OAuth providers for admin authentication
