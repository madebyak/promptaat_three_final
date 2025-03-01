ok your plan is good but it seems it has couple things is missing
make sure that once we start coding we remove and clean up all the existing UI and we start designing and building from scratch

let me start giving you my feedback with some suggestions that you should study but don't follow blindly 

1. Layout Structure
RootLayout
├── Navbar (Top)
│   ├── Logo (left side in LTL)
│   ├── About (Shadcn Button Link)(Right side)
│   ├── Pricing (Shadcn Button Link)
│   ├── Help (Shadcn Button Link)
│   ├── Horizantal line Thin
│   ├── Language Switcher (UK/Iraq flags) (shadcn)
│   ├── Theme Toggle (Dark/Light) (Shadcn Toggle group with Lucid icons for dark / light) 
│   └── User Menu/ (Shadcn dropdown) It shows Profile Pic First Name - Last Name / After click on it the drop-down menu will show (My Account - My Prompts - Settings - Logout) with small icons from lucid
│
├── Sidebar (Left) (Let's study and try to use Shadcn Sidebar) let's us read this carefully and understand how we implement it even for mobile version @web https://ui.shadcn.com/docs/components/sidebar
│   ├── Categories search bar 
│   ├── Categories List (fetch from database)
│   │   └── Subcategories (fetch from database)

│
└── Main Content
    ├── Small height Banner full width  with headline and subheading
    ├── Search Bar Row
    │   ├── Search Input
    │   └── Sort Dropdown (shadcn dropdown)
    │   └── Filter button with filter icon  (shadcn dropdown)
    └── Prompts Grid (i think we can use Shadcn card) 

**2.Components to Create/Update:**
a) Layout Components:

layout/Navbar.tsx: Top navigation with language/theme switchers ( explained above in details)
layout/Sidebar.tsx: Left menu with categories/tools ( explained above in details we suggest use Shadcn Sidebar)
layout/MobileNav.tsx: Responsive menu for mobile (Shadcn sidebar)
Can you run deep reading and analysis to understand exactly how to integrate shadcn sidebar and use it for our sidebar for all type of breakpoints of screens 
here's the link of their sidebar page: https://ui.shadcn.com/docs/components/sidebar 
then we need to fetch the categories and subcategories from our database



b) Prompt Components:

prompts/PromptCard.tsx: Updated card design with:

Bookmark icon Top-Right corner
Share button Top-right- corner
PRO/Basic label (shadcn badge) (data fetched from database prompts) Top-left corner
Categories & Tools tags (shadcn badge) (fetched from database prompts)
Title (truncated) (fetched from database prompts)
Prompt text preview (truncated) (fetched from database prompts)
Stats (views/copies) (fetched from database prompts) Bottom-left corner
Copy button (shadcn button)  Bottom-right corner


c) Search Components:

search/SearchBar.tsx: Main search input
search/SortDropdown.tsx: Sorting options (Most Popular - New - Last Updated)

3. Mobile Responsiveness Plan:
Sidebar collapses to bottom navigation read Carefully about Shadcn Sidebar as they explain how their sidebar works for mobile and have all codes and requirments needed https://ui.shadcn.com/docs/components/sidebar 

Prompt cards stack in single column
Search bar becomes sticky on scroll
Touch-friendly copy/share buttons 

4. Styling Guidelines:
Use defined color palette from Promptaat_styling.md 
 IBM Plex Sans for English/ IBM Plex Sans Arabic for arabic both are Google Font
Proper RTL support
Consistent spacing using design system which we we included them all inside /docs/Promptaat_styling.md 
ShadcnUI components with custom theming All ShadcnUI components she be customized in terms of styling colors based on our /docs/Promptaat_styling.md 