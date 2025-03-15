"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { BillingCycleToggle } from "@/app/[locale]/pricing/components/billing-cycle-toggle";
import { FeaturesList } from "@/app/[locale]/pricing/components/features-list";
import { PricingFAQ } from "@/app/[locale]/pricing/components/pricing-faq";
import { CheckoutButton } from "@/components/checkout/checkout-button";

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
      quarterly: 26.99,
      annual: 99.99
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
  }
];

export default function PricingPage() {
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  
  // State for billing cycle toggle
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "annual">("monthly");
  
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  // Handle subscription button click
  const handleSubscribe = (plan: "free" | "pro") => {
    if (!session) {
      // Redirect to login if not authenticated
      router.push(`/${locale}/auth/login?redirect=/pricing`);
      return;
    }
    
    if (plan === "free") {
      // For free plan, just redirect to home
      router.push(`/${locale}`);
      return;
    }
    
    // For pro plan, redirect to checkout
    router.push(`/${locale}/checkout?plan=${plan}&cycle=${billingCycle}`);
  };
  
  return (
    <div className="w-full">
      {/* Hero Section with elegant gradient background */}
      <div className={cn(
        "w-full text-center py-32 px-4 bg-gradient-to-b from-primary/20 via-primary/10 to-background",
        isRTL && "rtl"
      )}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            {t({ en: "Elevate Your AI Experience", ar: "ارتقِ بتجربة الذكاء الاصطناعي الخاصة بك" })}
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            {t({ 
              en: "Access premium prompts crafted by experts to unlock the full potential of AI for your projects", 
              ar: "الوصول إلى مطالبات متميزة صممها خبراء لإطلاق الإمكانات الكاملة للذكاء الاصطناعي لمشاريعك" 
            })}
          </p>
          
          {/* Billing Cycle Toggle */}
          <div className="mb-4">
            <BillingCycleToggle 
              value={billingCycle} 
              onChange={setBillingCycle}
              locale={locale}
              isRTL={isRTL}
            />
          </div>
        </div>
      </div>
      
      {/* Pricing Cards Section */}
      <div className={cn(
        "max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-10",
        isRTL && "rtl"
      )}>
        {/* Free Plan Card */}
        <div className="relative border rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 bg-card hover:border-muted">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-3">{t(pricingData.free.name)}</h3>
              <p className="text-sm text-muted-foreground mb-5">{t(pricingData.free.description)}</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{t({ en: "Free", ar: "مجاني" })}</span>
                <span className="text-muted-foreground ml-2 text-sm">{t({ en: "forever", ar: "للأبد" })}</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full py-6 text-base font-medium mb-10 hover:bg-primary/5"
            onClick={() => handleSubscribe("free")}
          >
            {t(pricingData.free.cta)}
          </Button>
          
          <div className="space-y-5">
            <h4 className="font-medium text-lg mb-4">{t({ en: "Includes:", ar: "يتضمن:" })}</h4>
            <ul className="space-y-4">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span className="text-sm">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Pro Plan Card */}
        <div className="relative border rounded-xl p-8 shadow-lg bg-card border-primary/20 hover:shadow-xl transition-all duration-300 hover:border-primary/30">
          <div className="absolute -top-3 right-6 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
            {t({ en: "POPULAR", ar: "الأكثر شعبية" })}
          </div>
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-3">{t(pricingData.pro.name)}</h3>
              <p className="text-sm text-muted-foreground mb-5">{t(pricingData.pro.description)}</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">${pricingData.pro.price[billingCycle]}</span>
                <span className="text-muted-foreground ml-2 text-sm">/{t({ en: "month", ar: "شهر" })}</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <CheckoutButton 
            plan="pro" 
            interval={billingCycle} 
            locale={locale}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-md"
          >
            {t(pricingData.pro.cta)}
          </CheckoutButton>
          
          <div className="space-y-5">
            <h4 className="font-medium text-lg mb-4">{t({ en: "Everything in Free, plus:", ar: "كل ما في المجاني، بالإضافة إلى:" })}</h4>
            <ul className="space-y-4">
              {features.pro.slice(1).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span className="text-sm">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Features Comparison Section */}
      <div className={cn(
        "max-w-6xl mx-auto px-4 py-20 bg-muted/30 rounded-xl my-16",
        isRTL && "rtl"
      )}>
        <h2 className="text-3xl font-bold text-center mb-12">{t({ en: "Compare Features", ar: "مقارنة الميزات" })}</h2>
        <FeaturesList locale={locale} isRTL={isRTL} />
      </div>
      
      {/* FAQ Section */}
      <div className={cn(
        "max-w-4xl mx-auto px-4 py-20",
        isRTL && "rtl"
      )}>
        <h2 className="text-3xl font-bold text-center mb-12">{t({ en: "Frequently Asked Questions", ar: "الأسئلة الشائعة" })}</h2>
        <PricingFAQ items={faqItems} locale={locale} isRTL={isRTL} />
      </div>
      
      {/* CTA Section */}
      <div className={cn(
        "w-full py-24 px-4 bg-gradient-to-b from-background to-primary/10 text-center",
        isRTL && "rtl"
      )}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            {t({ en: "Join Our Community of AI Enthusiasts", ar: "انضم إلى مجتمعنا من عشاق الذكاء الاصطناعي" })}
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            {t({ 
              en: "Thousands of users are already creating amazing content with our premium prompts", 
              ar: "الآلاف من المستخدمين ينشئون بالفعل محتوى مذهلاً باستخدام مطالباتنا المتميزة" 
            })}
          </p>
          <CheckoutButton 
            plan="pro" 
            interval={billingCycle} 
            locale={locale}
            className="px-10 py-7 text-lg font-medium bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-md"
          >
            {t({ en: "Upgrade to Pro Today", ar: "الترقية إلى الاحترافي اليوم" })}
          </CheckoutButton>
        </div>
      </div>
    </div>
  );
}
