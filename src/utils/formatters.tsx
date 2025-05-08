import React from "react";
import { format } from "date-fns";
import Logo from "@/components/Logo";
import { useI18n } from "@/contexts/I18nContext";

// Supported currencies
const SUPPORTED_CURRENCIES = ["ZAR", "USD", "EUR"] as const;
type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

// Store the active currency from context
let globalCurrency: SupportedCurrency = "ZAR";

// Update the global currency when it changes in context
export function setGlobalCurrency(currency: SupportedCurrency) {
  if (SUPPORTED_CURRENCIES.includes(currency)) {
    globalCurrency = currency;
  } else {
    console.warn(`Unsupported currency: ${currency}. Defaulting to ZAR.`);
    globalCurrency = "ZAR";
  }
}

// Get current global currency
export function getGlobalCurrency(): SupportedCurrency {
  return globalCurrency as SupportedCurrency;
}

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy");
  } catch (error) {
    console.error("Invalid date format:", error);
    return dateString;
  }
};

export const formatCurrency = (amount: number | string, currency?: string): string => {
  let num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  // Use provided currency or fall back to global currency
  const currencyCode = currency || globalCurrency;
  
  const currencyMap: Record<string, { code: string; locale: string }> = {
    ZAR: { code: "ZAR", locale: "en-ZA" },
    USD: { code: "USD", locale: "en-US" },
    EUR: { code: "EUR", locale: "de-DE" },
  };
  
  const { code, locale } = currencyMap[currencyCode] || currencyMap["ZAR"];
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    currencyDisplay: "symbol",
  }).format(num);
};

export const formatPercentage = (value: number): string => `${value}%`;

// Helper functions for company assets
export const renderCompanyLogo = (logo?: string) => {
  return logo ? (
    <img src={logo} alt="Company Logo" className="h-16" />
  ) : (
    <Logo className="h-16" />
  );
};

export const renderCompanyStamp = (stamp?: string) => {
  return stamp ? (
    <img src={stamp} alt="Company Stamp" className="max-h-20 max-w-20" />
  ) : (
    <span className="text-gray-400 text-xs text-center">Company Stamp</span>
  );
};

export const renderSignature = (signature?: string) => {
  return signature ? (
    <img src={signature} alt="Signature" className="h-full object-contain" />
  ) : (
    <span className="text-gray-400 text-xs">Signature</span>
  );
};
