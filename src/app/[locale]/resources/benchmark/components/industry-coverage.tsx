import React from 'react'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import IndustryChart from './industry-chart'

interface IndustryCoverageProps {
  isRTL?: boolean
}

export default function IndustryCoverage({ isRTL = false }: IndustryCoverageProps) {
  // Translations
  const title = isRTL ? 'تغطية الصناعة' : 'Industry Coverage'
  const description = isRTL 
    ? 'نقيس تغطية الصناعة من خلال عدد الفئات والفئات الفرعية التي تغطيها مكتبة البرومبتات لدينا. كل فئة تمثل قطاعًا صناعيًا رئيسيًا (مثل التعليم، الرعاية الصحية، التكنولوجيا)، بينما تمثل الفئات الفرعية تخصصات أو مجالات محددة داخل كل قطاع. نحن نعمل باستمرار على توسيع تغطيتنا لتلبية احتياجات المزيد من المستخدمين في مختلف المجالات.'
    : 'We measure industry coverage by the number of categories and subcategories covered by our prompt library. Each category represents a major industry sector (like Education, Healthcare, Technology), while subcategories represent specific specializations or domains within each sector. We continuously work to expand our coverage to serve more users across different fields.'
  
  return (
    <section className="py-16 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-light-white/50 dark:from-black-main/50 via-light-grey-light/10 dark:via-dark/10 to-light-white/50 dark:to-black-main/50 opacity-50"></div>
      
      <Container>
        <div className={cn(
          "mb-10",
          isRTL ? "text-right" : "text-left"
        )}>
          <h2 className="text-3xl font-bold text-dark-dark-grey dark:text-white-pure mb-4">{title}</h2>
          <p className="text-light-hh-grey dark:text-light-grey max-w-3xl mx-0">{description}</p>
        </div>
        
        <div className="bg-light-grey-light/30 dark:bg-dark/30 backdrop-blur-sm border border-light-high-grey/20 dark:border-high-grey/20 rounded-xl p-6 md:p-8">
          <IndustryChart isRTL={isRTL} />
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={cn(
            "bg-light-grey-light/30 dark:bg-dark/30 backdrop-blur-sm border border-light-high-grey/20 dark:border-high-grey/20 rounded-xl p-6",
            isRTL ? "text-right" : "text-left"
          )}>
            <h3 className="text-xl font-semibold text-dark-dark-grey dark:text-white-pure mb-3">
              {isRTL ? 'الفئات الرئيسية' : 'Main Categories'}
            </h3>
            <p className="text-light-hh-grey dark:text-light-grey mb-4">
              {isRTL 
                ? 'تشمل الفئات الرئيسية في برومتات مجموعة واسعة من القطاعات الصناعية، مثل:'
                : 'Main categories in Promptaat include a wide range of industry sectors, such as:'}
            </p>
            <ul className={cn(
              "grid grid-cols-2 gap-2 text-dark-dark-grey/90 dark:text-white-pure/90",
              isRTL ? "text-right" : "text-left"
            )}>
              <li>• {isRTL ? 'التعليم' : 'Education'}</li>
              <li>• {isRTL ? 'الرعاية الصحية' : 'Healthcare'}</li>
              <li>• {isRTL ? 'التكنولوجيا' : 'Technology'}</li>
              <li>• {isRTL ? 'التسويق' : 'Marketing'}</li>
              <li>• {isRTL ? 'المالية' : 'Finance'}</li>
              <li>• {isRTL ? 'القانون' : 'Legal'}</li>
              <li>• {isRTL ? 'الهندسة' : 'Engineering'}</li>
              <li>• {isRTL ? 'الإعلام' : 'Media'}</li>
            </ul>
          </div>
          
          <div className={cn(
            "bg-light-grey-light/30 dark:bg-dark/30 backdrop-blur-sm border border-light-high-grey/20 dark:border-high-grey/20 rounded-xl p-6",
            isRTL ? "text-right" : "text-left"
          )}>
            <h3 className="text-xl font-semibold text-dark-dark-grey dark:text-white-pure mb-3">
              {isRTL ? 'نمو الفئات الفرعية' : 'Subcategory Growth'}
            </h3>
            <p className="text-light-hh-grey dark:text-light-grey mb-4">
              {isRTL 
                ? 'شهدت الفئات الفرعية نموًا كبيرًا في الأشهر الأخيرة، مع إضافة تخصصات جديدة مثل:'
                : 'Subcategories have seen significant growth in recent months, with new specializations added such as:'}
            </p>
            <div className={cn(
              "grid grid-cols-1 gap-2",
              isRTL ? "text-right" : "text-left"
            )}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-500"></div>
                <span className="text-dark-dark-grey/90 dark:text-white-pure/90">
                  {isRTL ? 'التكنولوجيا: الحوسبة السحابية، الأمن السيبراني، تطوير الويب' : 'Technology: Cloud Computing, Cybersecurity, Web Development'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-500"></div>
                <span className="text-dark-dark-grey/90 dark:text-white-pure/90">
                  {isRTL ? 'الرعاية الصحية: الطب الشخصي، التصوير الطبي، علم الأورام' : 'Healthcare: Personalized Medicine, Medical Imaging, Oncology'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-500"></div>
                <span className="text-dark-dark-grey/90 dark:text-white-pure/90">
                  {isRTL ? 'التعليم: التعلم الآلي، الذكاء الاصطناعي التوليدي، علم البيانات' : 'Education: Machine Learning, Generative AI, Data Science'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
