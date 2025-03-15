'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface CancellationConfirmModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  currentPeriodEnd: Date;
  locale: string;
}

export function CancellationConfirmModal({
  isOpen,
  setIsOpen,
  onConfirm,
  currentPeriodEnd,
  locale = 'en',
}: CancellationConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error canceling subscription:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const formattedDate = format(new Date(currentPeriodEnd), 'MMMM dd, yyyy');

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {locale === 'ar' ? 'تأكيد إلغاء الاشتراك' : 'Cancel Subscription?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {locale === 'ar' 
              ? `سيظل لديك حق الوصول إلى الميزات المميزة حتى ${formattedDate}. بعد ذلك، سيتم تنزيل حسابك إلى الخطة المجانية.`
              : `You will continue to have access to premium features until ${formattedDate}. After that, your account will be downgraded to the free plan.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {locale === 'ar' ? 'جارٍ الإلغاء...' : 'Canceling...'}
              </>
            ) : (
              locale === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancellation'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
