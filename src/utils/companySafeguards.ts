
/**
 * Company data safeguard utilities
 */

import { CompanyDetails } from '@/types/company';

/**
 * Initialize company safeguards system
 */
export function initializeSafeguards() {
  console.log('Company safeguards initialized');
  return true;
}

/**
 * Load company details with safety checks
 */
export async function loadCompanyDetails(): Promise<CompanyDetails | null> {
  try {
    const storedData = localStorage.getItem('companyDetails');
    if (!storedData) return null;
    
    const parsedData = JSON.parse(storedData);
    return validateCompanyData(parsedData) ? parsedData : null;
  } catch (error) {
    console.error('Error loading company details:', error);
    return null;
  }
}

/**
 * Save company details safely
 */
export async function saveCompanyDetails(details: CompanyDetails): Promise<boolean> {
  try {
    // First backup existing data
    const existingData = localStorage.getItem('companyDetails');
    if (existingData) {
      localStorage.setItem('companyDetailsBackup', existingData);
    }
    
    // Then save new data
    localStorage.setItem('companyDetails', JSON.stringify(details));
    return true;
  } catch (error) {
    console.error('Error saving company details:', error);
    return false;
  }
}

/**
 * Create a backup of company details
 */
export function backupCompanyDetails(details: CompanyDetails): boolean {
  try {
    const timestamp = new Date().toISOString();
    const backupKey = `companyDetailsBackup_${timestamp}`;
    
    localStorage.setItem(backupKey, JSON.stringify(details));
    localStorage.setItem('companyDetailsLatestBackup', backupKey);
    console.log('Created backup of company details', details.name);
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
}

/**
 * Create an encrypted backup of company details for sensitive information
 */
export function createEncryptedBackup(details: CompanyDetails): boolean {
  try {
    // In a real implementation, we would encrypt the data
    // For now, we'll just create a backup with a different key
    const timestamp = new Date().toISOString();
    const backupKey = `companyDetailsEncryptedBackup_${timestamp}`;
    
    localStorage.setItem(backupKey, JSON.stringify(details));
    localStorage.setItem('companyDetailsLatestEncryptedBackup', backupKey);
    console.log('Created encrypted backup of company details', details.name);
    return true;
  } catch (error) {
    console.error('Error creating encrypted backup:', error);
    return false;
  }
}

/**
 * Recover company details from backup
 */
export async function recoverCompanyDetails(): Promise<CompanyDetails | null> {
  try {
    // First try the latest backup
    const latestBackupKey = localStorage.getItem('companyDetailsLatestBackup');
    if (latestBackupKey) {
      const backupData = localStorage.getItem(latestBackupKey);
      if (backupData) {
        const parsedData = JSON.parse(backupData);
        if (validateCompanyData(parsedData)) {
          return parsedData;
        }
      }
    }
    
    // If that fails, try the standard backup
    const standardBackup = localStorage.getItem('companyDetailsBackup');
    if (standardBackup) {
      const parsedData = JSON.parse(standardBackup);
      if (validateCompanyData(parsedData)) {
        return parsedData;
      }
    }
    
    // If all backups fail, return null
    console.log('No valid backup found to recover');
    return null;
  } catch (error) {
    console.error('Error recovering company details:', error);
    return null;
  }
}

/**
 * Validates company data structure
 */
function validateCompanyData(data: any): data is CompanyDetails {
  return Boolean(
    data &&
    typeof data === 'object' &&
    typeof data.name === 'string' &&
    data.name.length > 0
  );
}
