/**
 * Layout component for CMS Analytics pages
 * 
 * This layout reuses the main CMS layout and doesn't add any additional structure
 * to prevent duplicate sidebars or navigation elements.
 */
export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This prevents duplicate sidebars since the main CMS layout already has a sidebar
  return children;
}
