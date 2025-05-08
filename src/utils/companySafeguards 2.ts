import { CompanyDetails } from '@/contexts/CompanyContext';
import { safeJsonParse, safeJsonStringify } from './errorHandling';

/**
 * Utility functions for protecting company data from accidental deletion or modification
 */

/**
 * Creates a backup of company details with versioning
 * @param companyDetails The company details to backup
 * @returns Success status of the backup operation
 */
export const backupCompanyDetails = (companyDetails: CompanyDetails): boolean => {
  try {
    // Get current timestamp for versioning
    const timestamp = new Date().toISOString();
    
    // Create a versioned backup
    const backupKey = `companyDetails_backup_${timestamp}`;
    localStorage.setItem(backupKey, safeJsonStringify(companyDetails));
    
    // Keep track of backups (store last 5 versions)
    const backupList = localStorage.getItem('companyDetailsBackupList');
    const backups = backupList ? safeJsonParse(backupList, []) : [];
    
    // Add new backup to the list
    backups.unshift({ key: backupKey, timestamp });
    
    // Keep only the last 5 backups
    const trimmedBackups = backups.slice(0, 5);
    
    // Remove any backups beyond the 5 most recent
    if (backups.length > 5) {
      backups.slice(5).forEach((backup: { key: string }) => {
        localStorage.removeItem(backup.key);
      });
    }
    
    // Save the updated backup list
    localStorage.setItem('companyDetailsBackupList', safeJsonStringify(trimmedBackups));
    
    return true;
  } catch (error) {
    console.error('Error creating company details backup:', error);
    return false;
  }
};

/**
 * Validates company details to ensure required fields are present
 * @param details The company details to validate
 * @returns Validation result with isValid flag and any error messages
 */
export const validateCompanyDetails = (details: CompanyDetails): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required fields
  if (!details.name || details.name.trim() === '') {
    errors.push('Company name is required');
  }
  
  if (!details.contactEmail || details.contactEmail.trim() === '') {
    errors.push('Contact email is required');
  }
  
  if (!details.contactPhone || details.contactPhone.trim() === '') {
    errors.push('Contact phone is required');
  }
  
  if (!details.address || details.address.trim() === '') {
    errors.push('Company address is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Creates an encrypted backup of company details for additional protection
 * @param companyDetails The company details to encrypt and backup
 * @returns Success status of the encryption operation
 */
export const createEncryptedBackup = (companyDetails: CompanyDetails): boolean => {
  try {
    // Create a protected version of the company data
    const protectedData = {
      ...companyDetails,
      protected: true,
      backupTimestamp: new Date().toISOString()
    };
    
    // Simple encryption using base64 encoding (for a real app, use proper encryption)
    const encryptedData = btoa(safeJsonStringify(protectedData));
    localStorage.setItem('companyDetails_encrypted', encryptedData);
    
    // Also store a recovery copy in sessionStorage
    sessionStorage.setItem('companyDetails_recovery', safeJsonStringify(protectedData));
    
    return true;
  } catch (error) {
    console.error('Error creating encrypted backup:', error);
    return false;
  }
};

/**
 * Recovers company details from backups if the primary data is missing or corrupted
 * @returns Recovered company details or null if recovery failed
 */
export const recoverCompanyDetails = (): CompanyDetails | null => {
  try {
    // First try to get from primary storage
    const primaryData = localStorage.getItem('companyDetails');
    if (primaryData) {
      const parsedData = safeJsonParse(primaryData, null);
      if (parsedData && parsedData.name) {
        return parsedData;
      }
    }
    
    // Try to recover from encrypted backup
    const encryptedData = localStorage.getItem('companyDetails_encrypted');
    if (encryptedData) {
      try {
        const decryptedData = atob(encryptedData);
        const parsedData = safeJsonParse(decryptedData, null);
        if (parsedData && parsedData.name) {
          console.log('Recovered company details from encrypted backup');
          return parsedData;
        }
      } catch (e) {
        console.error('Failed to decrypt backup:', e);
      }
    }
    
    // Try to recover from session storage
    const sessionData = sessionStorage.getItem('companyDetails_recovery');
    if (sessionData) {
      const parsedData = safeJsonParse(sessionData, null);
      if (parsedData && parsedData.name) {
        console.log('Recovered company details from session storage');
        return parsedData;
      }
    }
    
    // Try to recover from the most recent backup
    const backupList = localStorage.getItem('companyDetailsBackupList');
    if (backupList) {
      const backups = safeJsonParse(backupList, []);
      if (backups.length > 0) {
        const latestBackup = backups[0];
        const backupData = localStorage.getItem(latestBackup.key);
        if (backupData) {
          const parsedData = safeJsonParse(backupData, null);
          if (parsedData && parsedData.name) {
            console.log('Recovered company details from backup:', latestBackup.timestamp);
            return parsedData;
          }
        }
      }
    }
    
    // All recovery attempts failed
    return null;
  } catch (error) {
    console.error('Error recovering company details:', error);
    return null;
  }
};

/**
 * Confirms that the user wants to make changes to company details
 * @param message The confirmation message to display
 * @returns Promise that resolves to true if confirmed, false otherwise
 */
export const confirmCompanyChanges = (message: string = 'Are you sure you want to update your company details?'): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.confirm(message)) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};
