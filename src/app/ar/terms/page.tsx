import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'شروط الخدمة | بروميتات',
  description: 'شروط وأحكام استخدام منصة بروميتات',
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6 rtl">
      <div className="mb-8">
        <Link href="/ar">
          <Button variant="ghost" className="pr-0 flex items-center gap-2 flex-row-reverse">
            <ArrowLeft size={16} className="rotate-180" />
            العودة إلى الصفحة الرئيسية
          </Button>
        </Link>
      </div>
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">شروط الخدمة</h1>
          <p className="text-muted-foreground mb-6">آخر تحديث: 3 مارس 2025</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. مقدمة</h2>
          <p>
            مرحباً بك في برومبتات (&ldquo;نحن,&rdquo; &ldquo;لدينا,&rdquo; أو &ldquo;لنا&rdquo;). تحكم شروط الخدمة هذه (&ldquo;الشروط&rdquo;) وصولك إلى واستخدام موقع برومبتات والخدمات والتطبيقات (مجتمعة، &ldquo;الخدمة&rdquo;).
          </p>
          <p>
            من خلال الوصول إلى خدمتنا أو استخدامها، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على أي جزء من الشروط، فقد لا تتمكن من الوصول إلى الخدمة.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. الحسابات</h2>
          <p>
            عند إنشاء حساب معنا، يجب عليك تقديم معلومات دقيقة وكاملة وحديثة. يشكل عدم القيام بذلك خرقًا للشروط، مما قد يؤدي إلى إنهاء حسابك فورًا.
          </p>
          <p>
            أنت مسؤول عن حماية كلمة المرور التي تستخدمها للوصول إلى الخدمة وعن أي أنشطة أو إجراءات تتم بموجب كلمة المرور الخاصة بك.
          </p>
        </section>

        {/* Additional sections would be added here */}
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">12. اتصل بنا</h2>
          <p>
            إذا كانت لديك أي أسئلة حول هذه الشروط، فيرجى الاتصال بنا على:
          </p>
          <p className="font-medium">support@promptaat.com</p>
        </section>
      </div>
    </div>
  );
}
