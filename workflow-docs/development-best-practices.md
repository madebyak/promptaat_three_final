# Promptaat Development Best Practices

This document outlines the development best practices for the Promptaat project to ensure consistent, maintainable, and production-ready code.

## Project Structure

Follow the established project structure for all new features:

```
src/
├── app/                 # Next.js App Router pages
│   ├── [locale]/        # Localized routes
│   └── api/             # API routes
├── components/          # Reusable UI components
│   ├── ui/              # Base UI components (shadcn)
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── lib/                 # Utility functions and shared logic
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── styles/              # Global styles
└── providers/           # Context providers
```

## TypeScript Best Practices

### Type Definitions

- Create explicit interfaces for all component props:

```typescript
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

- Use discriminated unions for complex state:

```typescript
type AuthState = 
  | { status: 'unauthenticated' }
  | { status: 'authenticated', user: User }
  | { status: 'loading' };
```

- Avoid using `any` type; use `unknown` when necessary:

```typescript
// Avoid
function processData(data: any) { ... }

// Better
function processData(data: unknown) {
  if (typeof data === 'string') {
    // Now TypeScript knows data is a string
  }
}
```

### Type Safety

- Use non-null assertion only when absolutely necessary:

```typescript
// Avoid whenever possible
const element = document.getElementById('app')!;

// Better
const element = document.getElementById('app');
if (element) {
  // Safe to use element here
}
```

- Use optional chaining and nullish coalescing:

```typescript
// Optional chaining
const title = data?.post?.title;

// Nullish coalescing
const count = data.count ?? 0;
```

## Component Architecture

### Client vs Server Components

- Properly designate client components with the 'use client' directive:

```typescript
'use client';

import { useState } from 'react';

export function ClientComponent() {
  const [state, setState] = useState(false);
  // ...
}
```

- Keep server components lean and focused on data fetching:

```typescript
// No 'use client' directive needed for server components
import { getServerSession } from 'next-auth';

export async function ServerComponent() {
  const session = await getServerSession();
  // ...
  return <ClientComponent data={data} />;
}
```

### Component Organization

- Split large components into smaller, focused ones:

```typescript
// Instead of one large component
export function UserDashboard() {
  // 200+ lines of code
}

// Break it down
export function UserDashboard() {
  return (
    <div>
      <UserStats />
      <RecentActivity />
      <UserPreferences />
    </div>
  );
}
```

- Use composition over inheritance:

```typescript
// Base card component
function Card({ children, className }) {
  return <div className={cn("card", className)}>{children}</div>;
}

// Specialized cards
function UserCard({ user }) {
  return (
    <Card className="user-card">
      <UserAvatar user={user} />
      <UserInfo user={user} />
    </Card>
  );
}
```

## State Management

### Local State

- Use `useState` for simple component state:

```typescript
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

- Use `useReducer` for complex state logic:

```typescript
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}
```

### Global State

- Use Zustand for global state:

```typescript
import { create } from 'zustand';

interface BearState {
  bears: number;
  increase: (by: number) => void;
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}));
```

## Data Fetching

### API Requests

- Use a consistent pattern for API requests:

```typescript
// api-client.ts
export async function fetchData<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}
```

- Handle loading and error states:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { fetchData } from '@/lib/api-client';

export function DataComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const result = await fetchData('/api/data');
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return <div>{/* Render data */}</div>;
}
```

## Styling Best Practices

### Tailwind CSS

- Use consistent patterns for responsive design:

```tsx
<div className="
  w-full 
  md:w-1/2 
  lg:w-1/3
  p-2
  md:p-4
">
  {/* Content */}
</div>
```

- Create custom utility classes for repeated patterns:

```css
/* globals.css */
@layer utilities {
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500;
  }
}
```

- Use the `cn` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils';

function Button({ variant, className, ...props }) {
  return (
    <button
      className={cn(
        "base-button-styles",
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-800",
        className
      )}
      {...props}
    />
  );
}
```

## Internationalization (i18n)

- Always design components with i18n in mind:

```tsx
// Label text comes from i18n
function Label({ htmlFor, labelKey }) {
  const { t } = useTranslation();
  return <label htmlFor={htmlFor}>{t(labelKey)}</label>;
}
```

- Support RTL layouts properly:

```tsx
function Card({ children, locale }) {
  const isRTL = locale === 'ar';
  return (
    <div className={cn(
      "card-base",
      isRTL ? "rtl text-right" : "ltr text-left"
    )}>
      {children}
    </div>
  );
}
```

## Error Handling

- Use Error Boundaries for client components:

```tsx
'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function SafeComponent({ children }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
```

- Implement consistent error handling for API responses:

```typescript
// Use a standard API response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function handler(req, res) {
  try {
    // Process request
    const data = await processRequest(req);
    
    return res.status(200).json({
      success: true,
      data,
      message: 'Success'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'An error occurred'
    });
  }
}
```

## Performance Optimization

- Implement proper code splitting:

```tsx
import dynamic from 'next/dynamic';

// Only load this component when it's needed
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

- Use the Next.js Image component for optimized images:

```tsx
import Image from 'next/image';

function OptimizedImage() {
  return (
    <Image 
      src="/images/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority
    />
  );
}
```

- Memoize expensive calculations and component renders:

```tsx
import { useMemo, memo } from 'react';

// Memoize expensive calculations
function DataTable({ data, filter }) {
  const filteredData = useMemo(() => {
    return data.filter(item => item.name.includes(filter));
  }, [data, filter]);
  
  return <table>{/* Render filteredData */}</table>;
}

// Memoize component rendering
const PureComponent = memo(function PureComponent({ value }) {
  return <div>{value}</div>;
});
```

## Testing

- Write unit tests for utility functions:

```typescript
// utils.test.ts
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('formats currency with default locale', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });
  
  it('respects locale parameter', () => {
    expect(formatCurrency(1000, 'ar-SA')).toBe('ر.س.‏ 1,000.00');
  });
});
```

- Test components with proper user interactions:

```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Git Workflow

- Use descriptive branch names:
  - `feature/auth-improvements`
  - `fix/sidebar-navigation`
  - `refactor/api-client`

- Write meaningful commit messages:
  - ✅ `feat: add user preference panel to sidebar`
  - ✅ `fix: resolve authentication session timeout issue`
  - ❌ `update code`
  - ❌ `fix stuff`

- Keep commits focused on a single concern:
  - Separate feature changes from refactoring
  - Separate UI changes from logic changes when possible

## Code Review Standards

When reviewing or submitting code for review, check for:

1. Type safety and proper TypeScript usage
2. Consistent error handling
3. Performance considerations
4. Internationalization support
5. Proper state management
6. UI consistency with design system
7. Responsive design implementation
8. Test coverage for critical functionality

## Documentation

- Document complex logic with comments:

```typescript
/**
 * Processes user permissions and returns accessible resources
 * 
 * Algorithm:
 * 1. Get user roles from authentication
 * 2. Map each role to its set of permissions
 * 3. Union all permission sets
 * 4. Filter resources based on required permissions
 * 
 * @param userId - The user to process permissions for
 * @returns Array of accessible resource IDs
 */
async function getUserAccessibleResources(userId: string): Promise<string[]> {
  // Implementation...
}
```

- Maintain up-to-date API documentation:

```typescript
/**
 * Fetches categories with optional filtering
 * 
 * @param options - Query options
 * @param options.locale - The locale code (e.g., 'en', 'ar')
 * @param options.query - Optional search query to filter categories
 * @param options.parentId - Optional parent ID to filter subcategories
 * @returns Promise resolving to the API response with categories
 */
export async function getCategories(options: {
  locale: string;
  query?: string;
  parentId?: string;
}): Promise<ApiResponse<Category[]>> {
  // Implementation...
}
```

---

Following these best practices will help ensure a consistent, maintainable, and production-ready codebase for Promptaat.
