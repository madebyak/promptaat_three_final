"use client";

// Updated to use NEXT_PUBLIC environment variables for Stripe price IDs
// This ensures proper client-side access to these variables

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeaturesList } from "@/app/[locale]/pricing/components/features-list";
import { PricingFAQ } from "@/app/[locale]/pricing/components/pricing-faq";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import { PricingStructuredData } from "@/app/[locale]/pricing/components/pricing-seo";
import Image from "next/image";

// Pricing data
const pricingData = {
  free: {
    name: { en: "Free", ar: "مجاني" },
    description: { en: "Perfect for exploring AI prompt possibilities", ar: "مثالي لاستكشاف إمكانيات مطالبات الذكاء الاصطناعي" },
    cta: { en: "Get Started", ar: "ابدأ الآن" }
  },
  pro: {
    name: { en: "Pro", ar: "احترافي" },
    description: { en: "Unlock the full potential of AI prompts", ar: "أطلق العنان للإمكانات الكاملة لمطالبات الذكاء الاصطناعي" },
    price: {
      monthly: 9.99,
      quarterly: 24.99,
      annual: 69.99
    },
    monthlyEquivalent: {
      monthly: 9.99,
      quarterly: 8.33,
      annual: 5.83
    },
    savings: {
      monthly: 0,
      quarterly: 17,
      annual: 42
    },
    cta: { en: "Upgrade to Pro", ar: "الترقية إلى الاحترافي" }
  }
};

// Features
const features = {
  free: [
    { en: "Access to basic prompts", ar: "الوصول إلى المطالبات الأساسية" },
    { en: "Save favorites", ar: "حفظ المفضلة" },
    { en: "Share prompts", ar: "مشاركة المطالبات" },
    { en: "Community support", ar: "دعم المجتمع" }
  ],
  pro: [
    { en: "Everything in Free", ar: "كل ما في المجاني" },
    { en: "Access to all premium prompts", ar: "الوصول إلى جميع المطالبات المتميزة" },
    { en: "Early access to new prompts", ar: "وصول مبكر إلى المطالبات الجديدة" },
    { en: "Custom prompt requests", ar: "طلبات مطالبات مخصصة" },
    { en: "Priority support", ar: "دعم ذو أولوية" },
    { en: "No ads", ar: "بدون إعلانات" }
  ]
};

// FAQ items
const faqItems = [
  {
    question: {
      en: "How do I upgrade to Pro?",
      ar: "كيف أقوم بالترقية إلى الاحترافي؟"
    },
    answer: {
      en: "You can upgrade to Pro by clicking the 'Upgrade to Pro' button on the pricing page or in your account settings. You'll be guided through the payment process.",
      ar: "يمكنك الترقية إلى الاحترافي بالنقر على زر 'الترقية إلى الاحترافي' في صفحة التسعير أو في إعدادات حسابك. سيتم توجيهك خلال عملية الدفع."
    }
  },
  {
    question: {
      en: "Can I cancel my subscription anytime?",
      ar: "هل يمكنني إلغاء اشتراكي في أي وقت؟"
    },
    answer: {
      en: "Yes, you can cancel your subscription at any time from your account settings. Your Pro access will continue until the end of your current billing period.",
      ar: "نعم، يمكنك إلغاء اشتراكك في أي وقت من إعدادات حسابك. سيستمر وصولك إلى الاحترافي حتى نهاية فترة الفوترة الحالية."
    }
  },
  {
    question: {
      en: "What payment methods do you accept?",
      ar: "ما هي طرق الدفع التي تقبلونها؟"
    },
    answer: {
      en: "We accept all major credit cards, including Visa, Mastercard, and American Express. We also support payment through PayPal.",
      ar: "نقبل جميع بطاقات الائتمان الرئيسية، بما في ذلك Visa و Mastercard و American Express. كما ندعم الدفع من خلال PayPal."
    }
  },
  {
    question: {
      en: "Is there a free trial for Pro?",
      ar: "هل هناك فترة تجريبية مجانية للاحترافي؟"
    },
    answer: {
      en: "Currently, we don't offer a free trial for the Pro plan. However, you can start with the Free plan to explore our platform before upgrading.",
      ar: "حاليًا، لا نقدم فترة تجريبية مجانية للخطة الاحترافية. ومع ذلك، يمكنك البدء بالخطة المجانية لاستكشاف منصتنا قبل الترقية."
    }
  },
  {
    question: {
      en: "What happens when I upgrade my subscription?",
      ar: "ماذا يحدث عندما أقوم بترقية اشتراكي؟"
    },
    answer: {
      en: "When you upgrade, you'll immediately gain access to all Pro features. Your billing cycle will start on the day of your upgrade, and you'll be charged accordingly.",
      ar: "عند الترقية، ستحصل فورًا على إمكانية الوصول إلى جميع ميزات الاحترافي. ستبدأ دورة الفوترة الخاصة بك في يوم الترقية، وسيتم محاسبتك وفقًا لذلك."
    }
  },
  {
    question: {
      en: "Can I switch between billing cycles?",
      ar: "هل يمكنني التبديل بين دورات الفوترة؟"
    },
    answer: {
      en: "Yes, you can switch between monthly, quarterly, and annual billing cycles at any time. If you switch to a longer cycle, you'll benefit from the discounted rates immediately.",
      ar: "نعم، يمكنك التبديل بين دورات الفوترة الشهرية والربع سنوية والسنوية في أي وقت. إذا قمت بالتبديل إلى دورة أطول، ستستفيد من الأسعار المخفضة على الفور."
    }
  }
];

const PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY || "",
  quarterly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_QUARTERLY || "",
  annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL || "",
};

export default function PricingPage() {
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  // Generate pricing plans for SEO structured data
  const generatePricingPlans = () => {
    const baseUrl = 'https://promptaat.com';
    const pricingPlans = [
      {
        name: t(pricingData.free.name),
        price: 0,
        currency: 'USD',
        billingPeriod: '',
        description: t(pricingData.free.description),
        url: `${baseUrl}/${locale}/pricing`
      },
      {
        name: `${t(pricingData.pro.name)} ${t({ en: "Monthly", ar: "شهري" })}`,
        price: pricingData.pro.price.monthly,
        currency: 'USD',
        billingPeriod: 'P1M',
        description: t(pricingData.pro.description),
        url: `${baseUrl}/${locale}/pricing`
      },
      {
        name: `${t(pricingData.pro.name)} ${t({ en: "Quarterly", ar: "ربع سنوي" })}`,
        price: pricingData.pro.price.quarterly,
        currency: 'USD',
        billingPeriod: 'P3M',
        description: t(pricingData.pro.description),
        url: `${baseUrl}/${locale}/pricing`
      },
      {
        name: `${t(pricingData.pro.name)} ${t({ en: "Annual", ar: "سنوي" })}`,
        price: pricingData.pro.price.annual,
        currency: 'USD',
        billingPeriod: 'P1Y',
        description: t(pricingData.pro.description),
        url: `${baseUrl}/${locale}/pricing`
      }
    ];
    return pricingPlans;
  };
  
  // Handle subscription button click for free plan
  const handleFreeSubscribe = () => {
    if (!session) {
      // Redirect to login if not authenticated
      router.push(`/${locale}/auth/login?redirect=/pricing`);
      return;
    }
    
    // For free plan, just redirect to home
    router.push(`/${locale}`);
  };
  
  return (
    <div className="w-full">
      {/* SEO Structured Data */}
      <PricingStructuredData plans={generatePricingPlans()} locale={locale} />
      
      {/* Hero Section with banner image background */}
      <div className={cn(
        "w-full text-center py-16 px-4 relative overflow-hidden",
        isRTL && "rtl"
      )}>
        <div className="absolute inset-0 z-0 w-screen overflow-hidden">
          <Image 
            src="/pricing-banner.jpg" 
            alt="Pricing Banner" 
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white text-center">
            {t({ en: "Empowering Your AI Journey", ar: "تمكين رحلتك مع الذكاء الاصطناعي" })}
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed text-center">
            {t({ 
              en: "Fair, straightforward pricing designed to unleash your creativity. Invest in a plan that lets you focus on breakthrough ideas while our ready-to-use prompts do the heavy lifting.", 
              ar: "أسعار شفافة ومباشرة لتطلق إبداعك. اختر الخطة التي تتيح لك التركيز على الأفكار الثورية بينما تقوم موجهاتنا الجاهزة ببقية العمل." 
            })}
          </p>
        </div>
      </div>
      
      {/* Pricing Cards Section */}
      <div className={cn(
        "max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
        isRTL && "rtl"
      )}>
        {/* Free Plan Card */}
        <div className="relative border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 bg-card hover:border-muted h-full flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{t(pricingData.free.name)}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t(pricingData.free.description)}</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{t({ en: "Free", ar: "مجاني" })}</span>
                <span className="text-muted-foreground ml-2 text-sm">{t({ en: "forever", ar: "للأبد" })}</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="space-y-4 mb-6 flex-grow">
            <h4 className="font-medium text-base">{t({ en: "Includes:", ar: "يتضمن:" })}</h4>
            <ul className="space-y-3">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                  <span className="text-sm">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full py-5 text-base font-medium hover:bg-primary/5 mt-auto"
            onClick={handleFreeSubscribe}
          >
            {t(pricingData.free.cta)}
          </Button>
        </div>
        
        {/* Pro Monthly Plan Card */}
        <div className="relative border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 bg-card hover:border-primary/20 h-full flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{t(pricingData.pro.name)} {t({ en: "Monthly", ar: "شهري" })}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t(pricingData.pro.description)}</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">${pricingData.pro.price.monthly}</span>
                <span className="text-muted-foreground ml-2 text-sm">/{t({ en: "month", ar: "شهر" })}</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="space-y-4 mb-6 flex-grow">
            <h4 className="font-medium text-base">{t({ en: "Everything in Free, plus:", ar: "كل ما في المجاني، بالإضافة إلى:" })}</h4>
            <ul className="space-y-3">
              {features.pro.slice(1).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                  <span className="text-sm">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <CheckoutButton 
            priceId={PRICE_IDS.monthly}
            locale={locale}
            className="w-full py-5 text-base font-medium bg-gradient-to-r from-[#2b79ef] to-[#6d36f1] hover:opacity-90 shadow-md mt-auto"
          >
            {t(pricingData.pro.cta)}
          </CheckoutButton>
        </div>
        
        {/* Pro Quarterly Plan Card */}
        <div className="relative border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 bg-card hover:border-primary/20 h-full flex flex-col">
          <div className="absolute -top-3 right-6 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {t({ en: "SAVE 17%", ar: "وفر 17%" })}
          </div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{t(pricingData.pro.name)} {t({ en: "Quarterly", ar: "ربع سنوي" })}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t(pricingData.pro.description)}</p>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">${pricingData.pro.price.quarterly}</span>
                  <span className="text-muted-foreground ml-2 text-sm">/{t({ en: "quarter", ar: "ربع سنة" })}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  ${pricingData.pro.monthlyEquivalent.quarterly}/{t({ en: "month", ar: "شهر" })}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="space-y-4 mb-6 flex-grow">
            <h4 className="font-medium text-base">{t({ en: "Everything in Free, plus:", ar: "كل ما في المجاني، بالإضافة إلى:" })}</h4>
            <ul className="space-y-3">
              {features.pro.slice(1).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                  <span className="text-sm">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <CheckoutButton 
            priceId={PRICE_IDS.quarterly}
            locale={locale}
            className="w-full py-5 text-base font-medium bg-gradient-to-r from-[#2b79ef] to-[#6d36f1] hover:opacity-90 shadow-md mt-auto"
          >
            {t(pricingData.pro.cta)}
          </CheckoutButton>
        </div>
        
        {/* Pro Annual Plan Card */}
        <div className="relative border rounded-xl p-6 shadow-lg bg-card border-primary/20 hover:shadow-xl transition-all duration-300 hover:border-primary/30 h-full flex flex-col">
          <div className="absolute -top-3 right-6 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {t({ en: "SAVE 42%", ar: "وفر 42%" })}
          </div>
          
          <div className="absolute -top-3 left-6 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center">
            <Star className="w-3 h-3 mr-1" />
            {t({ en: "BEST VALUE", ar: "أفضل قيمة" })}
          </div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{t(pricingData.pro.name)} {t({ en: "Annual", ar: "سنوي" })}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t(pricingData.pro.description)}</p>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">${pricingData.pro.price.annual}</span>
                  <span className="text-muted-foreground ml-2 text-sm">/{t({ en: "year", ar: "سنة" })}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  ${pricingData.pro.monthlyEquivalent.annual}/{t({ en: "month", ar: "شهر" })}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-full bg-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="space-y-4 mb-6 flex-grow">
            <h4 className="font-medium text-base">{t({ en: "Everything in Free, plus:", ar: "كل ما في المجاني، بالإضافة إلى:" })}</h4>
            <ul className="space-y-3">
              {features.pro.slice(1).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                  <span className="text-sm">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <CheckoutButton 
            priceId={PRICE_IDS.annual}
            locale={locale}
            className="w-full py-5 text-base font-medium bg-gradient-to-r from-[#2b79ef] to-[#6d36f1] hover:opacity-90 shadow-md mt-auto"
          >
            {t(pricingData.pro.cta)}
          </CheckoutButton>
        </div>
      </div>
      
      {/* Features Comparison Section */}
      <div className={cn(
        "max-w-6xl mx-auto px-4 py-16 bg-muted/30 rounded-xl my-16",
        isRTL && "rtl"
      )}>
        <h2 className="text-3xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-[#2b79ef] to-[#6d36f1]">
          {t({ en: "Compare Features", ar: "مقارنة الميزات" })}
        </h2>
        <FeaturesList locale={locale} isRTL={isRTL} />
      </div>
      
      {/* Why Choose Pro Section */}
      <div className={cn(
        "max-w-6xl mx-auto px-4 py-16",
        isRTL && "rtl"
      )}>
        <h2 className="text-3xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-[#2b79ef] to-[#6d36f1]">
          {t({ en: "Why Choose Pro?", ar: "لماذا تختار الاحترافي؟" })}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          <div className="p-6 border rounded-xl bg-card hover:shadow-md transition-all duration-300">
            <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t({ en: "Premium Prompts", ar: "مطالبات متميزة" })}</h3>
            <p className="text-muted-foreground">
              {t({ 
                en: "Access our entire library of expert-crafted prompts to boost your AI productivity.", 
                ar: "الوصول إلى مكتبتنا الكاملة من المطالبات المصممة من قبل الخبراء لتعزيز إنتاجية الذكاء الاصطناعي الخاصة بك." 
              })}
            </p>
          </div>
          
          <div className="p-6 border rounded-xl bg-card hover:shadow-md transition-all duration-300">
            <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t({ en: "Early Access", ar: "وصول مبكر" })}</h3>
            <p className="text-muted-foreground">
              {t({ 
                en: "Be the first to try new prompts and features before they're available to everyone.", 
                ar: "كن أول من يجرب المطالبات والميزات الجديدة قبل أن تكون متاحة للجميع." 
              })}
            </p>
          </div>
          
          <div className="p-6 border rounded-xl bg-card hover:shadow-md transition-all duration-300">
            <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t({ en: "Priority Support", ar: "دعم ذو أولوية" })}</h3>
            <p className="text-muted-foreground">
              {t({ 
                en: "Get faster responses and dedicated assistance for all your questions and needs.", 
                ar: "احصل على ردود أسرع ومساعدة مخصصة لجميع أسئلتك واحتياجاتك." 
              })}
            </p>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className={cn(
        "max-w-4xl mx-auto px-4 py-16",
        isRTL && "rtl"
      )}>
        <h2 className="text-3xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-[#2b79ef] to-[#6d36f1]">
          {t({ en: "Frequently Asked Questions", ar: "الأسئلة الشائعة" })}
        </h2>
        <PricingFAQ items={faqItems} locale={locale} isRTL={isRTL} />
      </div>
      
      {/* CTA Section */}
      <div className={cn(
        "w-full py-20 px-4 bg-gradient-to-b from-background to-primary/10 text-center",
        isRTL && "rtl"
      )}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#2b79ef] to-[#6d36f1]">
            {t({ en: "Join Our Community of AI Enthusiasts", ar: "انضم إلى مجتمعنا من عشاق الذكاء الاصطناعي" })}
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t({ 
              en: "Thousands of users are already creating amazing content with our premium prompts", 
              ar: "الآلاف من المستخدمين ينشئون بالفعل محتوى مذهلاً باستخدام مطالباتنا المتميزة" 
            })}
          </p>
          <CheckoutButton 
            priceId={PRICE_IDS.annual}
            locale={locale}
            className="px-8 py-6 text-lg font-medium bg-gradient-to-r from-[#2b79ef] to-[#6d36f1] hover:opacity-90 shadow-md"
          >
            {t({ en: "Upgrade to Pro Today", ar: "الترقية إلى الاحترافي اليوم" })}
          </CheckoutButton>
        </div>
      </div>
    </div>
  );
}
