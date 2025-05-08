/**
 * Utility functions for ensuring company data persistence across app restarts and sessions
 */

import { safeJsonParse, safeJsonStringify } from '@/utils/errorHandling';

/**
 * Initialize company data persistence on application startup
 * This ensures company data remains available even after app restarts
 */
export const initializeCompanyDataPersistence = () => {
  try {
    console.log('Initializing company data persistence...');
    
    // First, check if we already have company data in localStorage
    const companyDetails = localStorage.getItem('companyDetails');
    const publicCompanyDetails = localStorage.getItem('publicCompanyDetails');
    
    // If we have both, we're good - this is normal operation
    if (companyDetails && publicCompanyDetails) {
      console.log('Company data already exists in localStorage - normal operation');
      return;
    }
    
    // Check if we have a backup in IndexedDB
    // For simplicity, we're using localStorage as our backup since it persists across browser restarts
    const backedUpCompanyData = localStorage.getItem('companyDataBackup');
    if (backedUpCompanyData) {
      try {
        const backupData = JSON.parse(backedUpCompanyData);
        
        // Restore company details if available
        if (backupData.companyDetails && !companyDetails) {
          localStorage.setItem('companyDetails', backupData.companyDetails);
          console.log('Restored company details from backup');
        }
        
        // Restore public company details if available
        if (backupData.publicCompanyDetails && !publicCompanyDetails) {
          localStorage.setItem('publicCompanyDetails', backupData.publicCompanyDetails);
          console.log('Restored public company details from backup');
        }
        
        // Restore other company-related data
        if (backupData.companyUsers) {
          localStorage.setItem('companyUsers', backupData.companyUsers);
        }
        
        if (backupData.companyAuditLog) {
          localStorage.setItem('companyAuditLog', backupData.companyAuditLog);
        }
        
        return;
      } catch (error) {
        console.error('Error restoring from backup:', error);
      }
    }
    
    // If we reach here, we couldn't restore from backup
    console.log('No company data or backup found');
    
  } catch (error) {
    console.error('Error in company data persistence initialization:', error);
  }
};

/**
 * Create a backup of all company-related data
 * This should be called before logout or when saving company details
 */
export const backupCompanyData = () => {
  try {
    // Gather all company-related data
    const companyDetails = localStorage.getItem('companyDetails');
    const publicCompanyDetails = localStorage.getItem('publicCompanyDetails');
    const companyUsers = localStorage.getItem('companyUsers');
    const companyAuditLog = localStorage.getItem('companyAuditLog');
    
    // Create a backup object
    const companyBackup = {
      companyDetails,
      publicCompanyDetails,
      companyUsers,
      companyAuditLog,
      backupTimestamp: new Date().toISOString()
    };
    
    // Store backup in localStorage (more persistent than sessionStorage)
    localStorage.setItem('companyDataBackup', JSON.stringify(companyBackup));
    console.log('Company data backup created');
    
    return true;
  } catch (error) {
    console.error('Error creating company data backup:', error);
    return false;
  }
};

/**
 * Explicitly restore company data from backup
 * This can be called on app initialization or after logout
 */
export const restoreCompanyDataFromBackup = () => {
  try {
    const backedUpCompanyData = localStorage.getItem('companyDataBackup');
    if (!backedUpCompanyData) {
      console.log('No backup found to restore');
      return false;
    }
    
    const backupData = JSON.parse(backedUpCompanyData);
    
    // Restore all available data
    if (backupData.companyDetails) {
      localStorage.setItem('companyDetails', backupData.companyDetails);
    }
    
    if (backupData.publicCompanyDetails) {
      localStorage.setItem('publicCompanyDetails', backupData.publicCompanyDetails);
    }
    
    if (backupData.companyUsers) {
      localStorage.setItem('companyUsers', backupData.companyUsers);
    }
    
    if (backupData.companyAuditLog) {
      localStorage.setItem('companyAuditLog', backupData.companyAuditLog);
    }
    
    console.log('Company data restored from backup');
    return true;
  } catch (error) {
    console.error('Error restoring company data from backup:', error);
    return false;
  }
};
