import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Promptaat',
  description: 'Privacy Policy for Promptaat platform',
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6">
      <div className="mb-8">
        <Link href="/en">
          <Button variant="ghost" className="pl-0 flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6">Last updated: March 3, 2025</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>
            Welcome to Promptaat (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). This Privacy Policy explains how we collect, use, and protect your personal information.
          </p>
          <p>
            We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Collection of Your Information</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect via the Service includes:
          </p>
          
          <h3 className="text-xl font-medium mt-4">Personal Data</h3>
          <p>
            Personally identifiable information, such as your name, email address, telephone number, and demographic information that you voluntarily give to us when you register with the Service.
          </p>
          
          <h3 className="text-xl font-medium mt-4">Derivative Data</h3>
          <p>
            Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Use of Your Information</h2>
          <p className="mb-4">
            The &quot;Promptaat&quot; website is designed to help you find the best tools and resources.
          </p>
        </section>

        {/* Additional sections would be added here */}
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="font-medium">privacy@promptaat.com</p>
        </section>
      </div>
    </div>
  );
}
