import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  {
    nameEn: "Writing",
    nameAr: "الكتابة",
    iconName: "pen-tool",
    sortOrder: 1,
    subcategories: [
      { nameEn: "Blog & Articles", nameAr: "المدونات والمقالات", iconName: "file-text" },
      { nameEn: "Copywriting", nameAr: "كتابة النصوص", iconName: "clipboard" },
      { nameEn: "Email Templates", nameAr: "قوالب البريد", iconName: "mail" },
      { nameEn: "Translation", nameAr: "الترجمة", iconName: "languages" },
      { nameEn: "Summarization", nameAr: "التلخيص", iconName: "list-collapse" },
      { nameEn: "Scripts", nameAr: "السيناريوهات", iconName: "clapperboard" },
      { nameEn: "Storytelling", nameAr: "سرد القصص", iconName: "book-open" },
      { nameEn: "Creative Writing", nameAr: "الكتابة الإبداعية", iconName: "sparkles" },
    ],
  },
  {
    nameEn: "Business",
    nameAr: "الأعمال",
    iconName: "briefcase",
    sortOrder: 2,
    subcategories: [
      { nameEn: "Pitch Decks", nameAr: "عروض تقديمية", iconName: "presentation" },
      { nameEn: "Business Plans", nameAr: "خطط الأعمال", iconName: "clipboard-check" },
      { nameEn: "Feasibility", nameAr: "دراسات الجدوى", iconName: "microscope" },
      { nameEn: "Market Analysis", nameAr: "تحليل السوق", iconName: "bar-chart" },
      { nameEn: "Strategy", nameAr: "الاستراتيجية", iconName: "target" },
      { nameEn: "Financial Reports", nameAr: "التقارير المالية", iconName: "file-spreadsheet" },
      { nameEn: "Business Models", nameAr: "نماذج الأعمال", iconName: "puzzle" },
    ],
  },
  {
    nameEn: "Design",
    nameAr: "التصميم",
    iconName: "palette",
    sortOrder: 3,
    subcategories: [
      { nameEn: "Graphic Design", nameAr: "التصميم الجرافيكي", iconName: "image" },
      { nameEn: "UI/UX", nameAr: "واجهة المستخدم", iconName: "layout" },
      { nameEn: "Branding", nameAr: "العلامة التجارية", iconName: "badge" },
      { nameEn: "Web & App", nameAr: "الويب والتطبيقات", iconName: "globe" },
      { nameEn: "Digital Art", nameAr: "الفن الرقمي", iconName: "brush" },
      { nameEn: "Logo Design", nameAr: "تصميم الشعارات", iconName: "shapes" },
      { nameEn: "Motion Graphics", nameAr: "الرسوم المتحركة", iconName: "video" },
    ],
  },
  {
    nameEn: "Marketing",
    nameAr: "التسويق",
    iconName: "megaphone",
    sortOrder: 4,
    subcategories: [
      { nameEn: "Content Creation", nameAr: "إنشاء المحتوى", iconName: "file-plus" },
      { nameEn: "Ad Campaigns", nameAr: "الحملات الإعلانية", iconName: "megaphone" },
      { nameEn: "Social Media", nameAr: "التواصل الاجتماعي", iconName: "share-2" },
      { nameEn: "SEO & SEM", nameAr: "تحسين البحث", iconName: "search" },
      { nameEn: "Email Marketing", nameAr: "التسويق بالبريد", iconName: "mail-open" },
      { nameEn: "Influencer", nameAr: "تسويق المؤثرين", iconName: "users" },
    ],
  },
  {
    nameEn: "Communication",
    nameAr: "التواصل",
    iconName: "message-square",
    sortOrder: 5,
    subcategories: [
      { nameEn: "Work Emails", nameAr: "بريد العمل", iconName: "mail" },
      { nameEn: "Personal Emails", nameAr: "البريد الشخصي", iconName: "mail-plus" },
      { nameEn: "Etiquette", nameAr: "آداب التواصل", iconName: "thumbs-up" },
      { nameEn: "Negotiation", nameAr: "التفاوض", iconName: "handshake" },
      { nameEn: "Tone & Style", nameAr: "النبرة والأسلوب", iconName: "music" },
    ],
  },
  {
    nameEn: "Social Media",
    nameAr: "التواصل الاجتماعي",
    iconName: "instagram",
    sortOrder: 6,
    subcategories: [
      { nameEn: "Captions", nameAr: "التعليقات", iconName: "quote" },
      { nameEn: "Engagement", nameAr: "التفاعل", iconName: "heart" },
      { nameEn: "Viral Content", nameAr: "المحتوى الفيروسي", iconName: "trending-up" },
      { nameEn: "Scheduling", nameAr: "الجدولة", iconName: "calendar" },
      { nameEn: "Visual Content", nameAr: "المحتوى المرئي", iconName: "image-plus" },
    ],
  },
  {
    nameEn: "Productivity",
    nameAr: "الإنتاجية",
    iconName: "clock",
    sortOrder: 7,
    subcategories: [
      { nameEn: "Task Management", nameAr: "إدارة المهام", iconName: "check-square" },
      { nameEn: "Meeting Notes", nameAr: "ملاحظات الاجتماعات", iconName: "clipboard-list" },
      { nameEn: "Automation", nameAr: "الأتمتة", iconName: "settings" },
      { nameEn: "Time Management", nameAr: "إدارة الوقت", iconName: "hourglass" },
      { nameEn: "Goal Setting", nameAr: "تحديد الأهداف", iconName: "target" },
    ],
  },
  {
    nameEn: "Development",
    nameAr: "التطوير",
    iconName: "code",
    sortOrder: 8,
    subcategories: [
      { nameEn: "Code & Debug", nameAr: "البرمجة والتصحيح", iconName: "bug" },
      { nameEn: "Algorithms", nameAr: "الخوارزميات", iconName: "git-branch" },
      { nameEn: "API Integration", nameAr: "تكامل API", iconName: "plug" },
      { nameEn: "Documentation", nameAr: "التوثيق", iconName: "file-text" },
      { nameEn: "Troubleshooting", nameAr: "حل المشكلات", iconName: "wrench" },
    ],
  },
  {
    nameEn: "Education",
    nameAr: "التعليم",
    iconName: "graduation-cap",
    sortOrder: 9,
    subcategories: [
      { nameEn: "Lesson Plans", nameAr: "خطط الدروس", iconName: "book" },
      { nameEn: "Quizzes & Exams", nameAr: "الاختبارات", iconName: "list-checks" },
      { nameEn: "Explanations", nameAr: "الشروحات", iconName: "lightbulb" },
      { nameEn: "Skill Building", nameAr: "بناء المهارات", iconName: "award" },
      { nameEn: "Learning Content", nameAr: "محتوى تعليمي", iconName: "file-text" },
    ],
  },
  {
    nameEn: "Finance",
    nameAr: "المالية",
    iconName: "dollar-sign",
    sortOrder: 10,
    subcategories: [
      { nameEn: "Financial Analysis", nameAr: "التحليل المالي", iconName: "line-chart" },
      { nameEn: "Investments", nameAr: "الاستثمارات", iconName: "trending-up" },
      { nameEn: "Risk Management", nameAr: "إدارة المخاطر", iconName: "shield" },
      { nameEn: "Crypto & Blockchain", nameAr: "العملات المشفرة", iconName: "bitcoin" },
      { nameEn: "Personal Finance", nameAr: "المالية الشخصية", iconName: "wallet" },
    ],
  },
  {
    nameEn: "Customer Support",
    nameAr: "دعم العملاء",
    iconName: "headphones",
    sortOrder: 11,
    subcategories: [
      { nameEn: "Response Templates", nameAr: "قوالب الردود", iconName: "message-square" },
      { nameEn: "FAQ Generation", nameAr: "الأسئلة الشائعة", iconName: "help-circle" },
      { nameEn: "Feedback Analysis", nameAr: "تحليل الملاحظات", iconName: "bar-chart-2" },
      { nameEn: "Sentiment Analysis", nameAr: "تحليل المشاعر", iconName: "activity" },
    ],
  },
  {
    nameEn: "Legal",
    nameAr: "القانون",
    iconName: "scale",
    sortOrder: 12,
    subcategories: [
      { nameEn: "Contracts", nameAr: "العقود", iconName: "file-signature" },
      { nameEn: "Compliance", nameAr: "الامتثال", iconName: "check-circle" },
      { nameEn: "Legal Documents", nameAr: "المستندات القانونية", iconName: "file-text" },
      { nameEn: "Regulations", nameAr: "اللوائح", iconName: "shield" },
    ],
  },
  {
    nameEn: "Entertainment",
    nameAr: "الترفيه",
    iconName: "gamepad-2",
    sortOrder: 13,
    subcategories: [
      { nameEn: "Stories & Scripts", nameAr: "القصص والسيناريوهات", iconName: "book" },
      { nameEn: "Game Design", nameAr: "تصميم الألعاب", iconName: "puzzle" },
      { nameEn: "Characters", nameAr: "الشخصيات", iconName: "user" },
      { nameEn: "Media Concepts", nameAr: "مفاهيم الوسائط", iconName: "film" },
    ],
  },
  {
    nameEn: "Career",
    nameAr: "المسار المهني",
    iconName: "briefcase",
    sortOrder: 14,
    subcategories: [
      { nameEn: "Resume & CV", nameAr: "السيرة الذاتية", iconName: "file-text" },
      { nameEn: "LinkedIn", nameAr: "لينكد إن", iconName: "linkedin" },
      { nameEn: "Career Advice", nameAr: "النصائح المهنية", iconName: "compass" },
      { nameEn: "Personal Brand", nameAr: "العلامة الشخصية", iconName: "user-check" },
      { nameEn: "Interviews", nameAr: "المقابلات", iconName: "users" },
    ],
  },
  {
    nameEn: "Real Estate",
    nameAr: "العقارات",
    iconName: "home",
    sortOrder: 15,
    subcategories: [
      { nameEn: "Property Listings", nameAr: "قوائم العقارات", iconName: "clipboard-list" },
      { nameEn: "Market Insights", nameAr: "رؤى السوق", iconName: "bar-chart" },
      { nameEn: "Design Concepts", nameAr: "مفاهيم التصميم", iconName: "layout" },
      { nameEn: "Construction", nameAr: "البناء", iconName: "hard-hat" },
      { nameEn: "Project Summaries", nameAr: "ملخصات المشاريع", iconName: "file-text" },
    ],
  },
]

async function seedNewCategories() {
  try {
    console.log('Start seeding new categories...')
    
    for (const category of categories) {
      const mainCategory = await prisma.category.create({
        data: {
          nameEn: category.nameEn,
          nameAr: category.nameAr,
          iconName: category.iconName,
          sortOrder: category.sortOrder,
        },
      })
      
      console.log(`Created main category: ${category.nameEn}`)
      
      for (const subcategory of category.subcategories) {
        await prisma.category.create({
          data: {
            nameEn: subcategory.nameEn,
            nameAr: subcategory.nameAr,
            iconName: subcategory.iconName,
            parentId: mainCategory.id,
            sortOrder: 0,
          },
        })
      }
      
      console.log(`Created subcategories for: ${category.nameEn}`)
    }
    
    console.log('Seeding new categories finished.')
  } catch (error) {
    console.error('Error seeding new categories:', error)
    throw error
  }
}

export { seedNewCategories }
