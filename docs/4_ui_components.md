# Promptaat UI Components Documentation

## Component Hierarchy

```
Components/
├── Layout/
│   ├── RootLayout
│   ├── Navbar
│   ├── Sidebar
│   ├── Footer
│   ├── MobileNav
│   └── AdminLayout
│
├── Admin/
│   ├── Dashboard/
│   │   ├── StatsCard
│   │   ├── AnalyticsChart
│   │   └── RecentActivity
│   ├── Prompts/
│   │   ├── PromptForm
│   │   ├── PromptList
│   │   └── PromptPreview
│   ├── Categories/
│   │   ├── CategoryForm
│   │   ├── CategoryList
│   │   └── SortableList
│   ├── Users/
│   │   ├── UserList
│   │   ├── UserDetails
│   │   └── ActivityLog
│   └── Common/
│       ├── DataTable
│       ├── FilterBar
│       └── ActionMenu
│
├── Auth/
│   ├── LoginForm
│   ├── RegisterForm
│   ├── OTPVerification
│   ├── GoogleAuthButton
│   └── ForgotPassword
│
├── Prompts/
│   ├── PromptCard
│   ├── PromptGrid
│   ├── PromptModal
│   ├── PromptActions
│   └── PromptFilters
│
├── Categories/
│   ├── CategoryList
│   ├── CategoryCard
│   └── SubcategoryList
│
├── Tools/
│   ├── ToolList
│   └── ToolCard
│
├── User/
│   ├── UserProfile
│   ├── BookmarksList
│   ├── CatalogList
│   ├── CatalogCard
│   ├── CatalogModal
│   ├── HistoryList
│   └── SubscriptionCard
│
└── Shared/
    ├── Button
    ├── Input
    ├── Select
    ├── Modal
    ├── Toast
    └── Loading
```

## Component Specifications

### Layout Components

#### RootLayout
```typescript
interface RootLayoutProps {
  children: React.ReactNode;
}

// Features:
// - RTL support
// - Theme provider
// - Toast notifications
// - Authentication state
// - Mobile responsiveness
```

#### Navbar
```typescript
interface NavbarProps {
  user?: User;
}

// Features:
// - Responsive design
// - Search bar
// - Language switcher
// - Theme toggle
// - User menu
// - Mobile menu trigger
```

#### Sidebar
```typescript
interface SidebarProps {
  categories: Category[];
  selectedCategory?: string;
}

// Features:
// - Collapsible categories
// - Active state indicators
// - Scroll with content
// - Hide on mobile
```

#### AdminLayout
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
}

// Features:
// - Admin-specific navigation
// - Breadcrumb navigation
// - Quick actions menu
// - Responsive sidebar
```

### Auth Components

#### LoginForm
```typescript
interface LoginFormProps {
  onSuccess: (user: User) => void;
  onError: (error: Error) => void;
}

// Features:
// - Email/Password login
// - Google OAuth
// - Form validation
// - Error handling
// - Loading states
```

#### OTPVerification
```typescript
interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => void;
}

// Features:
// - OTP input fields
// - Resend functionality
// - Countdown timer
// - Validation
```

### Prompt Components

#### PromptCard
```typescript
interface PromptCardProps {
  prompt: Prompt;
  onCopy: (id: string) => void;
  onBookmark: (id: string) => void;
}

// Features:
// - Pro/Free indicator
// - Copy counter
// - Bookmark toggle
// - Category tags
// - Tool icons
// - Responsive design
```

#### PromptModal
```typescript
interface PromptModalProps {
  prompt: Prompt;
  isOpen: boolean;
  onClose: () => void;
}

// Features:
// - Full prompt details
// - Copy functionality
// - Share options
// - Report button
// - Feedback form
// - Mobile optimized
```

#### PromptFilters
```typescript
interface PromptFiltersProps {
  categories: Category[];
  tools: Tool[];
  onFilter: (filters: FilterOptions) => void;
}

// Features:
// - Category filter
// - Tool filter
// - Sort options
// - Pro/Free filter
// - Clear filters
```

### Admin Components

#### StatsCard
```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: LucideIcon;
}

// Features:
// - Displays key metrics
// - Shows trend indicators
// - Responsive design
```

#### AnalyticsChart
```typescript
interface AnalyticsChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie';
  period: 'day' | 'week' | 'month' | 'year';
}

// Features:
// - Interactive charts
// - Date range selection
// - Export functionality
```

#### PromptForm
```typescript
interface PromptFormProps {
  initialData?: Prompt;
  onSubmit: (data: PromptFormData) => Promise<void>;
}

// Features:
// - Rich text editor
// - Multi-language support
// - Category selection
// - Tag management
// - Preview mode
```

#### PromptList
```typescript
interface PromptListProps {
  prompts: Prompt[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Features:
// - Sortable columns
// - Bulk actions
// - Status filters
// - Search functionality
```

#### CategoryForm
```typescript
interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
}

// Features:
// - Icon selection (Lucide)
// - Multi-language inputs
// - Parent category selection
```

#### SortableList
```typescript
interface SortableListProps {
  items: CategoryItem[];
  onSort: (newOrder: string[]) => void;
}

// Features:
// - Drag and drop sorting
// - Nested categories
// - Visual feedback
```

#### UserList
```typescript
interface UserListProps {
  users: User[];
  onStatusChange: (id: string, status: boolean) => void;
}

// Features:
// - User filtering
// - Status management
// - Activity tracking
// - Export data
```

#### DataTable
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column[];
  pagination?: PaginationOptions;
  actions?: TableAction[];
}

// Features:
// - Sortable columns
// - Custom filters
// - Bulk actions
// - Responsive design
```

#### FilterBar
```typescript
interface FilterBarProps {
  filters: Filter[];
  onChange: (filters: FilterState) => void;
}

// Features:
// - Multiple filter types
// - Save filter presets
// - Clear all filters
```

### Catalog Components

#### CatalogList
```typescript
interface CatalogListProps {
  catalogs: Catalog[];
  onSelect: (id: string) => void;
  onCreate: () => void;
}

// Features:
// - List of user catalogs
// - Create new catalog button
// - Default catalog indicator
// - Prompt count per catalog
```

#### CatalogCard
```typescript
interface CatalogCardProps {
  catalog: Catalog;
  onEdit: () => void;
  onDelete: () => void;
  onAddPrompt: (promptId: string) => void;
}

// Features:
// - Catalog name and description
// - Prompt count
// - Edit/Delete actions
// - Add prompt functionality
```

#### CatalogModal
```typescript
interface CatalogModalProps {
  mode: 'create' | 'edit';
  catalog?: Catalog;
  onSave: (data: CatalogData) => void;
  onClose: () => void;
}

// Features:
// - Create/Edit catalog form
// - Name and description fields
// - Set as default option
// - Validation
```

## Shared Components

### Button
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Input
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password';
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}
```

### Select
```typescript
interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isMulti?: boolean;
}
```

## Mobile-Specific Components

### MobileNav
```typescript
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

// Features:
// - Bottom navigation
// - Swipe gestures
// - Compact categories
// - Quick actions
```

### MobilePromptView
```typescript
interface MobilePromptViewProps {
  prompt: Prompt;
}

// Features:
// - Touch-friendly
// - Easy copy
// - Share sheet
// - Bottom sheet
```

## Theme Implementation

```typescript
const theme = {
  colors: {
    primary: {
      DEFAULT: '#4F46E5',
      light: '#818CF8',
      dark: '#3730A3',
    },
    secondary: {
      DEFAULT: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    // ... other colors
  },
  spacing: {
    // Consistent spacing scale
  },
  typography: {
    // Font families and sizes
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
}
```

## RTL Support

```typescript
// RTL wrapper component
interface RTLProps {
  children: React.ReactNode;
  locale: 'en' | 'ar';
}

// RTL utility functions
const getDirection = (locale: string) => locale === 'ar' ? 'rtl' : 'ltr';
const getAlignment = (locale: string) => locale === 'ar' ? 'right' : 'left';
```

## Animation Specifications

```typescript
// Using Framer Motion
const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
  // ... other animations
}
```

## Responsive Design

```typescript
const breakpoints = {
  'sm': '@media (min-width: 640px)',
  'md': '@media (min-width: 768px)',
  'lg': '@media (min-width: 1024px)',
  'xl': '@media (min-width: 1280px)',
}

// Example usage in styled-components
const Container = styled.div`
  padding: 1rem;
  
  ${breakpoints.md} {
    padding: 2rem;
  }
  
  ${breakpoints.lg} {
    padding: 3rem;
  }
`
```

## Loading States

```typescript
interface LoadingStateProps {
  type: 'spinner' | 'skeleton' | 'placeholder';
  size?: 'sm' | 'md' | 'lg';
}

// Skeleton templates
const PromptCardSkeleton = () => (
  <div className="animate-pulse">
    {/* Skeleton structure */}
  </div>
);
```

## Error Handling

```typescript
interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

// Error states
const ErrorState = {
  NotFound: () => <div>Content not found</div>,
  Network: () => <div>Network error</div>,
  Permission: () => <div>Permission denied</div>,
}
```

## Accessibility Features

```typescript
// Focus management
const FocusTrap = ({ children }: { children: React.ReactNode }) => {
  // Implementation
};

// Screen reader only text
const ScreenReaderOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
```

## Component Testing

```typescript
// Example test suite
describe('PromptCard', () => {
  it('renders prompt information correctly', () => {
    // Test implementation
  });

  it('handles copy action', () => {
    // Test implementation
  });

  it('shows pro badge for pro prompts', () => {
    // Test implementation
  });
});
```

## Performance Optimization

1. **Code Splitting**:
   - Lazy loading components
   - Route-based splitting
   - Component-based splitting

2. **Image Optimization**:
   - Next.js Image component
   - Responsive images
   - Proper formats

3. **Component Optimization**:
   - Memoization
   - Virtual scrolling
   - Debounced inputs
