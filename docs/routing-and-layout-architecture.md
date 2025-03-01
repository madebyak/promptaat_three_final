# Promptaat Routing and Layout Architecture

This document provides a comprehensive overview of the routing and layout architecture in the Promptaat application. It details the changes made during the debugging process and serves as a guide for understanding how the routing, layouts, and internationalization work together.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Routing Architecture](#routing-architecture)
3. [Layout System](#layout-system)
4. [Authentication Flow](#authentication-flow)
5. [Internationalization (i18n)](#internationalization-i18n)
6. [Theme and Direction Management](#theme-and-direction-management)
7. [Debugging Process and Solutions](#debugging-process-and-solutions)
8. [Best Practices](#best-practices)

## Project Structure

The Promptaat application follows the Next.js App Router structure, with a focus on internationalization and authentication:

```
src/
├── app/
│   ├── [locale]/           # Locale-specific routes
│   │   ├── auth/           # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── ...
│   │   ├── layout.tsx      # Layout for locale routes
│   │   └── ...
│   ├── api/                # API routes
│   ├── auth/               # Redirect routes for auth
│   ├── layout.tsx          # Root layout
│   └── ...
├── components/
│   ├── auth/               # Auth-related components
│   ├── layout/             # Layout components
│   └── ...
├── hooks/                  # Custom hooks
├── lib/                    # Utility functions
├── providers/              # Context providers
└── ...
```

## Routing Architecture

### Next.js App Router

The application uses Next.js App Router, which provides file-system based routing. Each folder represents a route segment, and the `page.tsx` file within a folder defines the UI for that route.

### Locale-Based Routing

The application uses a `[locale]` dynamic segment to handle internationalization. This allows for routes like `/en/auth/login` or `/ar/auth/login`.

### Authentication Routes

Authentication routes are nested under the `[locale]/auth/` path, with separate folders for login, register, and other auth-related pages.

### Redirect Routes

To maintain backward compatibility and ensure users always access the correct localized version, redirect routes are set up in the `/auth/` path that automatically redirect to the localized versions (e.g., `/auth/login` redirects to `/en/auth/login`).

## Layout System

### Layout Hierarchy

The application uses a nested layout system:

1. **Root Layout** (`/src/app/layout.tsx`): Provides global styles and the base HTML structure.
2. **Locale Layout** (`/src/app/[locale]/layout.tsx`): Conditionally renders the navbar and sidebar based on the route.
3. **Auth Layout** (`/src/app/[locale]/auth/layout.tsx`): Provides a specialized layout for authentication pages.

### Conditional Rendering

The locale layout uses conditional rendering to determine whether to show the navbar and sidebar:

```tsx
// In /src/app/[locale]/layout.tsx
const pathname = usePathname();
const isAuthRoute = pathname?.includes(`/${locale}/auth/`);

// Only render navbar and sidebar for non-auth routes
{!isAuthRoute && (
  <>
    <Navbar locale={locale} />
    <div className="flex min-h-[calc(100vh-64px)]">
      <AppSidebar locale={locale} />
      <main>
        {children}
      </main>
    </div>
  </>
)}
{isAuthRoute && children}
```

This ensures that auth pages don't inherit the main application's navbar and sidebar.

## Authentication Flow

### Middleware

The middleware (`/src/middleware.ts`) handles authentication checks and redirects:

1. It first checks if the route has a locale, and redirects to the localized version if not.
2. It then checks if the user is authenticated (via a token).
3. For authenticated users trying to access auth pages, it redirects to the dashboard.
4. For unauthenticated users trying to access protected pages, it redirects to the login page.

### Protected Routes

Protected routes are defined in the middleware:

```typescript
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/settings',
];
```

These routes require authentication, and unauthenticated users will be redirected to the login page.

### Auth Routes

Auth routes are also defined in the middleware:

```typescript
const authPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/verify',
];
```

These routes are only accessible to unauthenticated users. Authenticated users will be redirected to the dashboard.

## Internationalization (i18n)

### Locale Detection

The application uses the `[locale]` dynamic segment to handle internationalization. The middleware ensures that all routes have a locale prefix, redirecting to the default locale if none is provided.

### Direction Support

The application supports both LTR (left-to-right) and RTL (right-to-left) text directions:

- The direction is determined by the locale (e.g., 'ar' for Arabic uses RTL).
- The `ThemeProvider` sets the direction on the HTML element.
- Layout components use conditional classes based on the direction.

### Translation Management

Translations are managed through component-level translation objects:

```typescript
const translations: Record<string, Translations> = {
  en: {
    title: 'Sign In',
    // ...
  },
  ar: {
    title: 'تسجيل الدخول',
    // ...
  },
};
```

## Theme and Direction Management

### Theme Store

The application uses Zustand for state management, with a dedicated store for theme and direction:

```typescript
// In /src/hooks/use-theme-store.ts
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      direction: 'ltr',
      setTheme: (theme) => set({ theme }),
      setDirection: (direction) => set({ direction }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
```

### Theme Provider

The `ThemeProvider` component applies the theme and direction to the HTML element:

```typescript
// In /src/components/providers/theme-provider.tsx
useEffect(() => {
  const root = window.document.documentElement;
  
  // Apply theme
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  
  // Apply direction
  root.dir = direction;
}, [theme, direction]);
```

## Debugging Process and Solutions

### Issue: Navbar and Sidebar Appearing on Login Page

**Problem**: The navbar and sidebar were appearing on the login page, which should have a simplified layout.

**Cause**: The locale layout was unconditionally rendering the navbar and sidebar for all routes, including auth routes.

**Solution**: Updated the locale layout to conditionally render the navbar and sidebar based on the route:

```tsx
// In /src/app/[locale]/layout.tsx
const isAuthRoute = pathname?.includes(`/${locale}/auth/`);

// Only render navbar and sidebar for non-auth routes
{!isAuthRoute && (
  // Navbar and sidebar
)}
{isAuthRoute && children}
```

### Issue: Duplicate Route Structures

**Problem**: The application had duplicate routes for auth pages in both `/auth/` and `/[locale]/auth/`.

**Solution**: Converted the routes in `/auth/` to redirect to the localized versions:

```tsx
// In /src/app/auth/login/page.tsx
export default function LoginRedirect() {
  // Default to English locale
  redirect('/en/auth/login');
}
```

### Issue: Incomplete Next.js Configuration

**Problem**: The Next.js configuration was minimal and didn't include necessary settings.

**Solution**: Updated the configuration to include proper settings for internationalization, image domains, and other features:

```typescript
// In /next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    appDir: true,
  },
};
```

### Issue: Middleware Authentication Logic

**Problem**: The middleware wasn't properly handling locale detection and redirects.

**Solution**: Enhanced the middleware to check for locales and redirect appropriately:

```typescript
// In /src/middleware.ts
const pathnameHasLocale = locales.some(
  locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
);

if (!pathnameHasLocale) {
  const url = new URL(`/${locale}${pathname}`, request.url);
  url.search = request.nextUrl.search;
  return NextResponse.redirect(url);
}
```

### Issue: Theme Provider Direction Handling

**Problem**: The theme provider wasn't properly handling direction changes.

**Solution**: Updated the theme provider to include direction management:

```typescript
// In /src/components/providers/theme-provider.tsx
useEffect(() => {
  if (defaultDirection && defaultDirection !== direction) {
    setDirection(defaultDirection);
  }
}, [defaultDirection, direction, setDirection]);
```

### Issue: Middleware Affected Static Assets

**Problem**: The middleware was redirecting all requests including static assets to locale-prefixed paths, causing the assets to be unavailable.

**Cause**: The matcher pattern in the middleware configuration was only excluding specific Next.js paths but not static assets with file extensions.

**Solution**: Updated the middleware matcher pattern to explicitly exclude file extensions:

```typescript
// In /src/middleware.ts
export const config = {
  matcher: [
    '/((?!api|_next|.*\\.).*)$',
  ],
}
```

This pattern excludes:
- API routes (/api/*)
- Next.js internals (_next/*)
- Static files with extensions (*.svg, *.jpg, etc.)

## Best Practices

### Routing

1. **Always use the locale structure**: All routes should be under the `[locale]` segment.
2. **Use the middleware for redirects**: Handle redirects in the middleware rather than in individual pages.
3. **Keep auth routes separate**: Auth routes should have their own layout and structure.

### Layouts

1. **Use conditional rendering**: Conditionally render layout elements based on the route.
2. **Keep layouts simple**: Each layout should have a single responsibility.
3. **Use the appropriate layout level**: Choose the right level in the layout hierarchy for each UI element.

### Authentication

1. **Check authentication in middleware**: Handle authentication checks and redirects in the middleware.
2. **Define protected routes clearly**: Maintain a clear list of protected routes.
3. **Use token-based authentication**: Store and verify tokens for authentication.

### Internationalization

1. **Use the locale parameter**: Always include the locale in routes and components.
2. **Support direction changes**: Ensure the application supports both LTR and RTL directions.
3. **Manage translations at the component level**: Keep translations close to where they are used.

### State Management

1. **Use Zustand for global state**: Zustand provides a simple and efficient way to manage global state.
2. **Persist user preferences**: Use persistence for user preferences like theme and direction.
3. **Keep state minimal**: Only store what's necessary in global state.

---

By following these guidelines and understanding the architecture of the Promptaat application, you can maintain and extend the codebase with confidence. The changes made during the debugging process have established a solid foundation for the application's routing and layout system.
