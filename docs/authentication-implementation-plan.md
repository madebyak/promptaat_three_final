# Authentication Implementation Plan

This document outlines the comprehensive plan for implementing authentication in the Promptaat application, including registration, login, forgot password, and reset password processes with full database integration, utilizing Resend.com for email verification and Google for social authentication.

## Phase 1: Database Schema Updates

- [x] **User Table Updates**:
  - [x] Add `profile_image_url` (String, nullable) - Path to user profile image
  - [x] Add `email_verified` (Boolean, default: false) - Track email verification status
  - [x] Add `google_id` (String, nullable, unique) - Store Google user ID for OAuth
  - [x] Add `verification_token` (String, nullable) - For email verification
  - [x] Add `reset_password_token` (String, nullable) - For password reset
  - [x] Add `reset_password_expires` (DateTime, nullable) - Expiration for reset token
  - [x] Add `last_login_at` (DateTime, nullable) - Track last login time

- [x] **Database Migration Strategy**:
  - [x] Create an additive-only migration to preserve existing data
  - [x] Ensure no destructive changes to existing data

## Phase 2: Authentication Components

### Sign-In System
- [ ] **Email/Password Sign-In**:
  - [ ] Clean, modern form with email/password fields
  - [ ] Remember me option
  - [ ] Server-side validation
  - [ ] Error handling for invalid credentials

- [ ] **Google OAuth Integration**:
  - [ ] Implement Google OAuth using the provided credentials
  - [ ] Handle OAuth callback and user profile retrieval
  - [ ] Create user account if first-time Google login
  - [ ] Display modal for missing information (like country)

### Registration System
- [ ] **Email Registration Form**:
  - [ ] Fields: First Name, Last Name, Email, Password, Country
  - [ ] Password strength meter and requirements
  - [ ] Terms of service agreement
  - [ ] Email verification flow

- [ ] **Email Verification**:
  - [ ] Generate and send OTP via Resend.com
  - [ ] OTP verification page
  - [ ] Expiration and retry mechanisms

### Password Recovery
- [ ] **Forgot Password**:
  - [ ] Email input form
  - [ ] Token generation and storage
  - [ ] Email delivery via Resend.com

- [ ] **Reset Password**:
  - [ ] Token validation
  - [ ] New password and confirmation fields
  - [ ] Password strength requirements
  - [ ] Success confirmation

## Phase 3: API Implementation

- [ ] **Authentication API Routes**:
  - [ ] `POST /api/auth/register` - Create new user account
  - [ ] `POST /api/auth/login` - Authenticate user credentials
  - [ ] `POST /api/auth/google` - Handle Google OAuth
  - [ ] `POST /api/auth/verify-email` - Verify email OTP
  - [ ] `POST /api/auth/forgot-password` - Initiate password reset
  - [ ] `POST /api/auth/reset-password` - Complete password reset

- [ ] **Authentication Middleware**:
  - [ ] JWT generation and validation
  - [ ] Protected route handling
  - [ ] Session management (30-day persistence)

## Phase 4: User Interface Components

- [ ] **Navbar Enhancements**:
  - [ ] Replace Sign In/Sign Up buttons with user profile dropdown when logged in
  - [ ] Dropdown menu with: My Account, My Prompts, Settings, Log Out
  - [ ] User avatar display with fallback to default avatar

- [ ] **Profile Management**:
  - [ ] Profile picture selection:
    - [ ] Upload custom photo (with size/format restrictions)
    - [ ] Choose from preset avatars in `/public/profile_avatars`
    - [ ] Default to `/profile_avatars/default_profile.jpg`

- [ ] **Form Styling**:
  - [ ] Consistent styling across all auth forms following modern UI practices
  - [ ] Match Shadcn components aesthetic
  - [ ] Responsive design for mobile compatibility

## Phase 5: Email Templates and Notifications

- [ ] **Email Templates**:
  - [ ] Welcome email with verification code
  - [ ] Password reset instructions
  - [ ] Account update notifications

- [ ] **Resend.com Integration**:
  - [ ] Configure API for reliable delivery
  - [ ] Track email delivery and open rates

## Implementation Timeline

### Week 1: Core Authentication
- [x] Database schema updates
- [ ] Basic sign-in and registration forms
- [ ] Email verification system
- [ ] JWT implementation

### Week 2: OAuth & Password Recovery
- [ ] Google OAuth integration
- [ ] Forgot/reset password flow
- [ ] Email templates
- [ ] OTP system

### Week 3: User Profile & UI
- [ ] Navbar user menu implementation
- [ ] Profile management
- [ ] Avatar selection/upload
- [ ] Settings page

### Week 4: Testing & Optimization
- [ ] End-to-end testing of auth flows
- [ ] Security audit
- [ ] Performance optimization
- [ ] Bug fixes and polish

## Technical Specifications

### Authentication Flow
- [ ] JWT for session management stored in HTTP-only cookies
- [ ] 30-day session persistence
- [ ] CSRF protection
- [ ] Rate limiting for security
- [ ] XSS protection

### Google OAuth Configuration
- [ ] Client ID: 62885177609-06lqatbcasjq43rmnp3d5uuerac31l0p.apps.googleusercontent.com
- [ ] Client Secret: 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
- [ ] Redirect URI: Configure for production and development environments

### Email Service (Resend.com)
- [ ] API key from .env file
- [ ] Email templates for verification and password reset
- [ ] Error handling for failed deliveries

### Security Considerations
- [ ] Password hashing with bcrypt
- [ ] Secure token generation
- [ ] Prevention of common security vulnerabilities
- [ ] Rate limiting for auth endpoints

## Progress Tracking

As tasks are completed, they will be marked with [x] to track progress. This document will serve as a reference for the implementation process and a record of completed work.
