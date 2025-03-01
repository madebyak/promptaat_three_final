# Authentication System Test Plan

This document outlines a comprehensive test plan for the Promptaat authentication system. It covers all aspects of the authentication flow, including registration, login, email verification, password reset, and Google authentication.

## 1. Prerequisites

Before running the tests, ensure the following:

- Development environment is set up correctly
- Required environment variables are configured
- Database is accessible
- Email service (Resend.com) is configured

## 2. Test Environment Setup

### 2.1 Environment Variables

Ensure the following environment variables are set:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`

### 2.2 Test User Accounts

Create the following test user accounts:

1. **Standard User**: A user with a verified email
2. **Unverified User**: A user with an unverified email
3. **Google User**: A user who registered with Google

## 3. Test Cases

### 3.1 Registration Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| R1 | Successful Registration | 1. Navigate to registration page<br>2. Fill in valid user information<br>3. Submit the form | User is created in the database<br>Verification email is sent<br>Success message is displayed |
| R2 | Registration with Existing Email | 1. Navigate to registration page<br>2. Fill in user information with an email that already exists<br>3. Submit the form | Error message indicating email already exists<br>User is not created |
| R3 | Registration with Invalid Password | 1. Navigate to registration page<br>2. Fill in user information with a weak password<br>3. Submit the form | Error message indicating password requirements<br>User is not created |
| R4 | Registration with Google | 1. Navigate to registration page<br>2. Click "Sign in with Google"<br>3. Complete Google authentication | User is created in the database<br>User is logged in<br>User is redirected to dashboard |

### 3.2 Email Verification Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| V1 | Successful Email Verification | 1. Register a new user<br>2. Click the verification link in the email | Email is marked as verified in the database<br>Success message is displayed |
| V2 | Verification with Invalid Token | 1. Navigate to verification page with an invalid token | Error message indicating invalid token<br>Email is not verified |
| V3 | Verification with Expired Token | 1. Navigate to verification page with an expired token | Error message indicating expired token<br>Email is not verified |
| V4 | Resend Verification Email | 1. Navigate to verification page<br>2. Enter email address<br>3. Click "Resend Verification Email" | New verification email is sent<br>Success message is displayed |

### 3.3 Login Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| L1 | Successful Login | 1. Navigate to login page<br>2. Enter valid credentials<br>3. Submit the form | User is logged in<br>User is redirected to dashboard |
| L2 | Login with Incorrect Password | 1. Navigate to login page<br>2. Enter valid email but incorrect password<br>3. Submit the form | Error message indicating invalid credentials<br>User is not logged in |
| L3 | Login with Non-existent Email | 1. Navigate to login page<br>2. Enter non-existent email<br>3. Submit the form | Error message indicating invalid credentials<br>User is not logged in |
| L4 | Login with Unverified Email | 1. Navigate to login page<br>2. Enter credentials for an unverified user<br>3. Submit the form | Error message indicating email not verified<br>User is not logged in |
| L5 | Login with Google | 1. Navigate to login page<br>2. Click "Sign in with Google"<br>3. Complete Google authentication | User is logged in<br>User is redirected to dashboard |

### 3.4 Password Reset Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| P1 | Request Password Reset | 1. Navigate to login page<br>2. Click "Forgot Password"<br>3. Enter valid email<br>4. Submit the form | Reset email is sent<br>Success message is displayed |
| P2 | Request Reset for Non-existent Email | 1. Navigate to login page<br>2. Click "Forgot Password"<br>3. Enter non-existent email<br>4. Submit the form | Success message is displayed (for security)<br>No email is sent |
| P3 | Reset Password with Valid Token | 1. Click reset link in email<br>2. Enter new password<br>3. Submit the form | Password is updated in the database<br>Success message is displayed<br>User can log in with new password |
| P4 | Reset Password with Invalid Token | 1. Navigate to reset page with invalid token<br>2. Enter new password<br>3. Submit the form | Error message indicating invalid token<br>Password is not updated |
| P5 | Reset Password with Expired Token | 1. Navigate to reset page with expired token<br>2. Enter new password<br>3. Submit the form | Error message indicating expired token<br>Password is not updated |
| P6 | Reset Password with Weak Password | 1. Click reset link in email<br>2. Enter weak password<br>3. Submit the form | Error message indicating password requirements<br>Password is not updated |

### 3.5 Session Management Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| S1 | Session Persistence | 1. Log in<br>2. Close browser<br>3. Reopen browser and navigate to dashboard | User is still logged in<br>Dashboard is accessible |
| S2 | Logout | 1. Log in<br>2. Click logout<br>3. Try to access dashboard | User is logged out<br>Dashboard is not accessible<br>User is redirected to login page |
| S3 | Access Protected Route When Not Logged In | 1. Log out<br>2. Try to access dashboard | User is redirected to login page |

### 3.6 Google Authentication Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| G1 | Login with Google (New User) | 1. Navigate to login page<br>2. Click "Sign in with Google"<br>3. Complete Google authentication with a new email | New user is created in the database<br>User is logged in<br>User is redirected to dashboard |
| G2 | Login with Google (Existing User) | 1. Navigate to login page<br>2. Click "Sign in with Google"<br>3. Complete Google authentication with an existing email | User is logged in<br>User is redirected to dashboard |
| G3 | Link Google Account to Existing User | 1. Log in with email/password<br>2. Navigate to profile settings<br>3. Click "Link Google Account"<br>4. Complete Google authentication | Google account is linked to existing user<br>Success message is displayed |

## 4. Email Template Tests

### 4.1 Verification Email

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| E1 | Verification Email Rendering | Email renders correctly in different email clients |
| E2 | Verification Link Functionality | Clicking the link navigates to the verification page with the correct token |
| E3 | Verification Email Content | Email contains the user's name and clear instructions |

### 4.2 Password Reset Email

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| E4 | Reset Email Rendering | Email renders correctly in different email clients |
| E5 | Reset Link Functionality | Clicking the link navigates to the reset page with the correct token |
| E6 | Reset Email Content | Email contains the user's name and clear instructions |

## 5. Error Handling Tests

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| EH1 | Server Error During Registration | Appropriate error message is displayed |
| EH2 | Server Error During Login | Appropriate error message is displayed |
| EH3 | Server Error During Password Reset | Appropriate error message is displayed |
| EH4 | Network Error During Google Authentication | Appropriate error message is displayed |

## 6. Security Tests

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| SEC1 | Password Storage | Passwords are hashed in the database |
| SEC2 | Token Expiration | Verification and reset tokens expire after the specified time |
| SEC3 | CSRF Protection | CSRF attacks are prevented |
| SEC4 | Rate Limiting | Multiple failed login attempts are rate-limited |

## 7. Test Execution

### 7.1 Manual Testing

Execute the test cases manually, following the steps outlined in each test case. Document the results, including any issues encountered.

### 7.2 Automated Testing

Use the provided test scripts to automate some of the tests:

- `scripts/test-auth-flow.js`: Tests the authentication flow
- `scripts/test-email-templates.js`: Tests the email templates

## 8. Test Reporting

Document the results of the tests in a test report, including:

- Test case ID
- Pass/Fail status
- Issues encountered
- Screenshots (if applicable)
- Recommendations for improvements

## 9. Acceptance Criteria

The authentication system is considered acceptable if:

1. All test cases pass
2. Email templates render correctly in major email clients
3. The system handles errors gracefully
4. Security measures are properly implemented

## 10. Post-Testing Activities

After completing the tests:

1. Fix any issues identified during testing
2. Update documentation as needed
3. Conduct a final review of the authentication system
4. Prepare for deployment to production
