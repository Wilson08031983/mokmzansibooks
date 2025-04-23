
import React from "react";
import { format } from "date-fns";
import Logo from "@/components/Logo";
import { useI18n } from "@/contexts/I18nContext";

// Use currency from the global context if not manually passed in
let currentCurrency: string | undefined;

// Internal utility to force update when currency changes
export function setGlobalCurrencyWatcher(getCurrency: () => string) {
  currentCurrency = getCurrency();
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

  if (!currency && currentCurrency) {
    currency = currentCurrency as string;
  }
  const currencyMap: Record<string, { code: string; locale: string }> = {
    ZAR: { code: "ZAR", locale: "en-ZA" },
    USD: { code: "USD", locale: "en-US" },
    EUR: { code: "EUR", locale: "de-DE" },
  };
  const { code, locale } = currencyMap[currency || "ZAR"] || currencyMap["ZAR"];
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
