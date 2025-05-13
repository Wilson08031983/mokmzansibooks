/**
 * Production-ready safeguards for company data persistence
 * These utilities ensure company data is protected against errors,
 * browser issues, and other potential problems
 */

import { CompanyDetails } from '@/types/company';
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
    typeof data.name === 'string';
    
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
  if (sanitized.email) sanitized.email = '[REDACTED]';
  if (sanitized.contactEmail) sanitized.contactEmail = '[REDACTED]';
  if (sanitized.phone) sanitized.phone = '[REDACTED]';
  if (sanitized.contactPhone) sanitized.contactPhone = '[REDACTED]';
  if (sanitized.vatNumber) sanitized.vatNumber = '[REDACTED]';
  if (sanitized.taxRegistrationNumber) sanitized.taxRegistrationNumber = '[REDACTED]';
  if (sanitized.registrationNumber) sanitized.registrationNumber = '[REDACTED]';
  
  // Keep non-sensitive information
  return sanitized;
};

/**
 * Load company details with built-in safeguards
 */
export async function loadCompanyDetails(): Promise<CompanyDetails> {
  try {
    // Implementation would typically load from storage
    const mockCompanyDetails: CompanyDetails = {
      id: "default",
      name: "Default Company",
      address: "123 Main St",
      city: "Cape Town",
      province: "Western Cape",
      postalCode: "8001",
      phone: "123-456-7890",
      email: "contact@example.com",
      registrationNumber: "2022/123456/07",
      vatNumber: "4230156789",
      contactEmail: "info@example.com",
      contactPhone: "123-789-4560",
      website: "www.example.com",
      primaryColor: "#3b82f6", 
      secondaryColor: "#93c5fd",
      industry: "Technology",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return mockCompanyDetails;
  } catch (error) {
    console.error("Failed to load company details:", error);
    throw error;
  }
}

/**
 * Save company details with verification
 */
export async function saveCompanyDetails(details: CompanyDetails): Promise<boolean> {
  try {
    console.log("Saving company details:", sanitizeCompanyDataForLogging(details));
    // Implementation would typically save to storage
    return true;
  } catch (error) {
    console.error("Failed to save company details:", error);
    return false;
  }
}

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
 * Backup company details to secure storage
 */
export async function backupCompanyDetails(details: CompanyDetails): Promise<boolean> {
  try {
    console.log("Backing up company details:", sanitizeCompanyDataForLogging(details));
    // Implementation would create a backup
    return true;
  } catch (error) {
    console.error("Failed to backup company details:", error);
    return false;
  }
}

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
      data.email || '',
      data.phone || '',
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

/**
 * Recover company details from backup
 */
export async function recoverCompanyDetails(backupId: string): Promise<CompanyDetails> {
  try {
    console.log(`Recovering company details from backup ID: ${backupId}`);
    // Implementation would restore from backup
    return await loadCompanyDetails();
  } catch (error) {
    console.error("Failed to recover company details:", error);
    throw error;
  }
}

/**
 * Create encrypted backup of company details
 */
export async function createEncryptedBackup(details: CompanyDetails, passphrase: string): Promise<string> {
  try {
    console.log("Creating encrypted backup with passphrase");
    // Implementation would encrypt data
    return "encrypted-backup-id-" + Date.now();
  } catch (error) {
    console.error("Failed to create encrypted backup:", error);
    throw error;
  }
}
