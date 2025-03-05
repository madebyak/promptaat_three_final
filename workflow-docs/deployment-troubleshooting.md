# Deployment Troubleshooting Guide

This guide addresses common deployment issues with Promptaat on Vercel and provides solutions for each.

## Common Deployment Errors

### 1. TypeScript Errors

**Symptoms:**
- Build fails with TypeScript errors
- Error messages about type mismatches or missing properties

**Solutions:**
- Run `tsc --noEmit` locally to catch these errors before deployment
- Fix all type issues, don't use `any` unless absolutely necessary
- Update type definitions for components that have changed
- Check for null/undefined handling in all components

**Example:**
```typescript
// Before (error prone)
function Component(props) {
  return <div>{props.data.title}</div>;
}

// After (type-safe)
interface ComponentProps {
  data: {
    title: string;
  };
}

function Component(props: ComponentProps) {
  return <div>{props.data?.title}</div>;
}
```

### 2. Import/Export Mismatches

**Symptoms:**
- "Module not found" errors
- "Default export is not a component" errors
- Components render as empty or show unexpected behavior

**Solutions:**
- Be consistent with export types (named vs. default)
- Check all imports match the corresponding exports
- Use barrel files (index.ts) to simplify imports
- Run the pre-deployment script to detect these issues

**Example:**
```typescript
// Component file (correct)
export function MyComponent() { ... }

// Importing file (correct)
import { MyComponent } from './MyComponent';

// NOT
import MyComponent from './MyComponent'; // This will cause errors
```

### 3. Missing Link Imports

**Symptoms:**
- Navigation doesn't work in production
- Errors about missing props on Link components
- Full page reloads instead of client-side navigation

**Solutions:**
- Always import Link from 'next/link'
- Don't use a elements for internal navigation
- Use the pre-deploy check to find missing imports

**Example:**
```tsx
// Wrong
<a href="/page">Go to page</a>

// Correct
import Link from 'next/link';

<Link href="/page">Go to page</Link>
```

### 4. Environment Variable Issues

**Symptoms:**
- API calls fail in production but work in development
- Authentication services don't work
- "Cannot read property of undefined" errors

**Solutions:**
- Check that all environment variables are set in Vercel
- Verify the naming matches between .env and Vercel settings
- Use fallbacks for non-critical environment variables
- Add validation for required environment variables at startup

**Example:**
```typescript
// Validate required env vars at startup
function validateEnv() {
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'API_KEY'];
  for (const var of required) {
    if (!process.env[var]) {
      throw new Error(`Missing required environment variable: ${var}`);
    }
  }
}

// Call this in a server-side context
```

### 5. CSS/Styling Issues

**Symptoms:**
- Layouts look different in production
- Styles are missing or incorrect
- Tailwind classes don't apply properly

**Solutions:**
- Check for proper CSS import order
- Ensure tailwind.config.js includes all necessary paths
- Test with a production build locally
- Verify that component libraries are properly configured

**Example for Tailwind configuration:**
```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    // Include all potential template files
  ],
  // ...
}
```

### 6. Client/Server Component Confusion

**Symptoms:**
- "useState is not defined" or similar hooks errors
- "Cannot use X on the server" errors
- Components that worked in development fail in production

**Solutions:**
- Properly mark components as 'use client' when needed
- Split server-only and client-only logic into separate components
- Be careful with async components and data fetching
- Test specifically in production mode locally

**Example:**
```tsx
// Client component
'use client';

import { useState } from 'react';

export function ClientComponent() {
  const [state, setState] = useState(false);
  // ...
}

// Server component
export async function ServerComponent() {
  const data = await fetchData();  // Server-side fetch
  return <div>{data.title}</div>;
}
```

### 7. Next.js Route Handling Issues

**Symptoms:**
- 404 errors for routes that work in development
- Dynamic routes don't match properly
- API routes fail in production

**Solutions:**
- Check for correct route definitions in the app directory
- Verify dynamic segment naming
- Test API routes with production build
- Check for case sensitivity issues in route paths

**Example:**
```
// Correct route structure (Next.js App Router)
app/
├── page.tsx               // home route (/)
├── about/
│   └── page.tsx           // about route (/about)
├── blog/
│   ├── page.tsx           // blog index route (/blog)
│   └── [slug]/
│       └── page.tsx       // blog post route (/blog/[slug])
```

### 8. Data Fetching Failures

**Symptoms:**
- Loading states persist indefinitely
- "Unexpected token < in JSON at position 0" errors
- API requests succeed locally but fail in production

**Solutions:**
- Check for absolute vs relative URL paths
- Verify API routes are correctly implemented
- Ensure authentication tokens are properly passed
- Add error boundaries around data-dependent components

**Example:**
```tsx
// Using absolute URLs for API paths
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const response = await fetch(`${apiUrl}/api/data`);

// Instead of relative paths that may break:
const response = await fetch('/api/data');
```

### 9. Authentication Issues

**Symptoms:**
- Login works in development but not production
- Sessions expire unexpectedly
- "Invalid JWT" or similar errors

**Solutions:**
- Verify NEXTAUTH_URL is set correctly in production
- Check session cookie settings (secure, sameSite)
- Ensure NEXTAUTH_SECRET is properly set
- Test authentication flows explicitly in production mode

**Example configuration:**
```js
// next-auth config
export const authOptions = {
  // ...
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    // ...
  },
}
```

### 10. Performance Issues

**Symptoms:**
- Application is slow in production
- High memory usage
- Timeouts during builds

**Solutions:**
- Implement proper code splitting
- Use Next.js Image component for optimized images
- Add caching for expensive operations
- Split large components into smaller ones

**Example:**
```tsx
// Use dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
});
```

## Debugging Techniques

### Reading Vercel Build Logs

1. Go to your Vercel dashboard
2. Select the deployment with issues
3. Click on "View Build Logs"
4. Look for errors, warnings, or unexpected output
5. Pay special attention to the build step that failed

### Using Local Production Builds

Run a local production build to reproduce issues:

```bash
npm run vercel:local
```

This will build and start the application in production mode locally.

### Comparing Development and Production

Use the React DevTools to compare component trees between development and production to spot differences.

### Bisect Deployment Issues

If you're unsure which change caused a deployment failure:

1. Find the last successful deployment
2. Create a branch from that commit
3. Add changes incrementally
4. Test each increment with a production build
5. Identify which change causes the failure

## Rollback Procedure

If a deployment causes critical issues:

1. Go to Vercel dashboard
2. Find the last successful deployment
3. Click the three dots menu (⋮)
4. Select "Redeploy"
5. Confirm the redeployment

Alternatively, revert the problematic commit in your repository:

```bash
git revert HEAD
git push
```

## Prevention Strategies

- Always run `npm run pre-deploy` before pushing changes
- Test in production mode locally with `npm run test:prod`
- Implement comprehensive automated tests
- Use feature flags for significant changes
- Document environment variable requirements
- Maintain a deployment checklist

---

Remember to document any new deployment issues and their solutions in this guide for future reference.
