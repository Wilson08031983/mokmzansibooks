
import React from 'react';
import { formatCurrency, formatDate } from './numberUtils';

// Export the basic formatters
export { formatCurrency, formatDate };

/**
 * Renders company logo with proper fallbacks
 */
export function renderCompanyLogo(logoSrc?: string | null): React.ReactNode {
  if (!logoSrc) {
    return (
      <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
        Logo
      </div>
    );
  }
  
  return (
    <img 
      src={logoSrc} 
      alt="Company Logo" 
      className="max-h-16 max-w-[200px] object-contain"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/placeholder.svg';
      }} 
    />
  );
}

/**
 * Renders company stamp with proper fallbacks
 */
export function renderCompanyStamp(stampSrc?: string | null): React.ReactNode {
  if (!stampSrc) {
    return null;
  }
  
  return (
    <div className="stamp-container">
      <img 
        src={stampSrc} 
        alt="Company Stamp" 
        className="max-h-24 max-w-[120px] object-contain"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.style.display = 'none';
        }} 
      />
    </div>
  );
}

/**
 * Renders signature with proper fallbacks
 */
export function renderSignature(signatureSrc?: string | null): React.ReactNode {
  if (!signatureSrc) {
    return (
      <div className="h-16 border-b border-gray-300 w-40 flex items-end justify-center text-gray-400 text-sm pb-1">
        Signature
      </div>
    );
  }
  
  return (
    <div className="signature-container">
      <img 
        src={signatureSrc} 
        alt="Signature" 
        className="max-h-16 max-w-[160px] object-contain"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.style.display = 'none';
        }} 
      />
    </div>
  );
}

// Format a string for display with proper fallback
export function formatDisplayText(text?: string): string {
  return text || '--';
}

// Format an address for display
export function formatAddress(address: string, city?: string, province?: string, postalCode?: string): string {
  let formattedAddress = address;
  
  if (city) {
    formattedAddress += `, ${city}`;
  }
  
  if (province) {
    formattedAddress += `, ${province}`;
  }
  
  if (postalCode) {
    formattedAddress += ` ${postalCode}`;
  }
  
  return formattedAddress;
}
