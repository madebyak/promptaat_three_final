'use client'

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronRightIcon } from 'lucide-react'

interface FaqAccordionProps {
  locale: string
}

// FAQ item interface
interface FaqItem {
  id: string
  questionEn: string
  questionAr: string
  answerEn: string
  answerAr: string
}

// FAQ category interface
interface FaqCategory {
  key: string
  labelEn: string
  labelAr: string
  items: FaqItem[]
}

export default function FaqAccordion({ locale }: FaqAccordionProps) {
  const isRTL = locale === 'ar'
  // Using defaultValue from Tabs component instead of state to fix lint error
  
  // Generate FAQ data - in a real application, this would come from a CMS or API
  const faqCategories: FaqCategory[] = [
    {
      key: 'general',
      labelEn: 'General Questions',
      labelAr: 'أسئلة عامة',
      items: [
        {
          id: 'what-is-promptaat',
          questionEn: 'What is Promptaat?',
          questionAr: 'ما هو بروميتات؟',
          answerEn: 'Promptaat is an AI prompt marketplace and management platform that helps users create, discover, and share effective prompts for various AI models. Our platform makes AI more accessible by providing tools and resources for optimizing AI interactions.',
          answerAr: 'بروميتات هو سوق لإدارة ومشاركة الإرشادات الذكية (البرومبتس) التي تساعد المستخدمين على إنشاء واكتشاف ومشاركة إرشادات فعالة لمختلف نماذج الذكاء الاصطناعي. تجعل منصتنا الذكاء الاصطناعي أكثر سهولة من خلال توفير أدوات وموارد لتحسين التفاعلات مع الذكاء الاصطناعي.'
        },
        {
          id: 'who-can-use',
          questionEn: 'Who can use Promptaat?',
          questionAr: 'من يمكنه استخدام بروميتات؟',
          answerEn: 'Promptaat is designed for everyone from beginners to AI professionals. Whether you\'re a student, content creator, business professional, or developer, our platform offers tools and resources to help you make the most of AI technology.',
          answerAr: 'تم تصميم بروميتات للجميع، من المبتدئين إلى محترفي الذكاء الاصطناعي. سواء كنت طالبًا أو منشئ محتوى أو محترفًا في مجال الأعمال أو مطورًا، توفر منصتنا أدوات وموارد لمساعدتك على الاستفادة القصوى من تقنية الذكاء الاصطناعي.'
        },
        {
          id: 'languages-supported',
          questionEn: 'What languages does Promptaat support?',
          questionAr: 'ما هي اللغات التي يدعمها بروميتات؟',
          answerEn: 'Promptaat currently supports English and Arabic languages for the interface. The prompts themselves can be in any language supported by the underlying AI models.',
          answerAr: 'يدعم بروميتات حاليًا اللغتين الإنجليزية والعربية للواجهة. يمكن أن تكون الإرشادات نفسها بأي لغة تدعمها نماذج الذكاء الاصطناعي الأساسية.'
        }
      ]
    },
    {
      key: 'account',
      labelEn: 'Account & Profile',
      labelAr: 'الحساب والملف الشخصي',
      items: [
        {
          id: 'create-account',
          questionEn: 'How do I create an account?',
          questionAr: 'كيف أنشئ حسابًا؟',
          answerEn: 'To create a Promptaat account, click on the "Sign Up" button in the top right corner of the homepage. You can register using your email address, Google account, or other supported authentication methods. Follow the instructions to complete your profile setup.',
          answerAr: 'لإنشاء حساب في بروميتات، انقر على زر "التسجيل" في الزاوية العلوية اليمنى من الصفحة الرئيسية. يمكنك التسجيل باستخدام عنوان بريدك الإلكتروني أو حساب Google أو طرق المصادقة الأخرى المدعومة. اتبع التعليمات لإكمال إعداد ملفك الشخصي.'
        },
        {
          id: 'forgot-password',
          questionEn: 'I forgot my password. How can I reset it?',
          questionAr: 'نسيت كلمة المرور. كيف يمكنني إعادة تعيينها؟',
          answerEn: 'If you forgot your password, click on the "Log In" button, then select "Forgot Password." Enter your email address, and we\'ll send you a link to reset your password. Check your email (including spam folder) and follow the instructions in the reset email.',
          answerAr: 'إذا نسيت كلمة المرور الخاصة بك، انقر على زر "تسجيل الدخول"، ثم حدد "نسيت كلمة المرور". أدخل عنوان بريدك الإلكتروني، وسنرسل لك رابطًا لإعادة تعيين كلمة المرور. تحقق من بريدك الإلكتروني (بما في ذلك مجلد البريد العشوائي) واتبع التعليمات الموجودة في رسالة إعادة التعيين.'
        },
        {
          id: 'delete-account',
          questionEn: 'How do I delete my account?',
          questionAr: 'كيف أحذف حسابي؟',
          answerEn: 'To delete your Promptaat account, go to your "Account Settings" page, scroll down to the bottom, and click on "Delete Account." Follow the confirmation steps to permanently delete your account. Note that this action cannot be undone, and all your data will be removed from our systems.',
          answerAr: 'لحذف حسابك في بروميتات، انتقل إلى صفحة "إعدادات الحساب"، قم بالتمرير لأسفل إلى أسفل الصفحة، وانقر على "حذف الحساب". اتبع خطوات التأكيد لحذف حسابك بشكل دائم. لاحظ أنه لا يمكن التراجع عن هذا الإجراء، وستتم إزالة جميع بياناتك من أنظمتنا.'
        }
      ]
    },
    {
      key: 'features',
      labelEn: 'Features & Functionality',
      labelAr: 'الميزات والوظائف',
      items: [
        {
          id: 'available-features',
          questionEn: 'What features are available on Promptaat?',
          questionAr: 'ما هي الميزات المتاحة في بروميتات؟',
          answerEn: 'Promptaat offers a range of features including prompt creation and editing, prompt marketplace, collections, prompt testing, AI model integration, analytics, and more. Our platform is constantly evolving with new features to enhance your AI experience.',
          answerAr: 'يقدم بروميتات مجموعة من الميزات بما في ذلك إنشاء وتحرير الإرشادات، سوق الإرشادات، المجموعات، اختبار الإرشادات، تكامل نماذج الذكاء الاصطناعي، التحليلات، والمزيد. تتطور منصتنا باستمرار بميزات جديدة لتحسين تجربة الذكاء الاصطناعي الخاصة بك.'
        },
        {
          id: 'prompt-marketplace',
          questionEn: 'How does the prompt marketplace work?',
          questionAr: 'كيف يعمل سوق الإرشادات؟',
          answerEn: 'The prompt marketplace allows users to discover, purchase, and sell effective prompts. You can browse categories, read reviews, and preview prompts before making a purchase. As a creator, you can publish your own prompts and earn from each sale.',
          answerAr: 'يتيح سوق الإرشادات للمستخدمين اكتشاف وشراء وبيع الإرشادات الفعالة. يمكنك تصفح الفئات وقراءة المراجعات ومعاينة الإرشادات قبل إجراء عملية شراء. كمنشئ، يمكنك نشر إرشاداتك الخاصة وكسب المال من كل عملية بيع.'
        },
        {
          id: 'create-prompts',
          questionEn: 'Can I create my own prompts?',
          questionAr: 'هل يمكنني إنشاء إرشاداتي الخاصة؟',
          answerEn: 'Yes! Promptaat provides tools for creating, editing, and testing your own prompts. You can use our prompt editor with built-in optimization suggestions, test with various AI models, and organize your prompts into collections. You can keep them private or publish them to the marketplace.',
          answerAr: 'نعم! يوفر بروميتات أدوات لإنشاء وتحرير واختبار إرشاداتك الخاصة. يمكنك استخدام محرر الإرشادات الخاص بنا مع اقتراحات التحسين المدمجة، واختبارها مع نماذج الذكاء الاصطناعي المختلفة، وتنظيم إرشاداتك في مجموعات. يمكنك الاحتفاظ بها خاصة أو نشرها في السوق.'
        }
      ]
    },
    {
      key: 'pricing',
      labelEn: 'Pricing & Subscriptions',
      labelAr: 'الأسعار والاشتراكات',
      items: [
        {
          id: 'subscription-plans',
          questionEn: 'What subscription plans does Promptaat offer?',
          questionAr: 'ما هي خطط الاشتراك التي يقدمها بروميتات؟',
          answerEn: 'Promptaat offers several subscription tiers: Free, Basic, Premium, and Enterprise. Each tier provides different levels of access to features, prompt credits, and marketplace benefits. You can view detailed plan information on our Pricing page.',
          answerAr: 'يقدم بروميتات العديد من مستويات الاشتراك: المجاني، الأساسي، المميز، والمؤسسات. يوفر كل مستوى درجات مختلفة من الوصول إلى الميزات، ورصيد الإرشادات، ومزايا السوق. يمكنك عرض معلومات مفصلة عن الخطط على صفحة التسعير لدينا.'
        },
        {
          id: 'free-vs-premium',
          questionEn: 'What\'s the difference between free and premium accounts?',
          questionAr: 'ما هو الفرق بين الحسابات المجانية والمميزة؟',
          answerEn: 'Free accounts can access basic prompt creation tools and limited marketplace features. Premium accounts unlock additional benefits including more prompt credits, advanced editing tools, analytics, priority support, and the ability to sell prompts with lower platform fees.',
          answerAr: 'يمكن للحسابات المجانية الوصول إلى أدوات إنشاء الإرشادات الأساسية وميزات السوق المحدودة. تفتح الحسابات المميزة مزايا إضافية بما في ذلك المزيد من رصيد الإرشادات، وأدوات التحرير المتقدمة، والتحليلات، ودعم ذو أولوية، والقدرة على بيع الإرشادات برسوم منصة أقل.'
        },
        {
          id: 'payment-methods',
          questionEn: 'What payment methods are accepted?',
          questionAr: 'ما هي طرق الدفع المقبولة؟',
          answerEn: 'Promptaat accepts major credit cards (Visa, Mastercard, American Express), PayPal, and select regional payment methods. For Enterprise plans, we also support invoice-based payments and bank transfers.',
          answerAr: 'يقبل بروميتات بطاقات الائتمان الرئيسية (فيزا، ماستركارد، أمريكان إكسبريس)، باي بال، وطرق الدفع الإقليمية المحددة. بالنسبة لخطط المؤسسات، ندعم أيضًا المدفوعات القائمة على الفواتير والتحويلات المصرفية.'
        },
        {
          id: 'cancel-subscription',
          questionEn: 'How do I cancel my subscription?',
          questionAr: 'كيف يمكنني إلغاء اشتراكي؟',
          answerEn: 'To cancel your subscription, go to "Account Settings" > "Subscription" and click on "Cancel Subscription." You can continue using your premium features until the end of your current billing period. We don\'t offer prorated refunds for partial billing periods.',
          answerAr: 'لإلغاء اشتراكك، انتقل إلى "إعدادات الحساب" > "الاشتراك" وانقر على "إلغاء الاشتراك". يمكنك الاستمرار في استخدام الميزات المميزة حتى نهاية فترة الفوترة الحالية. نحن لا نقدم استردادًا نسبيًا لفترات الفوترة الجزئية.'
        }
      ]
    },
    {
      key: 'security',
      labelEn: 'Security & Privacy',
      labelAr: 'الأمان والخصوصية',
      items: [
        {
          id: 'data-protection',
          questionEn: 'How does Promptaat protect my data?',
          questionAr: 'كيف يحمي بروميتات بياناتي؟',
          answerEn: 'Promptaat uses industry-standard encryption and security practices to protect your data. We employ secure authentication methods, regular security audits, and strict access controls. Your personal information is never sold to third parties, and we only use it as described in our Privacy Policy.',
          answerAr: 'يستخدم بروميتات تشفيرًا وممارسات أمنية بمعايير الصناعة لحماية بياناتك. نحن نستخدم طرق مصادقة آمنة، وتدقيقات أمنية منتظمة، وضوابط وصول صارمة. لا يتم بيع معلوماتك الشخصية أبدًا لأطراف ثالثة، ونحن نستخدمها فقط كما هو موضح في سياسة الخصوصية لدينا.'
        },
        {
          id: 'prompt-ownership',
          questionEn: 'Who owns the prompts I create?',
          questionAr: 'من يملك الإرشادات التي أنشأتها؟',
          answerEn: 'You retain full ownership of the prompts you create on Promptaat. When you publish a prompt to the marketplace, you grant us a license to display and distribute it, but the intellectual property remains yours. Private prompts are never accessed by our team unless explicitly granted permission for support purposes.',
          answerAr: 'تحتفظ بالملكية الكاملة للإرشادات التي تنشئها على بروميتات. عندما تنشر إرشادًا في السوق، فإنك تمنحنا ترخيصًا لعرضه وتوزيعه، ولكن الملكية الفكرية تبقى لك. لا يتم الوصول إلى الإرشادات الخاصة من قبل فريقنا ما لم يتم منح إذن صريح لأغراض الدعم.'
        },
        {
          id: 'data-collection',
          questionEn: 'What data does Promptaat collect about me?',
          questionAr: 'ما هي البيانات التي يجمعها بروميتات عني؟',
          answerEn: 'Promptaat collects account information (email, name), usage data (features used, prompts created), and technical information (browser type, IP address). We use this information to provide and improve our services, personalize your experience, and troubleshoot issues. You can review and manage your data collection preferences in your Account Settings.',
          answerAr: 'يجمع بروميتات معلومات الحساب (البريد الإلكتروني، الاسم)، وبيانات الاستخدام (الميزات المستخدمة، الإرشادات المنشأة)، والمعلومات التقنية (نوع المتصفح، عنوان IP). نستخدم هذه المعلومات لتقديم وتحسين خدماتنا، وتخصيص تجربتك، وحل المشكلات. يمكنك مراجعة وإدارة تفضيلات جمع البيانات الخاصة بك في إعدادات حسابك.'
        },
        {
          id: 'compliance',
          questionEn: 'Is Promptaat compliant with privacy regulations?',
          questionAr: 'هل يتوافق بروميتات مع لوائح الخصوصية؟',
          answerEn: 'Yes, Promptaat is compliant with major privacy regulations including GDPR (Europe), CCPA (California), and other applicable regional privacy laws. We provide data export and deletion options, honor "Do Not Sell" requests, and maintain detailed records of our data processing activities.',
          answerAr: 'نعم، يتوافق بروميتات مع لوائح الخصوصية الرئيسية بما في ذلك اللائحة العامة لحماية البيانات (أوروبا)، وقانون خصوصية المستهلك في كاليفورنيا، وغيرها من قوانين الخصوصية الإقليمية المعمول بها. نحن نوفر خيارات تصدير وحذف البيانات، ونحترم طلبات "عدم البيع"، ونحتفظ بسجلات مفصلة لأنشطة معالجة البيانات لدينا.'
        }
      ]
    }
  ]
  
  // Add marketplace & payments category
  const marketplaceCategory: FaqCategory = {
    key: 'marketplace',
    labelEn: 'Marketplace & Payments',
    labelAr: 'السوق والمدفوعات',
    items: [
      {
        id: 'creator-revenue',
        questionEn: 'How does revenue sharing work for prompt creators?',
        questionAr: 'كيف تعمل مشاركة الإيرادات لمنشئي الإرشادات؟',
        answerEn: 'Promptaat uses a fair revenue sharing model where creators receive 70-85% of each sale, depending on their subscription tier. Premium subscribers receive higher revenue shares. Payments are processed at the end of each month once you reach the minimum payout threshold of $20.',
        answerAr: 'يستخدم بروميتات نموذجًا عادلًا لمشاركة الإيرادات حيث يتلقى المنشئون 70-85% من كل عملية بيع، اعتمادًا على مستوى اشتراكهم. يحصل المشتركون المميزون على حصص إيرادات أعلى. تتم معالجة المدفوعات في نهاية كل شهر بمجرد وصولك إلى الحد الأدنى للدفع وهو 20 دولارًا.'
      },
      {
        id: 'payment-processing',
        questionEn: 'How do I get paid for my prompt sales?',
        questionAr: 'كيف أحصل على أموال مبيعات الإرشادات الخاصة بي؟',
        answerEn: 'You can set up your preferred payment method in your Account Settings under "Payments." We support PayPal, direct bank transfers (in select countries), and Stripe payouts. Once you reach the minimum payout threshold, we automatically process your payment at the end of the billing cycle.',
        answerAr: 'يمكنك إعداد طريقة الدفع المفضلة لديك في إعدادات حسابك ضمن "المدفوعات". نحن ندعم باي بال، والتحويلات المصرفية المباشرة (في بلدان محددة)، ومدفوعات سترايب. بمجرد وصولك إلى الحد الأدنى للدفع، نقوم تلقائيًا بمعالجة دفعتك في نهاية دورة الفوترة.'
      },
      {
        id: 'prompt-guidelines',
        questionEn: 'What are the guidelines for publishing prompts?',
        questionAr: 'ما هي إرشادات نشر البرومبتس؟',
        answerEn: 'All prompts must comply with our Content Guidelines. They should be original work, not violate any copyrights, and be free from harmful, offensive, or illegal content. Prompts must also be properly categorized, accurately described, and include appropriate tags and sample outputs for preview.',
        answerAr: 'يجب أن تتوافق جميع الإرشادات مع إرشادات المحتوى لدينا. يجب أن تكون عملًا أصليًا، ولا تنتهك أي حقوق نشر، وتكون خالية من المحتوى الضار أو المسيء أو غير القانوني. يجب أيضًا تصنيف الإرشادات بشكل صحيح، ووصفها بدقة، وتضمين العلامات المناسبة وعينات المخرجات للمعاينة.'
      },
      {
        id: 'marketplace-dispute',
        questionEn: 'How are disputes handled in the marketplace?',
        questionAr: 'كيف يتم التعامل مع النزاعات في السوق؟',
        answerEn: 'If you encounter an issue with a purchased prompt, you can report it through the "Report Issue" button on the prompt page. Our support team will review your request within 48 hours. For eligible cases, we offer refunds or replacement options in accordance with our Marketplace Policy.',
        answerAr: 'إذا واجهت مشكلة مع إرشاد تم شراؤه، يمكنك الإبلاغ عنها من خلال زر "الإبلاغ عن مشكلة" في صفحة الإرشاد. سيقوم فريق الدعم لدينا بمراجعة طلبك في غضون 48 ساعة. بالنسبة للحالات المؤهلة، نقدم خيارات استرداد أو استبدال وفقًا لسياسة السوق لدينا.'
      }
    ]
  };
  
  // Add technical support category
  const supportCategory: FaqCategory = {
    key: 'support',
    labelEn: 'Technical Support',
    labelAr: 'الدعم الفني',
    items: [
      {
        id: 'get-help',
        questionEn: 'How do I get technical support?',
        questionAr: 'كيف يمكنني الحصول على الدعم الفني؟',
        answerEn: 'You can reach our technical support team through the "Help" section in your account dashboard, by clicking on the chat widget in the bottom right corner of any page, or by emailing support@promptaat.com. Premium subscribers receive priority support with faster response times.',
        answerAr: 'يمكنك الوصول إلى فريق الدعم الفني لدينا من خلال قسم "المساعدة" في لوحة تحكم حسابك، أو بالنقر على أداة الدردشة في الزاوية السفلية اليمنى من أي صفحة، أو عن طريق إرسال بريد إلكتروني إلى support@promptaat.com. يحصل المشتركون المميزون على دعم ذي أولوية مع أوقات استجابة أسرع.'
      },
      {
        id: 'common-issues',
        questionEn: 'What are some common issues and their solutions?',
        questionAr: 'ما هي بعض المشكلات الشائعة وحلولها؟',
        answerEn: 'Common issues include login problems (try clearing cookies or using a different browser), prompt generation errors (check your API key settings or connection), and marketplace browsing issues (try refreshing or clearing cache). Our Help Center at help.promptaat.com has detailed troubleshooting guides for these and other issues.',
        answerAr: 'تشمل المشكلات الشائعة مشاكل تسجيل الدخول (جرب مسح ملفات تعريف الارتباط أو استخدام متصفح مختلف)، وأخطاء إنشاء الإرشادات (تحقق من إعدادات مفتاح API أو الاتصال)، ومشاكل تصفح السوق (حاول التحديث أو مسح ذاكرة التخزين المؤقت). يحتوي مركز المساعدة لدينا على help.promptaat.com على أدلة استكشاف الأخطاء وإصلاحها المفصلة لهذه المشكلات وغيرها.'
      },
      {
        id: 'platform-compatibility',
        questionEn: 'Which platforms and browsers does Promptaat support?',
        questionAr: 'ما هي المنصات والمتصفحات التي يدعمها بروميتات؟',
        answerEn: 'Promptaat is optimized for modern browsers including Chrome, Firefox, Safari, and Edge. We support desktop, tablet, and mobile devices with responsive design. For the best experience, we recommend using the latest version of your preferred browser. Our mobile apps for iOS and Android are also available for download.',
        answerAr: 'تم تحسين بروميتات للمتصفحات الحديثة بما في ذلك كروم وفايرفوكس وسفاري وإيدج. نحن ندعم أجهزة سطح المكتب والأجهزة اللوحية والمحمولة بتصميم متجاوب. للحصول على أفضل تجربة، نوصي باستخدام أحدث إصدار من المتصفح المفضل لديك. تطبيقاتنا المحمولة لنظامي iOS وAndroid متاحة أيضًا للتنزيل.'
      },
      {
        id: 'api-integration',
        questionEn: 'Does Promptaat offer API integration for developers?',
        questionAr: 'هل يقدم بروميتات تكامل API للمطورين؟',
        answerEn: 'Yes, Promptaat offers a developer API that allows you to integrate our prompt marketplace and management tools into your own applications. API access is available for Premium and Enterprise subscribers. Visit our Developer Portal at developers.promptaat.com for documentation, SDKs, and integration examples.',
        answerAr: 'نعم، يقدم بروميتات واجهة برمجة تطبيقات للمطورين تتيح لك دمج سوق الإرشادات وأدوات الإدارة لدينا في تطبيقاتك الخاصة. يتوفر الوصول إلى API للمشتركين المميزين ومشتركي المؤسسات. قم بزيارة بوابة المطورين لدينا على developers.promptaat.com للحصول على الوثائق ومجموعات تطوير البرمجيات وأمثلة التكامل.'
      }
    ]
  };
  
  // Add all categories
  faqCategories.push(marketplaceCategory, supportCategory);
  
  // Render the FAQ accordion with tab navigation
  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black-main">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-8 flex w-full overflow-x-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-md">
            {faqCategories.map((category) => (
              <TabsTrigger 
                key={category.key}
                value={category.key}
                id={`tab-${category.key}`}
                className={`flex-1 whitespace-nowrap ${isRTL ? 'rtl:text-right' : 'ltr:text-left'}`}
              >
                {isRTL ? category.labelAr : category.labelEn}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Generate TabsContent for each category */}
          {faqCategories.map((category) => (
            <TabsContent key={category.key} value={category.key} id={`faq-${category.key}`}>
              <div className="bg-white dark:bg-black-main rounded-lg shadow-sm">
                <h2 className="sr-only">{isRTL ? category.labelAr : category.labelEn}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger
                        data-faq-question={isRTL ? item.questionAr : item.questionEn}
                        className={`text-lg font-medium ${isRTL ? 'text-right' : 'text-left'} py-5 px-4 hover:bg-light-grey-light dark:hover:bg-gray-900/50 rounded-t-lg transition-all`}
                      >
                        <div className="flex items-center w-full">
                          <ChevronRightIcon className={`flex-shrink-0 ${isRTL ? 'ml-3 rtl:rotate-180' : 'mr-3'} h-5 w-5 text-accent-purple transition-transform`} />
                          <span className={`${isRTL ? 'mr-auto text-right' : 'ml-0 text-left'} flex-1`}>
                            {isRTL ? item.questionAr : item.questionEn}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className={`text-gray-600 dark:text-gray-300 p-4 ${isRTL ? 'text-right' : 'text-left'} border-t border-gray-200 dark:border-gray-700`}>
                        {isRTL ? item.answerAr : item.answerEn}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
