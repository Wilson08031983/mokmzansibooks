
import React from "react";
import { format } from "date-fns";
import Logo from "@/components/Logo";

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

// Removed the renderSignature function
