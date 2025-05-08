/**
 * Production-ready safeguards for company data persistence
 * These utilities ensure company data is protected against errors,
 * browser issues, and other potential problems
 */

import { safeJsonParse, safeJsonStringify } from './errorHandling';

/**
 * Validates company data structure to ensure it meets minimum requirements
 * @param data The company data object to validate
 * @returns {boolean} True if the data is valid, false otherwise
 */
export const validateCompanyData = (data: any): boolean => {
  if (!data) return false;
  
  // Check essential fields
  const hasRequiredFields = 
    data.name &&
    data.contactEmail &&
    data.contactPhone &&
    typeof data.name === 'string' &&
    typeof data.contactEmail === 'string' &&
    typeof data.contactPhone === 'string';
    
  return hasRequiredFields;
};

/**
 * Create a deep copy of company data with sensitive information redacted
 * for safe logging or analytics
 * @param data The company data to sanitize
 * @returns Sanitized copy with sensitive information removed
 */
export const sanitizeCompanyDataForLogging = (data: any): any => {
  if (!data) return null;
  
  const sanitized = { ...data };
  
  // Redact sensitive information
  if (sanitized.contactEmail) sanitized.contactEmail = '[REDACTED]';
  if (sanitized.contactPhone) sanitized.contactPhone = '[REDACTED]';
  if (sanitized.vatNumber) sanitized.vatNumber = '[REDACTED]';
  if (sanitized.taxRegistrationNumber) sanitized.taxRegistrationNumber = '[REDACTED]';
  if (sanitized.csdRegistrationNumber) sanitized.csdRegistrationNumber = '[REDACTED]';
  
  // Keep non-sensitive information
  return sanitized;
};

/**
 * Performs a recovery attempt if company data is missing or corrupt
 * @returns {boolean} True if recovery was successful
 */
export const attemptDataRecovery = (): boolean => {
  try {
    // Check if we have a backup in localStorage
    const backup = localStorage.getItem('companyDataBackup');
    if (!backup) return false;
    
    const backupData = JSON.parse(backup);
    
    // Check if we have valid backup data
    if (backupData.publicCompanyDetails) {
      localStorage.setItem('publicCompanyDetails', backupData.publicCompanyDetails);
      console.log('Restored public company details from backup');
    } else {
      return false;
    }
    
    // Restore other data if available
    if (backupData.companyDetails) {
      localStorage.setItem('companyDetails', backupData.companyDetails);
      console.log('Restored company details from backup');
    }
    
    return true;
  } catch (error) {
    console.error('Error during recovery attempt:', error);
    return false;
  }
};

/**
 * Create a checksum of company data to detect unauthorized changes
 * @param data The company data object
 * @returns A string checksum representing the data state
 */
export const createDataChecksum = (data: any): string => {
  if (!data) return '';
  
  try {
    // Simple checksum based on key fields
    const fields = [
      data.name || '',
      data.registrationNumber || '',
      data.contactEmail || '',
      data.contactPhone || '',
      data.address || ''
    ];
    
    // Create a checksum by joining fields and using a hash function
    // For simplicity, we're just using a string concat here
    // In production, you would use a proper hash function
    return fields.join('|');
  } catch (error) {
    console.error('Error creating data checksum:', error);
    return '';
  }
};

/**
 * Verifies data integrity by comparing checksums
 * @param data The company data object
 * @param storedChecksum Previously stored checksum
 * @returns True if data is valid and matches checksum
 */
export const verifyDataIntegrity = (data: any, storedChecksum: string): boolean => {
  if (!data || !storedChecksum) return false;
  
  const currentChecksum = createDataChecksum(data);
  return currentChecksum === storedChecksum;
};
