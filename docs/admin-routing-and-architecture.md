# Promptaat Admin Panel Architecture

This document provides a comprehensive overview of the Promptaat Admin Panel architecture, including routing, authentication, API endpoints, component structure, and database schema.

## 1. Directory Structure

The admin panel follows a modular structure organized by feature:

```
/src
  /app
    /cms                    # Admin panel root
      /auth                 # Authentication pages
        /login              # Login page
      /dashboard            # Dashboard pages
      /categories           # Category management
      /prompts              # Prompt management
      /users                # User management
      /settings             # Admin settings
      /tools                # Tools management
      layout.tsx            # Root layout for all CMS pages
      page.tsx              # CMS root page (redirects to dashboard)
    /api
      /cms                  # Admin API endpoints
        /auth               # Authentication endpoints
        /categories         # Category management endpoints
        /prompts            # Prompt management endpoints
        /users              # User management endpoints
        /settings           # Settings endpoints
        /tools              # Tools endpoints
  /components
    /cms                    # Admin components
      /auth                 # Auth-related components
      /layout               # Layout components (sidebar, header)
      /dashboard            # Dashboard components
      /categories           # Category management components
      /prompts              # Prompt management components
      /users                # User management components
      /settings             # Settings components
  /lib
    /cms                    # Admin utility functions
      /auth                 # Authentication utilities
```

## 2. Authentication System

The admin panel uses a JWT-based authentication system with HTTP-only cookies for secure session management.

### 2.1 Authentication Flow

1. **Login Process**:
   - User submits credentials via the login form
   - Server validates credentials against the database
   - If valid, server generates an access token (15 min expiry) and refresh token (7 days expiry)
   - Tokens are stored in HTTP-only cookies
   - User is redirected to the dashboard

2. **Session Management**:
   - Access token is used for API requests
   - When access token expires, refresh token is used to obtain a new access token
   - If refresh token is invalid or expired, user is redirected to login

3. **Logout Process**:
   - Cookies are cleared
   - Audit log entry is created
   - User is redirected to login page

### 2.2 Authentication Files

- **Server-side Authentication**:
  - `/src/lib/cms/auth/admin-auth.ts`: Core authentication functions
  - `/src/lib/cms/auth/server-auth.ts`: Server-side authentication utilities
  
- **Client-side Authentication**:
  - `/src/lib/cms/auth/client-auth.ts`: Client-side authentication utilities
  
- **Authentication API Endpoints**:
  - `/src/app/api/cms/auth/login/route.ts`: Login endpoint
  - `/src/app/api/cms/auth/logout/route.ts`: Logout endpoint
  - `/src/app/api/cms/auth/refresh/route.ts`: Token refresh endpoint
  - `/src/app/api/cms/auth/me/route.ts`: Get current admin info

## 3. Routing Structure

The admin panel uses Next.js App Router for routing, with nested layouts for different sections.

### 3.1 Layout Hierarchy

```
RootLayout (app/layout.tsx)
└── AdminRootLayout (app/cms/layout.tsx)
    ├── AuthLayout (app/cms/auth/layout.tsx)
    │   └── Login Page (app/cms/auth/login/page.tsx)
    ├── DashboardLayout (app/cms/dashboard/layout.tsx)
    │   └── Dashboard Page (app/cms/dashboard/page.tsx)
    ├── CategoriesLayout (app/cms/categories/layout.tsx)
    │   └── Categories Page (app/cms/categories/page.tsx)
    ├── PromptsLayout (app/cms/prompts/layout.tsx)
    │   └── Prompts Page (app/cms/prompts/page.tsx)
    ├── UsersLayout (app/cms/users/layout.tsx)
    │   └── Users Page (app/cms/users/page.tsx)
    └── SettingsLayout (app/cms/settings/layout.tsx)
        └── Settings Page (app/cms/settings/page.tsx)
```

### 3.2 Route Protection

Routes are protected at multiple levels:

1. **Layout-level Protection**:
   - Each section layout (dashboard, categories, etc.) checks for authentication
   - If not authenticated, redirects to login page

2. **Middleware Protection**:
   - The middleware checks for authentication on protected routes
   - Handles token refresh and redirection

## 4. Component Structure

### 4.1 Layout Components

- **AdminLayout** (`/src/components/cms/layout/admin-layout.tsx`):
  - Main layout component for authenticated admin pages
  - Includes sidebar, header, and main content area
  - Handles responsive design for mobile and desktop

- **SidebarNav** (`/src/components/cms/layout/sidebar-nav.tsx`):
  - Navigation sidebar with links to different admin sections
  - Highlights active section

### 4.2 Feature Components

- **Auth Components**:
  - `LoginForm`: Handles login form submission and validation

- **Dashboard Components**:
  - `Dashboard`: Main dashboard component with metrics and charts

- **Category Management Components**:
  - `CategoriesManagement`: Handles category listing, creation, editing, and deletion

- **Prompt Management Components**:
  - Components for managing prompts

- **User Management Components**:
  - Components for managing users

- **Settings Components**:
  - Components for managing admin settings

## 5. API Endpoints

### 5.1 Authentication Endpoints

- **POST /api/cms/auth/login**:
  - Authenticates admin user
  - Returns admin info and sets auth cookies

- **POST /api/cms/auth/logout**:
  - Logs out admin user
  - Clears auth cookies

- **POST /api/cms/auth/refresh**:
  - Refreshes access token using refresh token
  - Returns new access token

- **GET /api/cms/auth/me**:
  - Returns current admin user info

### 5.2 Resource Endpoints

- **Categories API**:
  - GET/POST/PUT/DELETE endpoints for category management

- **Prompts API**:
  - GET/POST/PUT/DELETE endpoints for prompt management

- **Users API**:
  - GET/POST/PUT/DELETE endpoints for user management

- **Settings API**:
  - GET/PUT endpoints for admin settings

## 6. Database Schema

### 6.1 Admin-related Models

```prisma
// Admin user model
model AdminUser {
  id            String     @id @default(uuid())
  email         String     @unique
  passwordHash  String     @map("password_hash")
  firstName     String     @map("first_name")
  lastName      String     @map("last_name")
  role          String     // "admin" or "super_admin"
  lastLogin     DateTime?  @map("last_login")
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")
  isActive      Boolean    @default(true) @map("is_active")
  auditLogs     AuditLog[]

  @@map("admin_users")
}

// Audit log model for tracking admin actions
model AuditLog {
  id          String    @id @default(uuid())
  adminId     String    @map("admin_id")
  action      String    // "create", "update", "delete"
  entityType  String    @map("entity_type") // "prompt", "category", "tool", "user"
  entityId    String    @map("entity_id")
  details     Json?
  createdAt   DateTime  @default(now()) @map("created_at")
  admin       AdminUser @relation(fields: [adminId], references: [id])

  @@map("audit_logs")
}

// Admin settings model
model AdminSetting {
  id          String    @id @default(uuid())
  key         String    @unique
  value       String
  description String?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("admin_settings")
}
```

## 7. Authentication Implementation Details

### 7.1 Token Generation and Validation

- **Access Token**: JWT with 15-minute expiry
- **Refresh Token**: JWT with 7-day expiry
- Both tokens are stored in HTTP-only cookies

### 7.2 Security Measures

- HTTP-only cookies prevent JavaScript access
- Strict same-site policy to prevent CSRF attacks
- Secure flag in production to ensure HTTPS-only
- Short-lived access tokens to minimize risk
- Password hashing using bcrypt

## 8. UI Components

The admin panel uses a combination of custom components and shadcn/ui components for a consistent design:

- **Layout Components**: AdminLayout, SidebarNav
- **Form Components**: Input, Button, Textarea, Switch, etc.
- **Data Display Components**: Table, Card, Dialog, etc.
- **Feedback Components**: Toast, Spinner, etc.

## 9. State Management

- **Server State**: Managed through server components and API routes
- **Client State**: Managed through React hooks and context
- **Form State**: Managed through react-hook-form with zod validation

## 10. Error Handling

- **API Error Handling**: Consistent error responses with appropriate status codes
- **Client-side Error Handling**: Try-catch blocks with user-friendly error messages
- **Form Validation Errors**: Displayed inline using zod validation

## 11. Audit Logging

All admin actions are logged in the AuditLog table, including:
- Login/logout events
- CRUD operations on entities
- Settings changes

This provides a complete audit trail of all admin activities.

## 12. Codebase Cleanup

As part of the ongoing maintenance of the admin panel, several cleanup tasks were performed:

1. **Removed Unused Files**:
   - `src/middleware-admin.ts` - This file contained admin authentication middleware that wasn't being used. The main middleware in `src/middleware.ts` handles all routing, including for the CMS.
   - Backed up removed files with `.bak` extension for reference.

2. **Fixed Import Inconsistencies**:
   - Standardized imports across API routes to use the correct function names:
     - Changed `getCurrentAdmin` imports from `admin-auth.ts` to import from `server-auth.ts`
     - Changed `db` imports to use the correct export name `prisma` from `lib/db.ts`

3. **Added Missing UI Components**:
   - Created several missing UI components required by the admin interface:
     - `form.tsx`
     - `pagination.tsx` 
     - `checkbox.tsx`
     - `alert-dialog.tsx`

These cleanup tasks ensure better code organization, remove redundancy, and fix import inconsistencies across the codebase.
