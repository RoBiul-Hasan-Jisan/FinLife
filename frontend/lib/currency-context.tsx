'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { formatCurrency, getCurrencySymbol } from './currency';

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  format: (amount: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  format: (n) => `$${n}`,
  symbol: '$',
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [currency, setCurrencyState] = useState('USD');

  useEffect(() => {
    if (profile?.currency) setCurrencyState(profile.currency);
  }, [profile?.currency]);

  const setCurrency = (c: string) => setCurrencyState(c);

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      format: (n: number) => formatCurrency(n, currency),
      symbol: getCurrencySymbol(currency),
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
