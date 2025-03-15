import { Metadata } from "next";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Payment Cancelled | Promptaat",
  description: "Your payment has been cancelled.",
};

export default async function CheckoutCancelPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("Checkout");
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/${locale}/auth/signin`);
  }

  return (
    <div className="container max-w-4xl py-16 md:py-24">
      <div className="flex flex-col items-center justify-center text-center space-y-8">
        <div className="bg-destructive/10 p-3 rounded-full">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            {t("cancelTitle")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {t("cancelDescription")}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button asChild size="lg">
            <Link href={`/${locale}/pricing`}>
              {t("backToPricing")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/${locale}/dashboard`}>
              {t("goToDashboard")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
