import { useState, useEffect } from 'react';
import { SupportedCurrency } from '@/contexts/I18nContext';

export function useCurrencyListener() {
  const [currentCurrency, setCurrentCurrency] = useState<SupportedCurrency>(
    localStorage.getItem('currency') as SupportedCurrency || 'ZAR'
  );

  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent<SupportedCurrency>) => {
      setCurrentCurrency(event.detail);
    };

    // Add event listener
    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  return currentCurrency;
}
