/**
 * Utility functions for formatting values
 */

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: ZAR)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'ZAR'): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to a more readable format
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a percentage value
 * @param value The value to format as percentage
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Get image URL from a File or string
 * @param image File or string URL
 * @returns URL string
 */
export const getImageUrl = (image: string | File | null | undefined): string | null => {
  if (!image) return null;
  return typeof image === 'string' ? image : URL.createObjectURL(image);
};

/**
 * Helper function to create image URL for company assets
 * @param url URL of the image
 * @returns URL string or empty string if not available
 */
export const getCompanyAssetUrl = (url: string | File | null | undefined): string => {
  if (!url) return '';
  return typeof url === 'string' ? url : URL.createObjectURL(url);
};

/**
 * Render company logo in documents - this function should be used in React components
 * @param logoUrl URL of the company logo
 * @param altText Alternative text for the logo
 * @returns String URL to be used in img src
 */
export const renderCompanyLogo = (logoUrl: string | File | null | undefined): string => {
  return getCompanyAssetUrl(logoUrl);
};

/**
 * Render company stamp in documents - this function should be used in React components
 * @param stampUrl URL of the company stamp
 * @returns String URL to be used in img src
 */
export const renderCompanyStamp = (stampUrl: string | File | null | undefined): string => {
  return getCompanyAssetUrl(stampUrl);
};

/**
 * Render signature in documents - this function should be used in React components
 * @param signatureUrl URL of the signature
 * @returns String URL to be used in img src
 */
export const renderSignature = (signatureUrl: string | File | null | undefined): string => {
  return getCompanyAssetUrl(signatureUrl);
};
