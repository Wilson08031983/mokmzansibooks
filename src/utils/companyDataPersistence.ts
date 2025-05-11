/**
 * Utility functions for ensuring company data persistence across app restarts and sessions
 * with ultra-strong redundancy safeguards
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
 * Create a backup of company data in IndexedDB for maximum persistence
 * @param companyData - The company data to back up
 */
const createIndexedDBBackup = (companyData: string | null) => {
  // Don't try to backup null data
  if (!companyData) {
    return Promise.resolve(false);
  }
  
  return new Promise<boolean>((resolve) => {
    // Check if IndexedDB is available
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not available in this browser');
      resolve(false);
      return;
    }

    try {
      // Use a timeout to abandon the operation if it takes too long
      const timeoutId = setTimeout(() => {
        console.warn('IndexedDB operation timed out');
        resolve(false);
      }, 3000); // 3 second timeout
      
      const request = indexedDB.open('MokMzansiBooksDB', 1);
      
      // Handle database upgrade (new database or version change)
      request.onupgradeneeded = (event) => {
        const db = request.result;
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains('companyData')) {
          db.createObjectStore('companyData', { keyPath: 'id' });
        }
      };
      
      // Handle successful database open
      request.onsuccess = (event) => {
        try {
          const db = request.result;
          
          // Error handling if store doesn't exist
          if (!db.objectStoreNames.contains('companyData')) {
            console.error('Object store companyData does not exist');
            clearTimeout(timeoutId);
            resolve(false);
            return;
          }
          
          const transaction = db.transaction(['companyData'], 'readwrite');
          const store = transaction.objectStore('companyData');
          
          // Add transaction complete/error handlers
          transaction.oncomplete = () => {
            console.log('Company data backup transaction completed successfully');
            clearTimeout(timeoutId);
            resolve(true);
          };
          
          transaction.onerror = (error) => {
            console.error('Error in IndexedDB transaction:', error);
            clearTimeout(timeoutId);
            resolve(false);
          };
          
          // Store the data
          const putRequest = store.put({
            id: 'mainCompanyData',
            data: companyData,
            timestamp: new Date().toISOString()
          });
          
          putRequest.onerror = (event) => {
            console.error('Error writing to IndexedDB:', putRequest.error);
          };
        } catch (err) {
          console.error('Error during IndexedDB transaction setup:', err);
          clearTimeout(timeoutId);
          resolve(false);
        }
      };
      
      // Handle database open errors
      request.onerror = (event) => {
        console.error('IndexedDB open error:', request.error);
        clearTimeout(timeoutId);
        resolve(false);
      };
    } catch (error) {
      console.error('Error creating IndexedDB backup:', error);
      resolve(false);
    }
  });
};

/**
 * Restore company data from IndexedDB
 * @returns Promise that resolves to true if restoration was successful, false otherwise
 */
const restoreFromIndexedDB = (): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    // Check if IndexedDB is available
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not available in this browser');
      resolve(false);
      return;
    }
    
    try {
      // Use a timeout to abandon the operation if it takes too long
      const timeoutId = setTimeout(() => {
        console.warn('IndexedDB restoration timed out');
        resolve(false);
      }, 3000); // 3 second timeout
      
      const request = indexedDB.open('MokMzansiBooksDB', 1);
      
      // Handle database upgrade (though we don't expect this during restore)
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('companyData')) {
          db.createObjectStore('companyData', { keyPath: 'id' });
        }
        // We're creating a new DB, so there's no data to restore
        clearTimeout(timeoutId);
        resolve(false);
      };
      
      // Handle successful database open
      request.onsuccess = (event) => {
        try {
          const db = request.result;
          
          // Check if our object store exists
          if (!db.objectStoreNames.contains('companyData')) {
            console.warn('Object store companyData does not exist in the database');
            clearTimeout(timeoutId);
            resolve(false);
            return;
          }
          
          const transaction = db.transaction(['companyData'], 'readonly');
          const store = transaction.objectStore('companyData');
          
          // Add transaction error handler
          transaction.onerror = (error) => {
            console.error('Error in IndexedDB read transaction:', error);
            clearTimeout(timeoutId);
            resolve(false);
          };
          
          // Request the company data
          const getRequest = store.get('mainCompanyData');
          
          getRequest.onsuccess = (event) => {
            const companyDataObj = getRequest.result;
            
            if (companyDataObj && companyDataObj.data) {
              try {
                // Restore to localStorage with all possible keys for redundancy
                localStorage.setItem('companyDetails', companyDataObj.data);
                localStorage.setItem('publicCompanyDetails', companyDataObj.data);
                localStorage.setItem('persistentCompanyData', companyDataObj.data);
                localStorage.setItem('companyData_permanent', companyDataObj.data);
                localStorage.setItem('mzb_company_data', companyDataObj.data);
                
                console.log('Company data restored successfully from IndexedDB', {
                  timestamp: companyDataObj.timestamp
                });
                
                // Dispatch an event to notify components that data was restored
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('companyDataRestored', {
                    detail: { source: 'indexedDB', timestamp: companyDataObj.timestamp }
                  }));
                }
                
                clearTimeout(timeoutId);
                resolve(true);
              } catch (e) {
                console.error('Error setting localStorage during IndexedDB restoration:', e);
                clearTimeout(timeoutId);
                resolve(false);
              }
            } else {
              console.warn('No company data found in IndexedDB');
              clearTimeout(timeoutId);
              resolve(false);
            }
          };
          
          getRequest.onerror = (event) => {
            console.error('Error reading from IndexedDB:', getRequest.error);
            clearTimeout(timeoutId);
            resolve(false);
          };
        } catch (err) {
          console.error('Error setting up IndexedDB transaction:', err);
          clearTimeout(timeoutId);
          resolve(false);
        }
      };
      
      request.onerror = (event) => {
        console.error('IndexedDB open error during restoration:', request.error);
        clearTimeout(timeoutId);
        resolve(false);
      };
    } catch (error) {
      console.error('Error during IndexedDB restoration:', error);
      resolve(false);
    }
  });
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
      
      // Create an additional IndexedDB backup for ultra persistence
      createIndexedDBBackup(companyDetails)
        .then(success => {
          if (success) {
            console.log('IndexedDB backup created successfully');
          } else {
            console.warn('Failed to create IndexedDB backup, but localStorage backup succeeded');
          }
        })
        .catch(err => {
          console.error('Error during IndexedDB backup:', err);
        });
      
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
    
    // Try our alternate persistent storage key
    const alternatePersistentData = localStorage.getItem('companyData_permanent');
    if (alternatePersistentData) {
      try {
        localStorage.setItem(STORAGE_KEYS.COMPANY_DETAILS, alternatePersistentData);
        localStorage.setItem(STORAGE_KEYS.PUBLIC_COMPANY_DETAILS, alternatePersistentData);
        console.log('Restored company details from alternate persistent storage');
        return;
      } catch (error) {
        console.error('Error restoring from alternate persistent storage:', error);
      }
    }
    
    // Try our third backup key
    const thirdBackupData = localStorage.getItem('mzb_company_data');
    if (thirdBackupData) {
      try {
        localStorage.setItem(STORAGE_KEYS.COMPANY_DETAILS, thirdBackupData);
        localStorage.setItem(STORAGE_KEYS.PUBLIC_COMPANY_DETAILS, thirdBackupData);
        console.log('Restored company details from third backup storage');
        return;
      } catch (error) {
        console.error('Error restoring from third backup storage:', error);
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
    
    // Try alternate backup key
    const alternateBackup = localStorage.getItem('companyBackup_redundant');
    if (alternateBackup) {
      try {
        const backupData = JSON.parse(alternateBackup);
        if (backupData.companyDetails) {
          localStorage.setItem(STORAGE_KEYS.COMPANY_DETAILS, backupData.companyDetails);
          localStorage.setItem(STORAGE_KEYS.PUBLIC_COMPANY_DETAILS, backupData.companyDetails);
          console.log('Restored company details from alternate backup');
          return;
        }
      } catch (error) {
        console.error('Error restoring from alternate backup:', error);
      }
    }
    
    // Try session storage backup
    const sessionBackup = sessionStorage.getItem('tempCompanyDataBackup');
    if (sessionBackup) {
      try {
        const backupData = JSON.parse(sessionBackup);
        if (backupData.companyDetails) {
          localStorage.setItem(STORAGE_KEYS.COMPANY_DETAILS, backupData.companyDetails);
          localStorage.setItem(STORAGE_KEYS.PUBLIC_COMPANY_DETAILS, backupData.companyDetails);
          console.log('Restored company details from session storage backup');
          return;
        }
      } catch (error) {
        console.error('Error restoring from session storage backup:', error);
      }
    }
    
    // Finally, try IndexedDB
    console.log('No company data or backup found - trying IndexedDB as last resort');
    return restoreFromIndexedDB().then(successful => {
      if (successful) {
        console.log('Successfully restored company data from IndexedDB');
        return true;
      } else {
        console.log('Could not restore from any backup source including IndexedDB');
        return false;
      }
    });
    
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
    console.log('Company data backup created with multiple redundancy');
    
    // Always update the persistent storage with the latest company details
    if (companyDetails) {
      localStorage.setItem(STORAGE_KEYS.PERSISTENT_COMPANY_DATA, companyDetails);
      // Create additional redundant copies with different keys
      localStorage.setItem('companyData_permanent', companyDetails);
      localStorage.setItem('mzb_company_data', companyDetails); // Another name to avoid mass clearing
      console.log('Updated persistent company data with triple redundancy');
    }
    
    // Store in sessionStorage as well
    sessionStorage.setItem('tempCompanyDataBackup', backupJSON);
    sessionStorage.setItem('companyBackup_session', backupJSON); // Redundant copy
    
    // Store in IndexedDB for maximum persistence
    try {
      // Start the IndexedDB backup but don't wait for it
      // This makes the backup function non-blocking but still logs any issues
      createIndexedDBBackup(companyDetails)
        .then(success => {
          if (success) {
            console.log('Complete backup: IndexedDB backup created successfully');
          } else {
            console.warn('IndexedDB backup failed, but other storage backups succeeded');
          }
        })
        .catch(err => {
          console.error('Error during IndexedDB backup in backupCompanyData:', err);
        });
      
      // Return true because localStorage and sessionStorage backups succeeded
      return true;
    } catch (indexedDBError) {
      // Still return true because the primary backups succeeded
      console.error('Unexpected error starting IndexedDB backup:', indexedDBError);
      return true;
    }
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
    
    // Save to persistent storage with multiple redundancy
    localStorage.setItem(STORAGE_KEYS.PERSISTENT_COMPANY_DATA, companyData);
    localStorage.setItem('companyData_permanent', companyData);
    localStorage.setItem('mzb_company_data', companyData);
    
    console.log('Company data saved to persistent storage with redundancy');
    
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
      console.log('Attempting to restore company data from IndexedDB');
      // Return the promise from IndexedDB restoration
      return restoreFromIndexedDB().then(success => {
        console.log('IndexedDB restoration result:', success ? 'successful' : 'failed');
        return success;
      }).catch(err => {
        console.error('Error during IndexedDB restoration:', err);
        return false;
      });
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
    console.error('Error restoring company data:', error);
    return false;
  }
};

// Additional utility to check if company data exists in any form
export const checkForAnyCompanyData = () => {
  // Check all possible storage locations
  const primaryData = localStorage.getItem(STORAGE_KEYS.COMPANY_DETAILS);
  const publicData = localStorage.getItem(STORAGE_KEYS.PUBLIC_COMPANY_DETAILS);
  const persistentData = localStorage.getItem(STORAGE_KEYS.PERSISTENT_COMPANY_DATA);
  const alternateData = localStorage.getItem('companyData_permanent');
  const thirdData = localStorage.getItem('mzb_company_data');
  
  return !!(primaryData || publicData || persistentData || alternateData || thirdData);
};

// All the above functions are already exported individually
