import { Metadata } from 'next'
import { prisma } from '@/lib/db'

interface GenerateMetadataProps {
  params: { 
    locale: string
    categoryId: string
    subcategoryId: string
  }
}

/**
 * Generate dynamic SEO metadata for subcategory pages
 * This fetches both category and subcategory data to create highly targeted metadata
 */
export async function generateMetadata(
  { params }: GenerateMetadataProps
): Promise<Metadata> {
  const { locale, categoryId, subcategoryId } = params
  const isArabic = locale === 'ar'
  
  try {
    // Fetch both category and subcategory data for more comprehensive metadata
    const [category, subcategory] = await Promise.all([
      prisma.category.findUnique({
        where: { id: categoryId }
      }),
      prisma.category.findUnique({
        where: { id: subcategoryId }
      })
    ])
    
    if (!category || !subcategory) {
      // Fallback metadata if data not found
      return {
        title: isArabic ? 'فئة فرعية غير موجودة | برومتات' : 'Subcategory Not Found | Promptaat',
        description: isArabic 
          ? 'عذراً، الفئة الفرعية التي تبحث عنها غير موجودة.' 
          : 'Sorry, the subcategory you are looking for does not exist.',
      }
    }
    
    // Get names based on locale
    const categoryName = isArabic ? category.nameAr : category.nameEn
    const subcategoryName = isArabic ? subcategory.nameAr : subcategory.nameEn
    
    // Base metadata that's common across locales
    const baseMetadata = {
      metadataBase: new URL('https://promptaat.com'),
      alternates: {
        canonical: `/${locale}/category/${categoryId}/subcategory/${subcategoryId}`,
        languages: {
          'en': `/en/category/${categoryId}/subcategory/${subcategoryId}`,
          'ar': `/ar/category/${categoryId}/subcategory/${subcategoryId}`,
        },
      },
    }
    
    // Construct optimized descriptions that target both category and subcategory
    const descriptionEn = `Explore ${subcategoryName} prompts in our ${categoryName} collection. Find specialized AI prompts for ChatGPT, Gemini, and Claude to optimize your ${subcategoryName.toLowerCase()} tasks and workflows.`
    const descriptionAr = `استكشف موجهات ${subcategoryName} في مجموعة ${categoryName} لدينا. اعثر على موجهات الذكاء الاصطناعي المتخصصة لـ ChatGPT وGemini وClaude لتحسين مهام ${subcategoryName} وسير العمل.`
    
    // Locale-specific metadata
    if (isArabic) {
      return {
        ...baseMetadata,
        title: `${subcategoryName} | ${categoryName} | برومتات - أكبر مكتبة للموجهات الذكية`,
        description: descriptionAr,
        keywords: [
          `موجهات ${subcategoryName}`,
          `${categoryName}`,
          'موجهات الذكاء الاصطناعي',
          'شات جي بي تي',
          'جيميني',
          'كلود'
        ],
        openGraph: {
          title: `${subcategoryName} | ${categoryName} | برومتات - أكبر مكتبة للموجهات الذكية`,
          description: descriptionAr,
          locale: 'ar_SA',
          type: 'website',
          url: `https://promptaat.com/ar/category/${categoryId}/subcategory/${subcategoryId}`,
          siteName: 'برومتات',
        },
        twitter: {
          card: 'summary',
          title: `${subcategoryName} | ${categoryName} | برومتات - أكبر مكتبة للموجهات الذكية`,
          description: descriptionAr,
        },
      }
    }
    
    // Default to English metadata
    return {
      ...baseMetadata,
      title: `${subcategoryName} | ${categoryName} | Promptaat - The Largest AI Prompt Library`,
      description: descriptionEn,
      keywords: [
        `${subcategoryName} prompts`,
        `${categoryName} prompts`,
        'AI Prompts',
        'ChatGPT Prompts',
        'Top Prompts',
        'Advance Prompt',
        'Claude AI Prompts',
        'Gemini Prompts'
      ],
      openGraph: {
        title: `${subcategoryName} | ${categoryName} | Promptaat - The Largest AI Prompt Library`,
        description: descriptionEn,
        locale: 'en_US',
        type: 'website',
        url: `https://promptaat.com/en/category/${categoryId}/subcategory/${subcategoryId}`,
        siteName: 'Promptaat',
      },
      twitter: {
        card: 'summary',
        title: `${subcategoryName} | ${categoryName} | Promptaat - The Largest AI Prompt Library`,
        description: descriptionEn,
      },
    }
  } catch (error) {
    console.error('Error generating subcategory metadata:', error)
    
    // Fallback metadata in case of error
    return {
      title: isArabic ? 'فئة فرعية | برومتات - أكبر مكتبة للموجهات الذكية' : 'Subcategory | Promptaat - The Largest AI Prompt Library',
      description: isArabic 
        ? 'استكشف موجهات الذكاء الاصطناعي المتخصصة' 
        : 'Explore specialized AI prompts',
    }
  }
}
