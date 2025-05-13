/**
 * Company data safeguards and recovery tools
 */

import { CompanyDetails } from '@/types/company';

// Simulate localStorage with better error handling
const safeStorage = {
  get: (key: string): any => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error);
      return null;
    }
  },
  set: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set ${key} in storage:`, error);
      return false;
    }
  }
};

/**
 * Load company details with fallback mechanisms
 */
export function loadCompanyDetails(): CompanyDetails {
  try {
    // Try primary storage
    const companyData = safeStorage.get('companyDetails');
    
    if (companyData) {
      return companyData;
    }
    
    // Try backup storage
    const backupData = safeStorage.get('companyDetails_backup');
    
    if (backupData) {
      console.warn('Primary company data missing, using backup data');
      safeStorage.set('companyDetails', backupData);
      return backupData;
    }
    
    // Return default if all else fails
    return getDefaultCompanyDetails();
  } catch (error) {
    console.error('Failed to load company details:', error);
    return getDefaultCompanyDetails();
  }
}

/**
 * Save company details with backup
 */
export function saveCompanyDetails(details: CompanyDetails): boolean {
  try {
    // Save to primary storage
    safeStorage.set('companyDetails', details);
    
    // Create automatic backup
    backupCompanyDetails(details);
    
    return true;
  } catch (error) {
    console.error('Failed to save company details:', error);
    return false;
  }
}

/**
 * Backup company details
 */
export async function backupCompanyDetails(details: CompanyDetails): Promise<boolean> {
  try {
    // Save to backup storage
    safeStorage.set('companyDetails_backup', details);
    
    // Store in backup history
    const backupHistory = safeStorage.get('companyDetails_history') || [];
    const backupId = `backup_${Date.now()}`;
    
    backupHistory.unshift({
      id: backupId,
      timestamp: new Date().toISOString(),
      data: details
    });
    
    // Keep max 5 backups
    if (backupHistory.length > 5) {
      backupHistory.pop();
    }
    
    safeStorage.set('companyDetails_history', backupHistory);
    
    return true;
  } catch (error) {
    console.error('Failed to backup company details:', error);
    return false;
  }
}

/**
 * Create encrypted backup of company details
 */
export async function createEncryptedBackup(details: CompanyDetails, passphrase: string): Promise<string> {
  try {
    // In a real implementation, we would encrypt the data here
    // For now, we'll just simulate it
    
    const backupId = `encrypted_backup_${Date.now()}`;
    
    const encryptedBackups = safeStorage.get('companyDetails_encrypted') || {};
    
    // Simple "encryption" by adding a signature (not real encryption)
    encryptedBackups[backupId] = {
      data: details,
      passphrase: passphrase, // In real implementation, we would use the passphrase to encrypt, not store it
      timestamp: new Date().toISOString()
    };
    
    safeStorage.set('companyDetails_encrypted', encryptedBackups);
    
    return backupId;
  } catch (error) {
    console.error('Failed to create encrypted backup:', error);
    throw new Error('Failed to create encrypted backup.');
  }
}

/**
 * Recover company details from backup
 */
export async function recoverCompanyDetails(backupId: string): Promise<CompanyDetails> {
  try {
    // Try to find in regular backups
    if (backupId.startsWith('backup_')) {
      const backupHistory = safeStorage.get('companyDetails_history') || [];
      const backup = backupHistory.find((b: any) => b.id === backupId);
      
      if (backup) {
        return backup.data;
      }
    }
    
    // Try to find in encrypted backups
    if (backupId.startsWith('encrypted_backup_')) {
      const encryptedBackups = safeStorage.get('companyDetails_encrypted') || {};
      const backup = encryptedBackups[backupId];
      
      if (backup) {
        return backup.data;
      }
    }
    
    throw new Error('Backup not found');
  } catch (error) {
    console.error('Failed to recover company details:', error);
    throw new Error('Failed to recover company details from backup.');
  }
}

/**
 * Get default company details
 */
function getDefaultCompanyDetails(): CompanyDetails {
  return {
    name: 'My Company',
    address: '123 Main Street',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8000',
    phone: '',
    email: '',
    website: '',
    vatNumber: '',
    registrationNumber: '',
    industry: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
