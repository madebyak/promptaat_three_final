"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { Crown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UpgradeButtonProps extends Omit<ButtonProps, 'variant'> {
  locale?: string;
  size?: "sm" | "default" | "lg";
  styleVariant?: "primary" | "subtle" | "outline";
}

export function UpgradeButton({
  locale = "en",
  size = "default",
  styleVariant = "primary",
  className,
  ...props
}: UpgradeButtonProps) {
  // Map variant names to actual styles
  const variantStyles = {
    primary: "bg-gradient-to-r from-[#6926ea] via-[#0f6cf4] to-[#4bd51b] text-white hover:shadow-lg hover:shadow-[#6926ea]/20 shadow-md shadow-[#0f6cf4]/20",
    subtle: "bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30 shadow-sm shadow-amber-300/10",
    outline: "border-accent-gold text-accent-gold hover:bg-accent-gold/10",
  };

  // Map size names to actual styles
  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 py-2",
    lg: "h-12 px-6 py-3 text-lg",
  };

  return (
    <Button
      variant={styleVariant === "outline" ? "outline" : "default"}
      className={cn(
        variantStyles[styleVariant],
        sizeStyles[size],
        "font-medium relative overflow-hidden transition-all duration-300 ease-in-out-circ",
        className
      )}
      asChild
      {...props}
    >
      <Link href={`/${locale}/pricing`} className="inline-flex items-center">
        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-10 transition-opacity rounded-md" />
        <Crown className={cn(
          "text-white transition-transform",
          size === "sm" ? "h-3.5 w-3.5 mr-1.5" : 
          size === "lg" ? "h-5 w-5 mr-2" : "h-4 w-4 mr-2"
        )} />
        <span className="relative text-white">
          {locale === "ar" ? "ترقية الحساب" : "Go Pro"}
        </span>
      </Link>
    </Button>
  );
}
