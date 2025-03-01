# Promptaat Project Structure

## Frontend (Next.js 15)

```
promptaat/
├── .env                    # Environment variables
├── .gitignore
├── package.json           # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
│
├── public/               # Static assets
│   ├── images/
│   ├── icons/
│   └── locales/          # i18n translation files
│
├── src/
│   ├── app/              # Next.js 15 App Router
│   │   ├── [locale]/     # Internationalization routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx  # Homepage
│   │   │   ├── prompts/  # Prompts pages
│   │   │   ├── auth/     # Authentication pages
│   │   │   └── user/     # User dashboard pages
│   │   ├── api/          # API routes
│   │   └── cms/          # Admin Panel Routes
│   │       ├── layout.tsx
│   │       ├── page.tsx  # Admin Dashboard
│   │       ├── auth/     # Admin Authentication
│   │       ├── prompts/  # Prompt Management
│   │       ├── categories/ # Category Management
│   │       ├── tools/    # Tools Management
│   │       └── users/    # User Management
│   │
│   ├── components/       # React components
│   │   ├── ui/          # ShadcnUI components
│   │   ├── layout/      # Layout components
│   │   ├── prompts/     # Prompt-related components
│   │   ├── auth/        # Authentication components
│   │   └── shared/      # Shared components
│   │
│   ├── lib/             # Utility functions
│   │   ├── prisma/      # Prisma client and configs
│   │   ├── auth/        # Authentication utilities
│   │   ├── api/         # API utilities
│   │   └── utils/       # Helper functions
│   │
│   ├── hooks/           # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-prompts.ts
│   │   └── use-theme.ts
│   │
│   ├── styles/          # Global styles
│   │   └── globals.css
│   │
│   └── types/           # TypeScript types
│       ├── prompt.ts
│       ├── user.ts
│       └── api.ts
│
└── prisma/              # Prisma schema and migrations
    ├── schema.prisma
    └── migrations/
```

## Key Configuration Files

### 1. Next.js Configuration (next.config.js)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  images: {
    domains: ['your-storage-domain.com'],
  },
  // Add other configurations as needed
}

module.exports = nextConfig
```

### 2. Tailwind Configuration (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
      fontFamily: {
        // Custom fonts
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 3. Environment Variables (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/promptaat"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# Storage
STORAGE_ACCESS_KEY="your-storage-access-key"
STORAGE_SECRET_KEY="your-storage-secret-key"
STORAGE_BUCKET="your-bucket-name"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

## Development Guidelines

1. **Component Organization**:
   - Use atomic design principles
   - Keep components small and focused
   - Implement proper prop typing
   - Use composition over inheritance

2. **State Management**:
   - Use React Query for server state
   - Use Zustand for complex client state
   - Leverage React Context for theme/locale

3. **Styling**:
   - Use Tailwind CSS classes
   - Create reusable utility classes
   - Maintain consistent spacing/colors
   - Support RTL layouts

4. **Performance**:
   - Implement proper code splitting
   - Use Next.js Image component
   - Optimize third-party imports
   - Implement proper caching strategies

5. **Security**:
   - Implement proper CORS policies
   - Sanitize user inputs
   - Use proper authentication flows
   - Implement rate limiting

6. **Testing**:
   - Write unit tests for utilities
   - Component testing with React Testing Library
   - E2E testing with Cypress
   - API testing with Jest

7. **Code Quality**:
   - Use ESLint for code linting
   - Prettier for code formatting
   - Husky for pre-commit hooks
   - TypeScript for type safety

8. **Monitoring**:
   - Implement error tracking
   - Performance monitoring
   - User analytics
   - Server monitoring

## Deployment Strategy

1. **Frontend (Vercel)**:
   - Automatic deployments
   - Preview deployments
   - Edge functions for API routes
   - CDN for static assets

2. **Admin Panel (Railway)**:
   - Container-based deployment
   - Automatic scaling
   - Database proximity
   - Backup strategy

3. **Database (Railway)**:
   - Automated backups
   - Connection pooling
   - Read replicas (if needed)
   - Monitoring and alerts
