/**
 * Utility functions for ensuring company data persistence across app restarts and sessions
 */

import { safeJsonParse, safeJsonStringify } from '@/utils/errorHandling';

/**
 * Storage keys for company data
 */
const STORAGE_KEYS = {
  COMPANY_DETAILS: 'companyDetails',
  PUBLIC_COMPANY_DETAILS: 'publicCompanyDetails',
  COMPANY_USERS: 'companyUsers',
  COMPANY_AUDIT_LOG: 'companyAuditLog',
  COMPANY_DATA_BACKUP: 'companyDataBackup',
  PERSISTENT_COMPANY_DATA: 'persistentCompanyData'
};

/**
 * Initialize company data persistence on application startup
 * This ensures company data remains available even after app restarts and logout
 */
export const initializeCompanyDataPersistence = () => {
  try {
    console.log('Initializing company data persistence with enhanced recovery...');
    
    // First, check if we already have company data in localStorage
    const companyDetails = localStorage.getItem(STORAGE_KEYS.COMPANY_DETAILS);
    const publicCompanyDetails = localStorage.getItem(STORAGE_KEYS.PUBLIC_COMPANY_DETAILS);
    
    // If we have both, we're good - this is normal operation
    if (companyDetails && publicCompanyDetails) {
      console.log('Company data already exists in localStorage - normal operation');
      
      // Ensure we also have a backup copy in the permanent storage
      const persistentData = localStorage.getItem(STORAGE_KEYS.PERSISTENT_COMPANY_DATA);
      if (!persistentData && companyDetails) {
        localStorage.setItem(STORAGE_KEYS.PERSISTENT_COMPANY_DATA, companyDetails);
        console.log('Created persistent copy of company data');
      }
      
      // Create an additional IndexedDB backup
      createIndexedDBBackup(companyDetails);
      
      return;
    }
    
    // First try to restore from persistent company data (should survive logout)
    const persistentCompanyData = localStorage.getItem(STORAGE_KEYS.PERSISTENT_COMPANY_DATA);
    if (persistentCompanyData) {
      try {
        // Restore company details from persistent storage
        localStorage.setItem(STORAGE_KEYS.COMPANY_DETAILS, persistentCompanyData);
        localStorage.setItem(STORAGE_KEYS.PUBLIC_COMPANY_DETAILS, persistentCompanyData);
        console.log('Restored company details from persistent storage');
        return;
      } catch (error) {
        console.error('Error restoring from persistent storage:', error);
      }
    }
    
    // Check if we have a backup in localStorage
    const backedUpCompanyData = localStorage.getItem(STORAGE_KEYS.COMPANY_DATA_BACKUP);
    if (backedUpCompanyData) {
      try {
        const backupData = JSON.parse(backedUpCompanyData);
        
        // Restore company details if available
        if (backupData.companyDetails && !companyDetails) {
          localStorage.setItem(STORAGE_KEYS.COMPANY_DETAILS, backupData.companyDetails);
          console.log('Restored company details from backup');
          
          // Also store in persistent storage
          localStorage.setItem(STORAGE_KEYS.PERSISTENT_COMPANY_DATA, backupData.companyDetails);
        }
        
        // Restore public company details if available
        if (backupData.publicCompanyDetails && !publicCompanyDetails) {
          localStorage.setItem(STORAGE_KEYS.PUBLIC_COMPANY_DETAILS, backupData.publicCompanyDetails);
          console.log('Restored public company details from backup');
        }
        
        // Restore other company-related data
        if (backupData.companyUsers) {
          localStorage.setItem(STORAGE_KEYS.COMPANY_USERS, backupData.companyUsers);
        }
        
        if (backupData.companyAuditLog) {
          localStorage.setItem(STORAGE_KEYS.COMPANY_AUDIT_LOG, backupData.companyAuditLog);
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
    const companyDetails = localStorage.getItem(STORAGE_KEYS.COMPANY_DETAILS);
    const publicCompanyDetails = localStorage.getItem(STORAGE_KEYS.PUBLIC_COMPANY_DETAILS);
    const companyUsers = localStorage.getItem(STORAGE_KEYS.COMPANY_USERS);
    const companyAuditLog = localStorage.getItem(STORAGE_KEYS.COMPANY_AUDIT_LOG);
    
    // Create a backup object
    const companyBackup = {
      companyDetails,
      publicCompanyDetails,
      companyUsers,
      companyAuditLog,
      backupTimestamp: new Date().toISOString(),
      appVersion: '1.0.0', // Add version information for future compatibility
      dataStructureVersion: '1'
    };
    
    // Store backup in localStorage with multiple keys for redundancy
    const backupJSON = JSON.stringify(companyBackup);
    localStorage.setItem(STORAGE_KEYS.COMPANY_DATA_BACKUP, backupJSON);
    localStorage.setItem('companyBackup_redundant', backupJSON); // Redundant copy
    console.log('Company data backup created');
    
    // Always update the persistent storage with the latest company details
    if (companyDetails) {
      localStorage.setItem(STORAGE_KEYS.PERSISTENT_COMPANY_DATA, companyDetails);
      // Create additional redundant copies with different keys
      localStorage.setItem('companyData_permanent', companyDetails);
      localStorage.setItem('mzb_company_data', companyDetails); // Another name to avoid mass clearing
      console.log('Updated persistent company data with redundancy');
    }
    
    // Store in sessionStorage as well
    sessionStorage.setItem('tempCompanyDataBackup', backupJSON);
    sessionStorage.setItem('companyBackup_session', backupJSON); // Redundant copy
    
    // Store in IndexedDB for maximum persistence
    createIndexedDBBackup(companyDetails);
    
    return true;
  } catch (error) {
    console.error('Error creating company data backup:', error);
    return false;
  }
};

/**
 * Save company details in a way that persists across logout
 * @param companyData - The company data JSON string to persist
 */
export const saveCompanyDetailsForPersistence = (companyData: string) => {
  try {
    if (!companyData) {
      console.error('Cannot save empty company data');
      return false;
    }
    
    // Save to persistent storage
    localStorage.setItem(STORAGE_KEYS.PERSISTENT_COMPANY_DATA, companyData);
    console.log('Company data saved to persistent storage');
    
    // Also backup all data
    backupCompanyData();
    
    return true;
  } catch (error) {
    console.error('Error saving persistent company data:', error);
    return false;
  }
};

/**
 * Explicitly restore company data from backup using multiple sources
 * This can be called on app initialization or after logout
 */
export const restoreCompanyDataFromBackup = () => {
  try {
    // Try multiple backup sources in order of preference
    let backedUpCompanyData = localStorage.getItem('companyDataBackup');
    
    // If primary backup not found, try redundant sources
    if (!backedUpCompanyData) {
      backedUpCompanyData = localStorage.getItem('companyBackup_redundant');
    }
    
    // If still not found, try sessionStorage
    if (!backedUpCompanyData) {
      backedUpCompanyData = sessionStorage.getItem('tempCompanyDataBackup');
    }
    
    // If still not found, try alternative sessionStorage
    if (!backedUpCompanyData) {
      backedUpCompanyData = sessionStorage.getItem('companyBackup_session');
    }
    
    // If still not found, try to restore from IndexedDB
    if (!backedUpCompanyData) {
      restoreFromIndexedDB();
      return true; // IndexedDB restoration is async, so just return
    }
    
    // If we have no backup data at all, log and return
    if (!backedUpCompanyData) {
      console.log('No backup found to restore from any source');
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
