
/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency (ZAR)
 * @param value - The number to format
 * @param currencyCode - The currency code, defaults to ZAR
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | string, currencyCode = 'ZAR'): string => {
  // Convert string to number if needed
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle NaN or invalid values
  if (isNaN(numericValue)) return 'R0.00';
  
  // Format the currency based on locale and currency code
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number | string): string => {
  // Convert string to number if needed
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle NaN or invalid values
  if (isNaN(numericValue)) return '0';
  
  // Format the number with thousand separators
  return new Intl.NumberFormat('en-ZA').format(numericValue);
};

/**
 * Format a percentage value
 * @param value - The number to format as percentage
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | string, decimals = 2): string => {
  // Convert string to number if needed
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle NaN or invalid values
  if (isNaN(numericValue)) return '0%';
  
  // Format as percentage
  return `${numericValue.toFixed(decimals)}%`;
};

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string or Date object
 * @param format - Format style ('short', 'medium', 'long', 'full')
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format options based on requested format
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? 'numeric' : 'long',
      day: 'numeric',
    };
    
    // Add weekday for long and full formats
    if (format === 'long' || format === 'full') {
      options.weekday = 'long';
    }
    
    return new Intl.DateTimeFormat('en-ZA', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a phone number to a standard format
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  } else {
    return phoneNumber; // Return original if not standard length
  }
};

/**
 * Format file size to human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
