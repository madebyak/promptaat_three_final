# Promptaat API Endpoints Documentation

## Authentication Endpoints

### User Authentication

```typescript
// POST /api/auth/register
interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  occupation?: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/verify-otp
interface VerifyOTPRequest {
  email: string;
  otp: string;
}

// POST /api/auth/google
// Handles Google OAuth authentication

// POST /api/auth/logout
// Handles user logout
```

### Admin Authentication

```typescript
// POST /api/cms/auth/login
interface AdminLoginRequest {
  username: string;
  password: string;
}

// POST /api/cms/auth/refresh
// Refresh JWT token
```

## User Management

### Profile Management

```typescript
// GET /api/users/profile
// Get current user profile

// PUT /api/users/profile
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  country?: string;
  occupation?: string;
}

// PUT /api/users/password
interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

### User History & Bookmarks

```typescript
// GET /api/users/history
// Get user's prompt history (last 30 items)

// GET /api/users/bookmarks
// Get user's bookmarked prompts

// POST /api/users/bookmarks/{promptId}
// Bookmark a prompt

// DELETE /api/users/bookmarks/{promptId}
// Remove a bookmark
```

### Catalog Management

```typescript
// GET /api/users/catalogs
// Get user's prompt catalogs

// POST /api/users/catalogs
interface CreateCatalogRequest {
  name: string;
  description?: string;
  isDefault?: boolean;
}

// PUT /api/users/catalogs/{id}
interface UpdateCatalogRequest {
  name?: string;
  description?: string;
  isDefault?: boolean;
}

// DELETE /api/users/catalogs/{id}
// Delete a catalog

// POST /api/users/catalogs/{catalogId}/prompts/{promptId}
// Add prompt to catalog

// DELETE /api/users/catalogs/{catalogId}/prompts/{promptId}
// Remove prompt from catalog

// GET /api/users/catalogs/{id}/prompts
// Get all prompts in a catalog
```

## Prompt Management

### Prompt CRUD Operations

```typescript
// GET /api/prompts
interface GetPromptsQuery {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  tool?: string;
  search?: string;
  sort?: 'popular' | 'newest' | 'most_used';
  type?: 'free' | 'pro';
}

// GET /api/prompts/{id}
// Get single prompt details

// POST /api/prompts/{id}/copy
// Increment prompt copy count

// POST /api/prompts/{id}/report
interface ReportPromptRequest {
  reason: string;
  details?: string;
}

// POST /api/prompts/{id}/feedback
interface PromptFeedbackRequest {
  feedback: string;
}
```

### Categories & Tools

```typescript
// GET /api/categories
// Get all categories with subcategories

// GET /api/tools
// Get all AI tools

// GET /api/categories/{id}/prompts
// Get prompts for specific category
```

## Subscription Management

```typescript
// GET /api/subscriptions/plans
// Get available subscription plans

// POST /api/subscriptions/create
interface CreateSubscriptionRequest {
  planType: 'monthly' | '3_months' | 'yearly';
}

// GET /api/subscriptions/status
// Get current subscription status

// POST /api/subscriptions/cancel
// Cancel current subscription
```

## Newsletter Management

```typescript
// POST /api/newsletter/subscribe
interface NewsletterSubscribeRequest {
  email: string;
}

// POST /api/newsletter/unsubscribe
interface NewsletterUnsubscribeRequest {
  email: string;
}
```

## Admin Panel Endpoints

### Prompt Management

```typescript
// GET /api/cms/prompts
interface AdminGetPromptsQuery {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

// POST /api/cms/prompts
interface CreatePromptRequest {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  promptTextEn: string;
  promptTextAr: string;
  instructionEn?: string;
  instructionAr?: string;
  isPro: boolean;
  initialCopyCount: number;
  categories: string[];
  subcategories: string[];
  tools: string[];
  keywords: string[];
}

// PUT /api/cms/prompts/{id}
// Update prompt (same structure as create)

// DELETE /api/cms/prompts/{id}
// Soft delete prompt
```

### Category Management

```typescript
// POST /api/cms/categories
interface CreateCategoryRequest {
  nameEn: string;
  nameAr: string;
  iconUrl?: string;
  sortOrder?: number;
}

// POST /api/cms/subcategories
interface CreateSubcategoryRequest {
  categoryId: string;
  nameEn: string;
  nameAr: string;
  sortOrder?: number;
}

// PUT /api/cms/categories/sort
interface UpdateCategorySortRequest {
  categories: Array<{
    id: string;
    sortOrder: number;
  }>;
}
```

### Tool Management

```typescript
// POST /api/cms/tools
interface CreateToolRequest {
  name: string;
  iconUrl?: string;
  websiteUrl?: string;
}

// PUT /api/cms/tools/{id}
// Update tool

// DELETE /api/cms/tools/{id}
// Delete tool
```

### User Management

```typescript
// GET /api/cms/users
interface GetUsersQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// PUT /api/cms/users/{id}/status
interface UpdateUserStatusRequest {
  isActive: boolean;
}
```

### Analytics & Reporting

```typescript
// GET /api/cms/analytics/overview
// Get dashboard overview stats

// GET /api/cms/analytics/prompts
// Get prompt usage analytics

// GET /api/cms/analytics/users
// Get user analytics

// GET /api/cms/reports
// Get prompt reports

// PUT /api/cms/reports/{id}
interface UpdateReportStatusRequest {
  status: 'reviewed' | 'resolved';
  notes?: string;
}
```

## API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Error Codes

```typescript
enum ErrorCodes {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}
```

## API Security

1. **Authentication**:
   - JWT for API authentication
   - Rate limiting per user/IP
   - CORS configuration

2. **Input Validation**:
   - Request validation using Zod
   - Sanitize user inputs
   - Validate file uploads

3. **Error Handling**:
   - Consistent error format
   - Proper status codes
   - Detailed error messages (dev only)

## API Versioning

- All endpoints are prefixed with `/api`
- Version prefix not needed for v1
- Future versions will use `/api/v2/`, etc.

## Rate Limiting

```typescript
const rateLimits = {
  'POST /api/auth/*': '5 requests per minute',
  'GET /api/prompts/*': '60 requests per minute',
  'POST /api/prompts/*/copy': '30 requests per minute',
  'POST /api/newsletter/*': '3 requests per minute'
}
```

## Caching Strategy

1. **Cache Headers**:
   - ETag for resource validation
   - Cache-Control headers
   - Conditional GET requests

2. **Redis Caching**:
   - Popular prompts
   - Category lists
   - Tool lists
   - User preferences

## Webhook Endpoints

```typescript
// POST /api/webhooks/stripe
// Handle Stripe webhook events

// POST /api/webhooks/resend
// Handle email delivery events
```

## API Documentation

- OpenAPI/Swagger documentation
- Postman collection
- API changelog
- Integration examples
