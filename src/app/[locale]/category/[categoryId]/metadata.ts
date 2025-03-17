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
 * This fetches category data to create targeted metadata
 */
export async function generateMetadata(
  { params }: GenerateMetadataProps
): Promise<Metadata> {
  const { locale, categoryId } = params
  const isArabic = locale === 'ar'
  
  try {
    // Fetch category data
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })
    
    if (!category) {
      // Fallback metadata if category not found
      return {
        title: isArabic ? 'فئة غير موجودة | برومتات' : 'Category Not Found | Promptaat',
        description: isArabic 
          ? 'عذراً، الفئة التي تبحث عنها غير موجودة.' 
          : 'Sorry, the category you are looking for does not exist.',
      }
    }
    
    // Get name based on locale
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
    
    // Construct optimized descriptions
    const descriptionEn = `Browse the best ${categoryName} AI prompts at Promptaat. Find expertly crafted prompts for ChatGPT, Gemini, and Claude to enhance your ${categoryName.toLowerCase()} tasks and workflows.`
    const descriptionAr = `تصفح أفضل موجهات الذكاء الاصطناعي لـ ${categoryName} في برومتات. جد موجهات مصممة بعناية لـ ChatGPT وGemini وClaude لتحسين مهامك وسير عملك في ${categoryName}.`
    
    // Locale-specific metadata
    if (isArabic) {
      return {
        ...baseMetadata,
        title: `${categoryName} | برومتات - أكبر مكتبة للموجهات الذكية`,
        description: descriptionAr,
        keywords: [
          `موجهات ${categoryName}`, 
          'موجهات الذكاء الاصطناعي', 
          'شات جي بي تي', 
          'جيميني', 
          'كلود'
        ],
        openGraph: {
          title: `${categoryName} | برومتات - أكبر مكتبة للموجهات الذكية`,
          description: descriptionAr,
          locale: 'ar_SA',
          type: 'website',
          url: `https://promptaat.com/ar/category/${categoryId}`,
          siteName: 'برومتات',
        },
        twitter: {
          card: 'summary',
          title: `${categoryName} | برومتات - أكبر مكتبة للموجهات الذكية`,
          description: descriptionAr,
        },
      }
    }
    
    // Default to English metadata
    return {
      ...baseMetadata,
      title: `${categoryName} | Promptaat - The Largest AI Prompt Library`,
      description: descriptionEn,
      keywords: [
        `${categoryName} prompts`,
        'AI Prompts',
        'ChatGPT Prompts',
        'Top Prompts',
        'Advance Prompt',
        'Claude AI Prompts',
        'Gemini Prompts'
      ],
      openGraph: {
        title: `${categoryName} | Promptaat - The Largest AI Prompt Library`,
        description: descriptionEn,
        locale: 'en_US',
        type: 'website',
        url: `https://promptaat.com/en/category/${categoryId}`,
        siteName: 'Promptaat',
      },
      twitter: {
        card: 'summary',
        title: `${categoryName} | Promptaat - The Largest AI Prompt Library`,
        description: descriptionEn,
      },
    }
  } catch (error) {
    console.error('Error generating category metadata:', error)
    
    // Fallback metadata in case of error
    return {
      title: isArabic ? 'فئة | برومتات - أكبر مكتبة للموجهات الذكية' : 'Category | Promptaat - The Largest AI Prompt Library',
      description: isArabic 
        ? 'اكتشف موجهات الذكاء الاصطناعي حسب الفئة' 
        : 'Discover AI prompts by category',
    }
  }
}
