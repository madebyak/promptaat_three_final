'use client';

import dynamic from 'next/dynamic';
import { CMSLayout } from '@/components/layouts/cms-layout';

// Dynamically import the BlogsManagement component
const BlogsManagement = dynamic(
  () => import('@/components/cms/blogs/blogs-management')
);

export default function BlogsPage() {
  return (
    <CMSLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <BlogsManagement />
      </div>
    </CMSLayout>
  );
}
