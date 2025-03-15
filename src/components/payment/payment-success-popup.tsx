'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Lottie from 'lottie-react';
import confetti from 'canvas-confetti';

interface PaymentSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  t: (key: string) => string;
  isLoading?: boolean;
}

interface AnimationData {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: Array<Record<string, unknown>>;
  layers: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export function PaymentSuccessPopup({ isOpen, onClose, locale, t, isLoading = false }: PaymentSuccessPopupProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [animationData, setAnimationData] = useState<AnimationData | null>(null);

  // Handle hydration issues with theme
  useEffect(() => {
    setMounted(true);
    
    // Dynamically fetch the Lottie animation file
    fetch('/lottie/Animation - 1741900032200.json')
      .then(response => response.json())
      .then(data => {
        setAnimationData(data as AnimationData);
      })
      .catch(err => {
        console.error('Failed to load animation:', err);
      });
  }, []);

  // Trigger confetti effect when popup opens
  useEffect(() => {
    if (isOpen) {
      triggerConfetti();
    }
  }, [isOpen]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0, 0.2) }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0, 0.2) }
      });
    }, 250);

    return () => clearInterval(interval);
  };

  const navigateToDashboard = () => {
    router.push(`/${locale}`);
    onClose();
  };

  const navigateToSubscription = () => {
    router.push(`/${locale}/subscription`);
    onClose();
  };

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center text-2xl font-bold">
          {t('paymentSuccess')}
        </DialogTitle>
        
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {animationData && (
            <div className="h-40 w-40">
              <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
              />
            </div>
          )}
          
          <p className="text-center text-muted-foreground">
            {t('subscriptionActivated')}
          </p>
          
          <div className="mt-4 flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={navigateToSubscription}
              disabled={isLoading}
            >
              {t('viewSubscription')}
            </Button>
            <Button 
              onClick={navigateToDashboard}
              disabled={isLoading}
            >
              {isLoading ? t('refreshingSession') || 'Refreshing...' : t('goToDashboard') || 'Go to Dashboard'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
