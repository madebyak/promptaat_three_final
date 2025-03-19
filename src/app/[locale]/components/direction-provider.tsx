'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useParams } from 'next/navigation';

type Direction = 'ltr' | 'rtl';

interface DirectionContextType {
  direction: Direction;
  isRtl: boolean;
}

const DirectionContext = createContext<DirectionContextType>({
  direction: 'ltr',
  isRtl: false,
});

export const useDirection = () => useContext(DirectionContext);

interface DirectionProviderProps {
  children: ReactNode;
}

export function DirectionProvider({ children }: DirectionProviderProps) {
  const params = useParams();
  const locale = params.locale as string || 'en';
  
  // Arabic is RTL, all other languages are LTR
  const direction: Direction = locale === 'ar' ? 'rtl' : 'ltr';
  const isRtl = direction === 'rtl';

  return (
    <DirectionContext.Provider value={{ direction, isRtl }}>
      <div dir={direction} lang={locale}>
        {children}
      </div>
    </DirectionContext.Provider>
  );
}
