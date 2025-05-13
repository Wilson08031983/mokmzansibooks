/**
 * PersistenceService
 * 
 * A robust service to handle data persistence across browser sessions.
 * This service implements:
 * 1. Multiple storage mechanisms (localStorage, IndexedDB, sessionStorage)
 * 2. Data versioning
 * 3. Automatic data recovery
 * 4. Periodic backups
 * 5. Graceful fallbacks when storage mechanisms are unavailable
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

import { storageAvailability } from '@/utils/indexedDBAvailabilityCheck';

// IndexedDB database details
const DB_NAME = 'MokMzansiPersistentStorage';
const DB_VERSION = 1;
const STORE_NAME = 'persistentData';

// In-memory fallback when all storage mechanisms fail
const memoryStorage = new Map<string, any>();

/**
 * Initialize the IndexedDB database for persistent storage
 */
const initIndexedDB = (): Promise<IDBDatabase | null> => {
  // First check if IndexedDB is available
  if (!storageAvailability.checked) {
    // Initialize the availability check if not done yet
    return storageAvailability.check().then(strategy => {
      if (!strategy.useIndexedDB) {
        console.warn('IndexedDB is not available, using fallback storage mechanisms');
        return null;
      }
      return openIndexedDB();
    });
  } else if (!storageAvailability.indexedDB) {
    console.warn('IndexedDB already determined to be unavailable, using fallback storage');
    return Promise.resolve(null);
  }
  
  return openIndexedDB();
};

/**
 * Open the IndexedDB database with proper error handling and timeouts
 */
const openIndexedDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      // Set a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.error('IndexedDB open request timed out');
        resolve(null);
      }, 3000); // 3 second timeout
      
      request.onerror = (event) => {
        clearTimeout(timeoutId);
        console.error('Error opening IndexedDB:', event);
        resolve(null); // Resolve with null instead of rejecting to enable fallbacks
      };
      
      request.onsuccess = (event) => {
        clearTimeout(timeoutId);
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
      
      request.onblocked = () => {
        clearTimeout(timeoutId);
        console.warn('IndexedDB request was blocked');
        resolve(null);
      };
    } catch (error) {
      console.error('Exception while opening IndexedDB:', error);
      resolve(null);
    }
  });
};

/**
 * Save data to multiple storage mechanisms for redundancy
 */
export const saveData = async (key: string, data: any): Promise<void> => {
  try {
    // Serialize the data once
    const serializedData = JSON.stringify(data);
    
    // Track which storage mechanisms succeeded
    let localStorageSuccess = false;
    let sessionStorageSuccess = false;
    let indexedDBSuccess = false;
    
    // 1. Try localStorage (primary, faster)
    if (storageAvailability.localStorage) {
      try {
        localStorage.setItem(key, serializedData);
        
        // Create backup keys with timestamps for recovery
        const timestamp = new Date().toISOString();
        const backupKey = `${key}_backup_${timestamp}`;
        localStorage.setItem(backupKey, serializedData);
        
        // Clean up old backups to prevent storage bloat
        cleanupBackups(key);
        
        localStorageSuccess = true;
      } catch (err) {
        console.error(`Error saving to localStorage for key ${key}:`, err);
      }
    }
    
    // 2. Try sessionStorage as additional backup
    if (storageAvailability.sessionStorage) {
      try {
        sessionStorage.setItem(key, serializedData);
        sessionStorage.setItem(`${key}_timestamp`, Date.now().toString());
        sessionStorageSuccess = true;
      } catch (err) {
        console.error(`Error saving to sessionStorage for key ${key}:`, err);
      }
    }
    
    // 3. Try IndexedDB for persistent storage (more robust)
    try {
      const db = await initIndexedDB();
      
      if (db) {
        await new Promise<void>((resolve, reject) => {
          try {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // Set a timeout to prevent hanging transactions
            const timeoutId = setTimeout(() => {
              console.warn('IndexedDB transaction timed out');
              resolve();
            }, 2000);
            
            const request = store.put({
              key,
              value: data,
              timestamp: Date.now()
            });
            
            request.onsuccess = () => {
              clearTimeout(timeoutId);
              indexedDBSuccess = true;
              resolve();
            };
            
            request.onerror = (event) => {
              clearTimeout(timeoutId);
              console.error('Error storing data in IndexedDB:', event);
              resolve(); // Resolve anyway to continue with other storage mechanisms
            };
            
            transaction.oncomplete = () => {
              clearTimeout(timeoutId);
              resolve();
            };
            
            transaction.onerror = (event) => {
              clearTimeout(timeoutId);
              console.error('IndexedDB transaction error:', event);
              resolve(); // Resolve anyway to continue
            };
          } catch (err) {
            console.error('IndexedDB transaction setup failed:', err);
            resolve(); // Resolve anyway to continue
          }
        });
      }
    } catch (err) {
      console.error('IndexedDB storage failed:', err);
    }
    
    // 4. Use memory fallback as last resort
    if (!localStorageSuccess && !sessionStorageSuccess && !indexedDBSuccess) {
      memoryStorage.set(key, data);
      console.warn(`Using in-memory fallback storage for key ${key} as all other mechanisms failed`);
    }
    
    // Log storage status for debugging
    console.log(`Storage status for ${key}: localStorage=${localStorageSuccess}, sessionStorage=${sessionStorageSuccess}, indexedDB=${indexedDBSuccess}`);
  } catch (error) {
    console.error(`Error in saveData for key ${key}:`, error);
    // Last resort: try in-memory storage
    try {
      memoryStorage.set(key, data);
    } catch (e) {
      console.error('Even in-memory storage failed:', e);
    }
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
 * - Checks storage availability
 * - Sets up periodic backups
 * - Checks and restores data if needed
 */
export const initPersistenceService = async (): Promise<void> => {
  try {
    // First check which storage mechanisms are available
    await storageAvailability.check();
    
    if (!storageAvailability.indexedDB) {
      console.warn('⚠️ IndexedDB is not available - using localStorage/sessionStorage with memory fallback');
    }
    
    if (!storageAvailability.localStorage && !storageAvailability.sessionStorage) {
      console.warn('⚠️ Neither localStorage nor sessionStorage is available - using memory-only storage');
    }
    
    // Immediately check and restore critical data if needed
    await restoreCriticalDataIfNeeded();
    console.log('✅ Initial data restoration check completed');
    
    // Set up periodic backups (every 5 minutes)
    const backupInterval = setInterval(() => {
      backupAllCriticalData().catch(err => {
        console.error('Error during periodic backup:', err);
      });
    }, 5 * 60 * 1000);
    
    // Listen for beforeunload events to create final backup
    window.addEventListener('beforeunload', () => {
      backupAllCriticalData().catch(err => {
        console.error('Error during beforeunload backup:', err);
      });
    });
    
    // Listen for storage events to sync between tabs
    window.addEventListener('storage', (event) => {
      if (event.key && CRITICAL_STORAGE_KEYS.includes(event.key)) {
        console.log(`Storage event detected for key: ${event.key}`);
        // Dispatch a custom event that components can listen for
        window.dispatchEvent(new CustomEvent('storage-updated', { 
          detail: { key: event.key, newValue: event.newValue }
        }));
      }
    });
    
    console.log('✅ Persistence service initialized successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error initializing persistence service:', error);
    // Even if initialization fails, we want to continue
    return Promise.resolve();
  }
};

// Helper function to update all localStorage references in one place
export const migrateToRobustStorage = async (): Promise<void> => {
  // First backup all critical data
  await backupAllCriticalData();
  
  console.log('Data has been migrated to the robust storage system');
};
