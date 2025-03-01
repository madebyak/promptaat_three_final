# Admin Panel Documentation

## Overview
The admin panel is integrated into the main Next.js 15 application under the `/cms` route, accessible at `promptaat.com/cms`. This integration allows for shared resources while maintaining logical separation.

## Architecture

### Route Structure
```
/cms
├── /                 # Dashboard
├── /auth            # Admin authentication
├── /prompts         # Prompt management
├── /categories      # Category management
├── /tools           # AI tools management
└── /users           # User management
```

### Authentication Flow
1. Admin users access `/cms/auth`
2. JWT-based authentication
3. Separate auth middleware for admin routes
4. Session management with refresh tokens

### Key Features

#### 1. Dashboard
- Real-time analytics
- Key performance metrics
- Recent activity log
- Quick action buttons

#### 2. Prompt Management
- Create/Edit prompts with rich text editor
- Multi-language support (EN/AR)
- Category and tool assignment
- Preview functionality
- Bulk actions
- Status management (draft, published, archived)

#### 3. Category Management
- Hierarchical category structure
- Drag-and-drop sorting
- Icon selection from Lucide library
- Multi-language support
- Usage statistics

#### 4. User Management
- User list with filtering
- Activity tracking
- Status management
- Export functionality
- Subscription management

#### 5. Analytics & Reporting
- Usage statistics
- User growth metrics
- Popular prompts
- Revenue tracking
- Custom report generation

## Security Measures

### 1. Authentication
- JWT with short expiration
- Refresh token rotation
- Rate limiting
- Session invalidation

### 2. Authorization
- Role-based access control
- Action audit logging
- IP whitelisting option
- Two-factor authentication support

### 3. Data Protection
- Input sanitization
- XSS prevention
- CSRF protection
- API request validation

## Integration Points

### 1. Database
- Shares the main application database
- Admin-specific tables:
  - admin_users
  - audit_logs
  - admin_settings

### 2. API Layer
- All admin endpoints under `/api/cms/*`
- Separate middleware stack
- Rate limiting and monitoring
- Response caching where appropriate

### 3. Frontend Integration
- Shared UI components with main app
- Admin-specific theme
- Responsive design
- RTL support

## Development Guidelines

### 1. Component Structure
- Use shared UI components when possible
- Create admin-specific variants as needed
- Maintain consistent styling
- Follow accessibility guidelines

### 2. State Management
- Use React Query for server state
- Zustand for complex UI state
- Maintain clear data flow
- Implement proper error handling

### 3. Performance
- Implement proper caching
- Use dynamic imports
- Optimize bundle size
- Monitor performance metrics

### 4. Testing
- Unit tests for utilities
- Component testing
- Integration tests
- E2E testing for critical flows

## Deployment

### 1. Configuration
- Environment variables
- Feature flags
- Error tracking
- Performance monitoring

### 2. CI/CD
- Automated testing
- Build optimization
- Deployment verification
- Rollback capability

## Monitoring

### 1. Error Tracking
- Integration with error tracking service
- Alert configuration
- Error reporting
- Performance monitoring

### 2. Analytics
- User actions tracking
- Performance metrics
- Usage patterns
- Custom events

## Future Enhancements

### Phase 1
- Advanced analytics dashboard
- Bulk operations improvements
- Enhanced reporting tools
- Custom role management

### Phase 2
- AI-powered insights
- Advanced user segmentation
- Automated content moderation
- Enhanced security features
