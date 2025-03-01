import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  {
    nameEn: "Content Creation",
    nameAr: "إنشاء المحتوى",
    iconName: "pen-tool",
    sortOrder: 1,
    subcategories: [
      { nameEn: "Blog Writing", nameAr: "كتابة المدونات" },
      { nameEn: "Social Media Posts", nameAr: "منشورات وسائل التواصل" },
      { nameEn: "Email Writing", nameAr: "كتابة البريد الإلكتروني" },
      { nameEn: "Product Descriptions", nameAr: "وصف المنتجات" },
      { nameEn: "Academic Writing", nameAr: "الكتابة الأكاديمية" },
      { nameEn: "Technical Writing", nameAr: "الكتابة التقنية" },
      { nameEn: "Creative Writing", nameAr: "الكتابة الإبداعية" },
      { nameEn: "Script Writing", nameAr: "كتابة السيناريو" },
    ],
  },
  {
    nameEn: "Business & Marketing",
    nameAr: "الأعمال والتسويق",
    iconName: "briefcase",
    sortOrder: 2,
    subcategories: [
      { nameEn: "Marketing Strategy", nameAr: "استراتيجية التسويق" },
      { nameEn: "Sales Copy", nameAr: "نصوص المبيعات" },
      { nameEn: "Brand Development", nameAr: "تطوير العلامة التجارية" },
      { nameEn: "Market Research", nameAr: "أبحاث السوق" },
      { nameEn: "Business Plans", nameAr: "خطط العمل" },
      { nameEn: "Customer Service", nameAr: "خدمة العملاء" },
      { nameEn: "Advertising", nameAr: "الإعلانات" },
    ],
  },
  {
    nameEn: "Programming & Development",
    nameAr: "البرمجة والتطوير",
    iconName: "code",
    sortOrder: 3,
    subcategories: [
      { nameEn: "Code Generation", nameAr: "توليد الكود" },
      { nameEn: "Code Review", nameAr: "مراجعة الكود" },
      { nameEn: "Bug Fixing", nameAr: "إصلاح الأخطاء" },
      { nameEn: "Documentation", nameAr: "التوثيق" },
      { nameEn: "Architecture Design", nameAr: "تصميم البنية" },
      { nameEn: "Testing", nameAr: "الاختبار" },
      { nameEn: "DevOps", nameAr: "عمليات التطوير" },
    ],
  },
  {
    nameEn: "Visual Arts",
    nameAr: "الفنون البصرية",
    iconName: "palette",
    sortOrder: 4,
    subcategories: [
      { nameEn: "Image Generation", nameAr: "توليد الصور" },
      { nameEn: "Art Direction", nameAr: "التوجيه الفني" },
      { nameEn: "Character Design", nameAr: "تصميم الشخصيات" },
      { nameEn: "Environment Design", nameAr: "تصميم البيئة" },
      { nameEn: "Logo Design", nameAr: "تصميم الشعارات" },
      { nameEn: "UI/UX Design", nameAr: "تصميم واجهة المستخدم" },
      { nameEn: "Animation", nameAr: "الرسوم المتحركة" },
    ],
  },
  {
    nameEn: "Education & Learning",
    nameAr: "التعليم والتعلم",
    iconName: "graduation-cap",
    sortOrder: 5,
    subcategories: [
      { nameEn: "Lesson Planning", nameAr: "تخطيط الدروس" },
      { nameEn: "Study Guides", nameAr: "أدلة الدراسة" },
      { nameEn: "Quiz Generation", nameAr: "توليد الاختبارات" },
      { nameEn: "Research Assistance", nameAr: "المساعدة في البحث" },
      { nameEn: "Language Learning", nameAr: "تعلم اللغات" },
      { nameEn: "Tutoring", nameAr: "التدريس الخصوصي" },
    ],
  },
  {
    nameEn: "Data & Analytics",
    nameAr: "البيانات والتحليلات",
    iconName: "bar-chart",
    sortOrder: 6,
    subcategories: [
      { nameEn: "Data Analysis", nameAr: "تحليل البيانات" },
      { nameEn: "Data Visualization", nameAr: "تصور البيانات" },
      { nameEn: "Statistical Analysis", nameAr: "التحليل الإحصائي" },
      { nameEn: "Machine Learning", nameAr: "التعلم الآلي" },
      { nameEn: "Business Intelligence", nameAr: "ذكاء الأعمال" },
      { nameEn: "Reporting", nameAr: "إعداد التقارير" },
    ],
  },
  {
    nameEn: "Personal Development",
    nameAr: "التطوير الشخصي",
    iconName: "user",
    sortOrder: 7,
    subcategories: [
      { nameEn: "Goal Setting", nameAr: "تحديد الأهداف" },
      { nameEn: "Career Development", nameAr: "التطوير المهني" },
      { nameEn: "Life Coaching", nameAr: "التدريب الحياتي" },
      { nameEn: "Productivity", nameAr: "الإنتاجية" },
      { nameEn: "Mental Health", nameAr: "الصحة النفسية" },
      { nameEn: "Time Management", nameAr: "إدارة الوقت" },
    ],
  },
  {
    nameEn: "Research & Analysis",
    nameAr: "البحث والتحليل",
    iconName: "microscope",
    sortOrder: 8,
    subcategories: [
      { nameEn: "Academic Research", nameAr: "البحث الأكاديمي" },
      { nameEn: "Market Analysis", nameAr: "تحليل السوق" },
      { nameEn: "Competitive Analysis", nameAr: "تحليل المنافسة" },
      { nameEn: "Literature Review", nameAr: "مراجعة الأدبيات" },
      { nameEn: "Trend Analysis", nameAr: "تحليل الاتجاهات" },
      { nameEn: "Scientific Writing", nameAr: "الكتابة العلمية" },
    ],
  },
  {
    nameEn: "Legal & Compliance",
    nameAr: "القانون والامتثال",
    iconName: "scale",
    sortOrder: 9,
    subcategories: [
      { nameEn: "Legal Writing", nameAr: "الكتابة القانونية" },
      { nameEn: "Contract Review", nameAr: "مراجعة العقود" },
      { nameEn: "Policy Generation", nameAr: "توليد السياسات" },
      { nameEn: "Compliance Checks", nameAr: "فحوصات الامتثال" },
      { nameEn: "Terms & Conditions", nameAr: "الشروط والأحكام" },
      { nameEn: "Privacy Policies", nameAr: "سياسات الخصوصية" },
    ],
  },
  {
    nameEn: "Entertainment & Media",
    nameAr: "الترفيه والإعلام",
    iconName: "film",
    sortOrder: 10,
    subcategories: [
      { nameEn: "Storytelling", nameAr: "رواية القصص" },
      { nameEn: "Game Design", nameAr: "تصميم الألعاب" },
      { nameEn: "Video Scripts", nameAr: "نصوص الفيديو" },
      { nameEn: "Podcast Scripts", nameAr: "نصوص البودكاست" },
      { nameEn: "Music Generation", nameAr: "توليد الموسيقى" },
      { nameEn: "Entertainment Writing", nameAr: "الكتابة الترفيهية" },
    ],
  },
]

const tools = [
  {
    name: 'ChatGPT',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'
  },
  {
    name: 'Claude',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Claude_%28AI%29_logo.svg'
  },
  {
    name: 'Gemini',
    iconUrl: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/gemini.max-1000x1000.png'
  },
  {
    name: 'Notion AI',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png'
  },
  {
    name: 'Bing AI',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Bing_Fluent_Logo.svg'
  },
  {
    name: 'Deepseek',
    iconUrl: 'https://www.deepseek.com/_next/static/media/logo.0ccb9c97.svg'
  }
]

async function main() {
  // Seed Categories
  console.log('Start seeding categories...')
  
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
          iconName: category.iconName,
          parentId: mainCategory.id,
          sortOrder: 0,
        },
      })
    }
    
    console.log(`Created subcategories for: ${category.nameEn}`)
  }
  
  // Seed Tools
  console.log('\nStart seeding tools...')
  
  for (const tool of tools) {
    const createdTool = await prisma.tool.create({
      data: tool
    })
    console.log(`Created tool: ${createdTool.name}`)
  }
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
