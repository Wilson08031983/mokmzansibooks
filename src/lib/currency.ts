import { SupportedCurrency } from '@/contexts/I18nContext';

const currencySymbols: { [key in SupportedCurrency]: string } = {
  ZAR: 'R',
  USD: '$',
  EUR: '€'
};

const currencyLocales: { [key in SupportedCurrency]: string } = {
  ZAR: 'en-ZA',
  USD: 'en-US',
  EUR: 'de-DE'
};

export function formatCurrency(
  amount: number, 
  currency: SupportedCurrency = 'ZAR'
): string {
  return new Intl.NumberFormat(currencyLocales[currency], {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function getCurrencySymbol(currency: SupportedCurrency): string {
  return currencySymbols[currency];
}
