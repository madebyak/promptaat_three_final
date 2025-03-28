// Simple layout component that just returns children
// Authentication is handled by the parent CMS layout
export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Return children directly without AdminLayout to prevent duplicate sidebars
  // The main CMS layout already provides the sidebar and authentication
  return children;
}
