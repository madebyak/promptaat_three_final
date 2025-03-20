'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FaqSearchProps {
  locale: string
}

export default function FaqSearch({ locale }: FaqSearchProps) {
  const isRTL = locale === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [isSticky, setIsSticky] = useState(false)
  
  // Add sticky scrolling behavior for improved mobile UX
  useEffect(() => {
    const handleScroll = () => {
      const searchSection = document.getElementById('faq-search')
      if (searchSection) {
        const rect = searchSection.getBoundingClientRect()
        setIsSticky(rect.top <= 0)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // In a real implementation, you would trigger a search here
    // For now, we'll scroll to the first matching FAQ if possible
    if (searchQuery.trim()) {
      const allFaqElements = document.querySelectorAll('[data-faq-question]')
      
      for (const element of allFaqElements) {
        const questionText = element.getAttribute('data-faq-question') || ''
        if (questionText.toLowerCase().includes(searchQuery.toLowerCase())) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          
          // Highlight the element temporarily
          element.classList.add('bg-accent-purple/10')
          setTimeout(() => {
            element.classList.remove('bg-accent-purple/10')
          }, 2000)
          
          break
        }
      }
    }
  }
  
  const clearSearch = () => {
    setSearchQuery('')
  }
  
  return (
    <section id="faq-search" className={`w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-light-grey-light dark:bg-black-main border-y border-gray-200 dark:border-gray-800 ${isSticky ? 'sticky top-0 z-30 shadow-md pb-4 sm:pb-6' : ''}`}>
      <div className="max-w-3xl mx-auto">
        <div className={`text-center mb-6 ${isSticky ? 'sr-only' : ''}`}>
          <h2 className="text-2xl font-bold mb-2">
            <bdi>{isRTL ? "ابحث في الأسئلة الشائعة" : "Search Our FAQ"}</bdi>
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            <bdi>{isRTL ? "اكتب كلمة أو عبارة للعثور على إجابات لأسئلتك" : "Type a word or phrase to find answers to your questions"}</bdi>
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <div className={`relative flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? "ابحث عن سؤال..." : "Search for a question..."}
              className={`w-full py-4 sm:py-6 ${isRTL ? 'pr-6 pl-12 rtl:text-right' : 'pl-6 pr-12 ltr:text-left'} text-base sm:text-lg rounded-xl shadow-sm focus-visible:ring-accent-purple bg-white dark:bg-black-main transition-all`}
              dir={isRTL ? 'rtl' : 'ltr'}
              aria-label={isRTL ? "ابحث في الأسئلة الشائعة" : "Search frequently asked questions"}
            />
            
            <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 flex items-center space-x-1 rtl:space-x-reverse`}>
              {searchQuery ? (
                <Button
                  type="button"
                  onClick={clearSearch}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 mr-1 rtl:ml-1 rtl:mr-0 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  aria-label={isRTL ? "مسح البحث" : "Clear search"}
                >
                  <X className="h-5 w-5" />
                </Button>
              ) : null}
              
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-accent-purple hover:text-accent-purple/90"
                aria-label={isRTL ? "بحث" : "Search"}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
        
        {/* Mobile optimized search count indicator */}
        {searchQuery.trim() && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            <bdi>
              {isRTL 
                ? `جاري البحث عن "${searchQuery}"...` 
                : `Searching for "${searchQuery}"...`
              }
            </bdi>
          </div>
        )}
      </div>
    </section>
  )
}
