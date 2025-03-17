import { Metadata } from 'next'
import { prisma } from '@/lib/db'

interface GenerateMetadataProps {
  params: { 
    locale: string
    categoryId: string 
  }
}

/**
 * Generate dynamic SEO metadata for category pages
 * This fetches the actual category data to create optimized, content-specific metadata
 */
export async function generateMetadata(
  { params }: GenerateMetadataProps
): Promise<Metadata> {
  const { locale, categoryId } = params
  const isArabic = locale === 'ar'
  
  // Fetch the category data to use in metadata
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })
    
    if (!category) {
      // Fallback metadata if category not found
      return {
        title: isArabic ? 'فئة غير موجودة | برومبتات' : 'Category Not Found | Promptaat',
        description: isArabic 
          ? 'عذراً، الفئة التي تبحث عنها غير موجودة.' 
          : 'Sorry, the category you are looking for does not exist.',
      }
    }
    
    // Get category name based on locale
    const categoryName = isArabic ? category.nameAr : category.nameEn
    
    // Base metadata that's common across locales
    const baseMetadata = {
      metadataBase: new URL('https://promptaat.com'),
      alternates: {
        canonical: `/${locale}/category/${categoryId}`,
        languages: {
          'en': `/en/category/${categoryId}`,
          'ar': `/ar/category/${categoryId}`,
        },
      },
    }
    
    // Construct optimized descriptions based on category
    const descriptionEn = `Browse the best ${categoryName} AI prompts at Promptaat. Find expertly crafted prompts for ChatGPT, Gemini, and Claude to enhance your ${categoryName.toLowerCase()} tasks and workflows.`
    const descriptionAr = `تصفح أفضل بروبتات الذكاء الاصطناعي لـ ${categoryName} في برومبتات. جد بروبتات مصممة بعناية لـ ChatGPT وGemini وClaude لتحسين مهامك وسير عملك في ${categoryName}.`
    
    // Locale-specific metadata
    if (isArabic) {
      return {
        ...baseMetadata,
        title: `${categoryName} | برومبتات`,
        description: descriptionAr,
        keywords: [
          `بروبتات ${categoryName}`, 
          'بروبتات الذكاء الاصطناعي', 
          'شات جي بي تي', 
          'جيميني', 
          'كلود'
        ],
        openGraph: {
          title: `${categoryName} | برومبتات`,
          description: descriptionAr,
          locale: 'ar_SA',
          type: 'website',
          url: `https://promptaat.com/ar/category/${categoryId}`,
          siteName: 'برومبتات',
        },
        twitter: {
          card: 'summary',
          title: `${categoryName} | برومبتات`,
          description: descriptionAr,
        },
      }
    }
    
    // Default to English metadata
    return {
      ...baseMetadata,
      title: `${categoryName} | Promptaat`,
      description: descriptionEn,
      keywords: [
        `${categoryName} prompts`,
        'AI prompts',
        'ChatGPT prompts',
        'Gemini prompts',
        'Claude prompts',
        'prompt library'
      ],
      openGraph: {
        title: `${categoryName} | Promptaat`,
        description: descriptionEn,
        locale: 'en_US',
        type: 'website',
        url: `https://promptaat.com/en/category/${categoryId}`,
        siteName: 'Promptaat',
      },
      twitter: {
        card: 'summary',
        title: `${categoryName} | Promptaat`,
        description: descriptionEn,
      },
    }
  } catch (error) {
    console.error('Error generating category metadata:', error)
    
    // Fallback metadata in case of error
    return {
      title: isArabic ? 'فئة | برومبتات' : 'Category | Promptaat',
      description: isArabic 
        ? 'اكتشف بروبتات الذكاء الاصطناعي حسب الفئة' 
        : 'Discover AI prompts by category',
    }
  }
}
