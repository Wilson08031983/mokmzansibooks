/**
 * PersistenceService
 * 
 * A robust service to handle data persistence across browser sessions.
 * This service implements:
 * 1. Multiple storage mechanisms (localStorage, IndexedDB)
 * 2. Data versioning
 * 3. Automatic data recovery
 * 4. Periodic backups
 */

// Define the storage keys we want to protect and ensure persistence for
const CRITICAL_STORAGE_KEYS = [
  'mokClients',
  'mok-mzansi-books-clients',
  'companyDetails',
  'publicCompanyDetails',
  'mokmzansiBusinessProfile',
  'savedQuotes',
  'savedInvoices',
  'currency',
  'selectedClientForInvoice',
  'selectedTemplateId',
  'invoiceData',
  'quoteData'
];

// IndexedDB database details
const DB_NAME = 'MokMzansiPersistentStorage';
const DB_VERSION = 1;
const STORE_NAME = 'persistentData';

/**
 * Initialize the IndexedDB database for persistent storage
 */
const initIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject('Failed to open IndexedDB');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Create an object store for persistent data
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

/**
 * Save data to both localStorage and IndexedDB for redundancy
 */
export const saveData = async (key: string, data: any): Promise<void> => {
  try {
    // Always stringify data for storage
    const stringifiedData = JSON.stringify(data);
    
    // Store in localStorage (primary, fast access)
    localStorage.setItem(key, stringifiedData);
    
    // Create a timestamped backup
    const timestamp = new Date().toISOString();
    localStorage.setItem(`${key}_backup_${timestamp}`, stringifiedData);
    
    // Maintain only 3 most recent backups
    cleanupBackups(key);
    
    // Also store in IndexedDB for persistent storage (secondary, more robust)
    try {
      const db = await initIndexedDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      store.put({
        key,
        value: stringifiedData,
        timestamp: new Date().toISOString(),
        version: 1, // Can be used for data migration in the future
      });
      
      transaction.oncomplete = () => {
        console.log(`Data successfully saved to both storage mechanisms: ${key}`);
        db.close();
      };
      
      transaction.onerror = (event) => {
        console.error('Transaction error:', event);
        db.close();
      };
    } catch (err) {
      console.error('IndexedDB storage failed, falling back to localStorage only:', err);
    }
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieve data from the most reliable source available
 */
export const getData = async (key: string, defaultValue: any = null): Promise<any> => {
  try {
    // Try localStorage first (faster)
    const localData = localStorage.getItem(key);
    
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (error) {
        console.warn(`Error parsing localStorage data for key ${key}, trying backup...`);
      }
    }
    
    // If localStorage failed or returned null, try to get the latest backup
    const latestBackup = getLatestBackup(key);
    if (latestBackup) {
      try {
        return JSON.parse(latestBackup);
      } catch (error) {
        console.warn(`Error parsing backup data for key ${key}, trying IndexedDB...`);
      }
    }
    
    // If all localStorage attempts failed, try IndexedDB
    try {
      const db = await initIndexedDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        
        request.onsuccess = (event) => {
          const result = (event.target as IDBRequest).result;
          db.close();
          
          if (result && result.value) {
            try {
              const parsedValue = JSON.parse(result.value);
              // If we recovered from IndexedDB, restore it to localStorage
              localStorage.setItem(key, result.value);
              resolve(parsedValue);
            } catch (error) {
              console.error(`Error parsing IndexedDB data for key ${key}:`, error);
              resolve(defaultValue);
            }
          } else {
            resolve(defaultValue);
          }
        };
        
        request.onerror = (event) => {
          console.error('Error retrieving data from IndexedDB:', event);
          db.close();
          reject(event);
        };
      });
    } catch (err) {
      console.error('IndexedDB retrieval failed:', err);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove data from all storage mechanisms
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    // Remove from localStorage
    localStorage.removeItem(key);
    
    // Remove any backups
    const backupKeys = Object.keys(localStorage).filter(k => k.startsWith(`${key}_backup_`));
    backupKeys.forEach(backupKey => localStorage.removeItem(backupKey));
    
    // Remove from IndexedDB
    try {
      const db = await initIndexedDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(key);
      
      transaction.oncomplete = () => {
        console.log(`Data successfully removed from all storage mechanisms: ${key}`);
        db.close();
      };
      
      transaction.onerror = (event) => {
        console.error('Transaction error during removal:', event);
        db.close();
      };
    } catch (err) {
      console.error('IndexedDB removal failed:', err);
    }
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Find the latest backup for a key
 */
const getLatestBackup = (key: string): string | null => {
  const backupKeys = Object.keys(localStorage)
    .filter(k => k.startsWith(`${key}_backup_`))
    .sort()
    .reverse();
  
  if (backupKeys.length > 0) {
    return localStorage.getItem(backupKeys[0]);
  }
  
  return null;
};

/**
 * Keep only the 3 most recent backups for each key
 */
const cleanupBackups = (key: string): void => {
  const backupKeys = Object.keys(localStorage)
    .filter(k => k.startsWith(`${key}_backup_`))
    .sort()
    .reverse();
  
  if (backupKeys.length > 3) {
    // Remove older backups, keeping only the 3 most recent
    backupKeys.slice(3).forEach(oldKey => localStorage.removeItem(oldKey));
  }
};

/**
 * Perform a backup of all critical data
 */
export const backupAllCriticalData = async (): Promise<void> => {
  try {
    for (const key of CRITICAL_STORAGE_KEYS) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          // Create a backup in IndexedDB
          const db = await initIndexedDB();
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          
          store.put({
            key: `${key}_master_backup`,
            value: data,
            timestamp: new Date().toISOString(),
            version: 1,
          });
          
          transaction.oncomplete = () => {
            db.close();
          };
          
          transaction.onerror = (event) => {
            console.error('Transaction error during backup:', event);
            db.close();
          };
        } catch (err) {
          console.error(`Error backing up ${key} to IndexedDB:`, err);
        }
      }
    }
    console.log('Critical data backup completed successfully');
  } catch (error) {
    console.error('Error during critical data backup:', error);
  }
};

/**
 * Restore critical data from backups if needed
 */
export const restoreCriticalDataIfNeeded = async (): Promise<void> => {
  try {
    let restoredCount = 0;
    
    for (const key of CRITICAL_STORAGE_KEYS) {
      // Check if the key exists in localStorage
      if (!localStorage.getItem(key)) {
        // Try to restore from IndexedDB
        try {
          const db = await initIndexedDB();
          const transaction = db.transaction([STORE_NAME], 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(`${key}_master_backup`);
          
          request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            if (result && result.value) {
              localStorage.setItem(key, result.value);
              console.log(`Restored ${key} from backup`);
              restoredCount++;
            }
            db.close();
          };
          
          request.onerror = (event) => {
            console.error(`Error retrieving backup for ${key}:`, event);
            db.close();
          };
        } catch (err) {
          console.error(`IndexedDB restoration failed for ${key}:`, err);
        }
      }
    }
    
    if (restoredCount > 0) {
      console.log(`Restored ${restoredCount} items from backups`);
    }
  } catch (error) {
    console.error('Error during critical data restoration:', error);
  }
};

/**
 * Initialize the persistence service
 * - Sets up periodic backups
 * - Checks and restores data if needed
 */
export const initPersistenceService = (): void => {
  // Immediately check and restore critical data if needed
  restoreCriticalDataIfNeeded().then(() => {
    console.log('Initial data restoration check completed');
  });
  
  // Set up periodic backups (every 5 minutes)
  setInterval(() => {
    backupAllCriticalData();
  }, 5 * 60 * 1000);
  
  // Listen for beforeunload events to create final backup
  window.addEventListener('beforeunload', () => {
    backupAllCriticalData();
  });
  
  console.log('Persistence service initialized');
};

// Helper function to update all localStorage references in one place
export const migrateToRobustStorage = async (): Promise<void> => {
  // First backup all critical data
  await backupAllCriticalData();
  
  console.log('Data has been migrated to the robust storage system');
};
