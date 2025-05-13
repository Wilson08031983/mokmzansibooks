
/**
 * Company data safeguard utilities
 * 
 * Functions to backup, encrypt, and restore company data
 */

import { CompanyDetails } from '@/types/company';
import { v4 as uuidv4 } from 'uuid';

// Storage keys
const COMPANY_BACKUP_KEY = 'companyBackup';
const ENCRYPTED_BACKUPS_KEY = 'encryptedCompanyBackups';

/**
 * Create a backup of company details
 */
export async function backupCompanyDetails(companyData: CompanyDetails): Promise<boolean> {
  try {
    const backup = {
      ...companyData,
      backupDate: new Date().toISOString(),
      backupId: uuidv4()
    };
    
    localStorage.setItem(COMPANY_BACKUP_KEY, JSON.stringify(backup));
    console.log('Company backup created successfully');
    return true;
  } catch (error) {
    console.error('Error creating company backup:', error);
    throw new Error('Failed to create company backup');
  }
}

/**
 * Create an encrypted backup of company details with a passphrase
 */
export async function createEncryptedBackup(companyData: CompanyDetails, passphrase: string): Promise<string> {
  try {
    if (!passphrase) {
      throw new Error('Passphrase is required for encrypted backups');
    }
    
    // Generate a unique ID for this backup
    const backupId = uuidv4();
    
    // In a real implementation, we would encrypt the data with the passphrase
    // For this demo, we'll just store the data with the backup ID
    
    // Get existing backups
    const existingBackupsJson = localStorage.getItem(ENCRYPTED_BACKUPS_KEY);
    const existingBackups = existingBackupsJson ? JSON.parse(existingBackupsJson) : {};
    
    // Create a new backup entry
    const newBackup = {
      data: companyData,
      createdAt: new Date().toISOString(),
      // In a real implementation, we would store a hash of the passphrase
      passphraseHash: passphrase,
    };
    
    // Add to backups
    existingBackups[backupId] = newBackup;
    
    // Save backups
    localStorage.setItem(ENCRYPTED_BACKUPS_KEY, JSON.stringify(existingBackups));
    
    return backupId;
  } catch (error) {
    console.error('Error creating encrypted company backup:', error);
    throw new Error('Failed to create encrypted backup');
  }
}

/**
 * Recover company details from a backup ID
 */
export async function recoverCompanyDetails(backupId: string): Promise<CompanyDetails> {
  try {
    // First try to find it in encrypted backups
    const encryptedBackupsJson = localStorage.getItem(ENCRYPTED_BACKUPS_KEY);
    
    if (encryptedBackupsJson) {
      const encryptedBackups = JSON.parse(encryptedBackupsJson);
      
      if (encryptedBackups[backupId]) {
        console.log('Found backup in encrypted backups');
        return encryptedBackups[backupId].data;
      }
    }
    
    // If not found in encrypted backups, check regular backup
    const backupJson = localStorage.getItem(COMPANY_BACKUP_KEY);
    
    if (!backupJson) {
      throw new Error('No backup found');
    }
    
    const backup = JSON.parse(backupJson);
    
    if (backup.backupId === backupId) {
      console.log('Found backup in regular backups');
      return backup;
    }
    
    throw new Error('Backup ID not found');
  } catch (error) {
    console.error('Error recovering company details:', error);
    throw new Error('Failed to recover company details');
  }
}

/**
 * Validate company data structure
 */
export function validateCompanyData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check for required fields
  if (!data.name) {
    return false;
  }
  
  return true;
}

/**
 * Load company details from localStorage
 */
export async function loadCompanyDetails(): Promise<CompanyDetails> {
  try {
    const companyDataStr = localStorage.getItem('companyDetails');
    if (!companyDataStr) {
      throw new Error('No company details found');
    }
    
    const companyData = JSON.parse(companyDataStr);
    if (!validateCompanyData(companyData)) {
      throw new Error('Invalid company data format');
    }
    
    return companyData;
  } catch (error) {
    console.error('Error loading company details:', error);
    throw new Error('Failed to load company details');
  }
}

/**
 * Save company details to localStorage
 */
export async function saveCompanyDetails(companyData: CompanyDetails): Promise<boolean> {
  try {
    if (!validateCompanyData(companyData)) {
      throw new Error('Invalid company data format');
    }
    
    localStorage.setItem('companyDetails', JSON.stringify({
      ...companyData,
      updatedAt: new Date().toISOString()
    }));
    
    return true;
  } catch (error) {
    console.error('Error saving company details:', error);
    throw new Error('Failed to save company details');
  }
}
