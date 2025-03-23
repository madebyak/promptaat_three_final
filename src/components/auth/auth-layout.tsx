"use client";

import { AuthNavbar } from './auth-navbar';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  locale: string;
  heading?: string;
  subheading?: string;
}

export function AuthLayout({ 
  children, 
  locale, 
  heading = "Welcome to", 
  subheading = "The Future of Prompting" 
}: AuthLayoutProps) {
  const isRtl = locale === 'ar';

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Left Side - Video Background */}
      <div className="hidden md:block absolute top-0 left-0 w-1/2 h-full bg-black-main">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover opacity-70"
        >
          <source src="/web-login-02.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Right Side - Background */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-background dark:bg-black-main"></div>
      
      {/* Navbar */}
      <AuthNavbar locale={locale} />
      
      {/* Content Container */}
      <div className={`relative h-full w-full flex z-10 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {/* Left Side - Content */}
        <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center text-center z-10 px-10">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white-pure mb-6 ${isRtl ? 'text-right' : ''}`}>
            {heading}
            <br />
            {subheading}
          </h1>
          <p className={`text-lg md:text-xl text-white-pure max-w-xl ${isRtl ? 'text-right' : ''}`}>
            {isRtl 
              ? "امنح أفكارك القوة عبر مكتبتنا الديناميكية للموجهات—اطلق الإمكانات الكاملة لأدوات الذكاء الاصطناعي التوليدية لتحقيق نتائج استثنائية."
              : "Empower your ideas with our dynamic prompt library—unlock the full potential of AI generative tools for extraordinary results."
            }
          </p>
        </div>
        
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 pt-20">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
