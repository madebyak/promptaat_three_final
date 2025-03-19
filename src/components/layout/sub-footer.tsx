'use client';

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Twitter, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

interface SubFooterProps {
  locale?: string;
}

export function SubFooter({ locale = 'en' }: SubFooterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isRTL = locale === 'ar';
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={cn(
      "w-full border-t py-12 md:py-16",
      isDark 
        ? "bg-black-main border-gray-800/30 text-white" 
        : "bg-white-pure border-gray-200/60 text-gray-900"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className={cn("flex flex-wrap", isRTL ? "flex-row-reverse" : "")}>
          {/* Logo and company info */}
          <div className={cn(
            "w-full md:w-5/12 mb-10 md:mb-0",
            isRTL ? "md:pl-8" : "md:pr-8"
          )}>
            <div className="flex flex-col h-full">
              <Logo className="mb-6 w-32" />
              <p className={cn(
                "text-sm mb-6 max-w-xs",
                isDark ? "text-gray-400" : "text-gray-600",
                isRTL && "text-right"
              )}>
                {isRTL 
                  ? "نعيد تعريف كيفية تواصل الناس مع الذكاء الاصطناعي من خلال موجهات مصممة بعناية."
                  : "Redefining how people communicate with AI through carefully crafted prompts."
                }
              </p>
              <div className={cn(
                "flex gap-4 mt-auto", 
                isRTL ? "flex-row-reverse justify-end" : ""
              )}>
                <Link 
                  href="https://twitter.com/promptaat" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark 
                      ? "text-gray-400 hover:text-white bg-gray-800/30 hover:bg-gray-800/50" 
                      : "text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200"
                  )}
                >
                  <Twitter size={18} />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link 
                  href="https://instagram.com/promptaat" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark 
                      ? "text-gray-400 hover:text-white bg-gray-800/30 hover:bg-gray-800/50" 
                      : "text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200"
                  )}
                >
                  <Instagram size={18} />
                  <span className="sr-only">Instagram</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Navigation links in 3 columns */}
          <div className="w-full md:w-7/12">
            <div className={cn(
              "flex flex-wrap",
              isRTL ? "flex-row-reverse" : ""
            )}>
              {/* Products */}
              <div className={cn(
                "w-1/2 sm:w-1/3 mb-8 md:mb-0",
                isRTL ? "sm:pl-4" : ""
              )}>
                <h3 className={cn(
                  "font-medium text-sm uppercase tracking-wider mb-4",
                  isDark ? "text-white" : "text-gray-900",
                  isRTL && "text-right"
                )}>
                  {isRTL ? "المنتجات" : "Products"}
                </h3>
                <ul className={cn(
                  "space-y-2",
                  isRTL && "text-right"
                )}>
                  <li>
                    <Link 
                      href={`/${locale}/products/ai-prompts`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "موجهات الذكاء الاصطناعي" : "AI Prompts"}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/${locale}/products/enterprise`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "حلول الشركات" : "Enterprise"}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/${locale}/pricing`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "التسعير" : "Pricing"}
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Company */}
              <div className={cn(
                "w-1/2 sm:w-1/3 mb-8 md:mb-0",
                isRTL 
                  ? "sm:px-4" 
                  : "sm:px-4"
              )}>
                <h3 className={cn(
                  "font-medium text-sm uppercase tracking-wider mb-4",
                  isDark ? "text-white" : "text-gray-900",
                  isRTL && "text-right"
                )}>
                  {isRTL ? "الشركة" : "Company"}
                </h3>
                <ul className={cn(
                  "space-y-2",
                  isRTL && "text-right"
                )}>
                  <li>
                    <Link 
                      href={`/${locale}/company/about-us`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "من نحن" : "About Us"}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/${locale}/company/careers`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "الوظائف" : "Careers"}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/${locale}/company/contact-us`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "اتصل بنا" : "Contact Us"}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/${locale}/blog`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "المدونة" : "Blog"}
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Resources */}
              <div className={cn(
                "w-1/2 sm:w-1/3 mb-8 md:mb-0",
                isRTL ? "sm:pr-4" : "sm:pl-4"
              )}>
                <h3 className={cn(
                  "font-medium text-sm uppercase tracking-wider mb-4",
                  isDark ? "text-white" : "text-gray-900",
                  isRTL && "text-right"
                )}>
                  {isRTL ? "الموارد" : "Resources"}
                </h3>
                <ul className={cn(
                  "space-y-2",
                  isRTL && "text-right"
                )}>
                  <li>
                    <Link 
                      href={`/${locale}/resources/guides`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "الأدلة" : "Guides"}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/${locale}/resources/documentation`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "التوثيق" : "Documentation"}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/${locale}/resources/community`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "المجتمع" : "Community"}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/${locale}/resources/templates`} 
                      className={cn(
                        "text-sm transition-colors",
                        isDark 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {isRTL ? "القوالب" : "Templates"}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className={cn(
          "pt-8 mt-8 border-t flex flex-col md:flex-row justify-between items-center",
          isDark ? "border-gray-800/30" : "border-gray-200/60",
          isRTL && "md:flex-row-reverse"
        )}>
          <p className={cn(
            "text-xs mb-4 md:mb-0",
            isDark ? "text-gray-500" : "text-gray-500",
            isRTL && "text-right"
          )}>
            &copy; {currentYear} Promptaat. {isRTL ? "جميع الحقوق محفوظة" : "All rights reserved"}. {' '}
            <span>
              {isRTL ? "مدعوم بواسطة" : "Powered by"}{' '}
              <Link 
                href="https://www.moonwhale.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "transition-colors",
                  isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                )}
              >
                MoonWhale
              </Link>
            </span>
          </p>
          
          <div className={cn(
            "flex gap-6",
            isRTL ? "flex-row-reverse" : ""
          )}>
            <Link 
              href={`/${locale}/legal/privacy-policy`} 
              className={cn(
                "text-xs transition-colors",
                isDark 
                  ? "text-gray-500 hover:text-white" 
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
            </Link>
            <Link 
              href={`/${locale}/legal/terms-of-service`} 
              className={cn(
                "text-xs transition-colors",
                isDark 
                  ? "text-gray-500 hover:text-white" 
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              {isRTL ? "شروط الخدمة" : "Terms of Service"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
