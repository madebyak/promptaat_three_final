# Promptaat UI Action Plan

## Phase 0: Cleanup
- [x] Remove existing UI components
- [x] Clean up routing structure
- [x] Remove unused imports and files
- [x] Ensure clean slate for new implementation

## Phase 1: Core Layout

### a) Navbar (Top)
- [x] Logo positioning (left in LTR)
- [x] Navigation links using shadcn/Button variant="link":
  - [x] About
  - [x] Pricing
  - [x] Help
- [x] Horizontal divider (thin line)
- [x] Language switcher (UK/Iraq flags) using shadcn/DropdownMenu
- [x] Theme toggle using shadcn/ToggleGroup with Lucide icons (moon/sun)
- [x] User menu using shadcn/DropdownMenu:
  - [x] Profile picture
  - [x] First Name - Last Name
  - [x] Dropdown items with Lucide icons:
    - [x] My Account
    - [x] My Prompts
    - [x] Settings
    - [x] Logout

### b) Sidebar
Implementation using shadcn/Sidebar:
- [ ] Follow shadcn sidebar documentation for:
  - [ ] Desktop layout
  - [ ] Mobile-responsive behavior
  - [ ] Collapsible functionality
- [ ] Components:
  - [ ] Categories search input
  - [ ] Dynamic categories list from database
  - [ ] Nested subcategories display
  - [ ] RTL support for both desktop/mobile
- [ ] Mobile Implementation:
  - [ ] Use shadcn sidebar mobile pattern
  - [ ] Bottom navigation conversion
  - [ ] Touch-friendly interactions

### c) Main Content Layout
- [ ] Banner component:
  - [ ] Full-width design
  - [ ] Small height
  - [ ] Responsive headline/subheading
  - [ ] Proper spacing from Promptaat_styling.md
- [ ] Search section:
  - [ ] Search input with icon
  - [ ] Sort dropdown (shadcn/DropdownMenu):
    - [ ] Most Popular
    - [ ] New
    - [ ] Last Updated
  - [ ] Filter button with icon (shadcn/DropdownMenu)
- [ ] Responsive grid layout for prompts

## Phase 2: Components

### a) PromptCard
Using shadcn/Card with layout:
```
┌─────────────────────────────────┐
│ PRO/Basic     Bookmark  Share   │
│ (shadcn/Badge)                  │
│                                 │
│ Title (truncated)               │
│                                 │
│ Categories/Subcategories        │
│ (shadcn/Badge)                  │
│                                 │
│ Prompt Preview                  │
│                                 │
│ Tool Icon + Name                │
│ (shadcn/Badge)                  │
│                                 │
│ Views/Copies    Copy Button     │
│                (shadcn/Button)  │
└─────────────────────────────────┘
```

Database Integration:
- [ ] Title from prompts.titleEn/titleAr
- [ ] Categories from categories table
- [ ] Subcategories from subcategories table
- [ ] Prompt preview from prompts.promptTextEn/promptTextAr
- [ ] Tool data from tools table
- [ ] Stats from prompts table

### b) Search Components
- [ ] Searchbar:
  - [ ] Icon integration
  - [ ] Responsive width
  - [ ] Clear button
- [ ] Sort dropdown (shadcn/DropdownMenu):
  - [ ] Most Popular
  - [ ] New
  - [ ] Last Updated
- [ ] Filter dropdown with multiple options

## Phase 3: Styling & Theme

### a) Typography
- [x] Configure fonts:
  - [x] IBM Plex Sans (English)
  - [ ] IBM Plex Sans Arabic
- [x] Set up font weights from Promptaat_styling.md
- [x] Configure line heights from Promptaat_styling.md

### b) Colors
- [x] Implement color palette from Promptaat_styling.md:
  - [x] Primary colors
  - [x] Secondary colors
  - [x] Neutral colors
  - [x] Semantic colors
- [x] Create shadcn theme overrides
- [x] Set up dark/light variants

### c) Spacing
From Promptaat_styling.md:
- [x] Implement spacing scale
- [x] Configure component gaps
- [x] Set up responsive margins/padding
- [x] Ensure consistent spacing across breakpoints

## Phase 4: Data Integration
- [ ] Set up database queries:
  - [ ] Categories/subcategories
  - [ ] Prompts with related data
  - [ ] Tools information
- [ ] Implement data fetching:
  - [ ] Server components
  - [ ] Loading states
  - [ ] Error handling
- [ ] Add functionality:
  - [ ] Bookmark system
  - [ ] Share feature
  - [ ] Copy tracking
  - [ ] Views counting

## Phase 5: Mobile & Responsive Optimization
- [x] Implement responsive behaviors:
  - [x] shadcn/Sidebar mobile pattern
  - [ ] Card grid adjustments
  - [x] Font size scaling
  - [x] Spacing adaptations
- [x] Touch optimization:
  - [x] Button sizes
  - [x] Touch targets
  - [x] Gesture support
- [ ] RTL testing:
  - [ ] Layout verification
  - [ ] Text alignment
  - [ ] Icon positioning
- [ ] Performance optimization:
  - [ ] Image optimization
  - [ ] Loading strategies
  - [ ] Animation performance
