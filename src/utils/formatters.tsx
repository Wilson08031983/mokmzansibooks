
import React from "react";
import { format } from "date-fns";

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy"); // Format: 01 January 1900
  } catch (error) {
    console.error("Invalid date format:", error);
    return dateString;
  }
};

export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(num);
};

export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

// Helper functions for company assets
export const renderCompanyLogo = (logo?: string) => {
  return logo ? (
    <img src={logo} alt="Company Logo" className="h-16" />
  ) : (
    <div className="h-16 w-16 bg-gray-200 flex items-center justify-center rounded">
      <span className="text-gray-400 text-xs">Logo</span>
    </div>
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
