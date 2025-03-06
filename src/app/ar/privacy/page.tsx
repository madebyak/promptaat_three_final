import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | بروميتات',
  description: 'سياسة الخصوصية لمنصة بروميتات',
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold mb-4">سياسة الخصوصية</h1>
          <p className="text-muted-foreground mb-6">آخر تحديث: 3 مارس 2025</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. مقدمة</h2>
          <p>
            مرحباً بك في برومبتات (&ldquo;نحن,&rdquo; &ldquo;لدينا,&rdquo; أو &ldquo;لنا&rdquo;). تشرح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية.
          </p>
          <p>
            نحتفظ بالحق في إجراء تغييرات على سياسة الخصوصية هذه في أي وقت ولأي سبب. سنقوم بتنبيهك بأي تغييرات من خلال تحديث تاريخ "آخر تحديث" لسياسة الخصوصية هذه. نشجعك على مراجعة سياسة الخصوصية هذه بشكل دوري للبقاء على اطلاع بالتحديثات.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. جمع معلوماتك</h2>
          <p>
            قد نجمع معلومات عنك بطرق متنوعة. قد تتضمن المعلومات التي قد نجمعها عبر الخدمة ما يلي:
          </p>
          
          <h3 className="text-xl font-medium mt-4">البيانات الشخصية</h3>
          <p>
            المعلومات التي تحدد هويتك شخصيًا، مثل اسمك وعنوان بريدك الإلكتروني ورقم هاتفك والمعلومات الديموغرافية التي تقدمها لنا طواعية عند التسجيل في الخدمة.
          </p>
          
          <h3 className="text-xl font-medium mt-4">البيانات المشتقة</h3>
          <p>
            المعلومات التي تجمعها خوادمنا تلقائيًا عند الوصول إلى الخدمة، مثل عنوان IP الخاص بك ونوع متصفحك ونظام التشغيل الخاص بك وأوقات الوصول والصفحات التي شاهدتها.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. استخدام معلوماتك</h2>
          <p className="mb-4">
            تم تصميم موقع &quot;بروبتات&quot; لمساعدتك في العثور على أفضل الأدوات والموارد.
          </p>
        </section>

        {/* Additional sections would be added here */}
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. اتصل بنا</h2>
          <p>
            إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، فيرجى الاتصال بنا على:
          </p>
          <p className="font-medium">privacy@promptaat.com</p>
        </section>
      </div>
    </div>
  );
}
