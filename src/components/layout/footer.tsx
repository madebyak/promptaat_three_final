"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Instagram, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { theme } = useTheme();

  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };

  const currentYear = new Date().getFullYear();

  // Link groups for the footer navigation
  const linkGroups = [
    {
      title: { en: "Products", ar: "المنتجات" },
      links: [
        { name: { en: "AI Prompts", ar: "نماذج الذكاء الاصطناعي" }, href: `/${locale}/prompts` },
        { name: { en: "AI Tools", ar: "أدوات الذكاء الاصطناعي" }, href: `/${locale}/tools` },
        { name: { en: "Subscriptions", ar: "الاشتراكات" }, href: `/${locale}/pricing` },
      ],
    },
    {
      title: { en: "Company", ar: "الشركة" },
      links: [
        { name: { en: "About Us", ar: "عنا" }, href: `/${locale}/about-us` },
        { name: { en: "Blog", ar: "المدونة" }, href: `/${locale}/blog` },
        { name: { en: "Contact", ar: "اتصل بنا" }, href: `/${locale}/contact` },
      ],
    },
    {
      title: { en: "Resources", ar: "الموارد" },
      links: [
        { name: { en: "Help Center", ar: "مركز المساعدة" }, href: `/${locale}/help` },
        { name: { en: "Terms of Service", ar: "شروط الخدمة" }, href: `/${locale}/terms` },
        { name: { en: "Privacy Policy", ar: "سياسة الخصوصية" }, href: `/${locale}/privacy` },
      ],
    },
  ];

  return (
    <footer className={cn(
      "border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black-main py-12",
      isRTL ? "text-right" : "text-left"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12",
          isRTL && "md:flex-row-reverse"
        )}>
          {/* Company info */}
          <div className="md:col-span-5">
            <div className="mb-6">
              <Link href={`/${locale}`} className="text-2xl font-bold">
                <span className={cn(
                  "text-primary",
                  theme === "dark" ? "text-primary-light" : "text-primary"
                )}>
                  Promptaat
                </span>
              </Link>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md">
              {t({ 
                en: "Enhancing your AI interactions with quality prompts and tools to help you achieve better results with artificial intelligence.",
                ar: "تعزيز تفاعلاتك مع الذكاء الاصطناعي من خلال نماذج وأدوات عالية الجودة لمساعدتك على تحقيق نتائج أفضل."
              })}
            </p>
            
            {/* Social Media Links */}
            <div className={cn(
              "mt-6 flex gap-4",
              isRTL ? "justify-start" : "justify-start"
            )}>
              <a 
                href="https://twitter.com/promptaat" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-full p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com/promptaat" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-full p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div className={cn(
            "md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8"
          )}>
            {linkGroups.map((group, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t(group.title)}
                </h3>
                <ul className="mt-4 space-y-4">
                  {group.links.map((link, j) => (
                    <li key={j}>
                      <Link 
                        href={link.href}
                        className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        {t(link.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Copyright */}
        <div className={cn(
          "mt-12 pt-8 border-t border-gray-200 dark:border-gray-800",
          "flex flex-col md:flex-row justify-between items-center"
        )}>
          <p className="text-base text-gray-500 dark:text-gray-400">
            &copy; {currentYear} Promptaat. {t({ en: "All rights reserved.", ar: "جميع الحقوق محفوظة." })}
          </p>
          <p className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
            {t({ en: "Powered by", ar: "مشغل بواسطة" })} MoonWhale
          </p>
        </div>
      </div>
    </footer>
  );
}
