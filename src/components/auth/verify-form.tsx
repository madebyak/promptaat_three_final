'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export interface VerifyFormProps {
  email?: string;
  locale?: string;
}

export function VerifyForm({ email = '', locale = 'en' }: VerifyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      toast({
        title: 'Success',
        description: 'Email verified successfully',
      });

      router.push('/auth/login');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to verify email',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify Email'}
      </Button>
    </form>
  );
}
