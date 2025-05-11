import { ClientsState } from '../types/client';

// Storage keys with structured object for better organization and consistency
const STORAGE_KEYS = {
  // Primary storage keys
  CLIENTS: 'mok-mzansi-books-clients',
  
  // Persistent storage keys (these keys are specifically designed to survive logout)
  PERSISTENT: 'mok-mzansi-books-clients-persistent',
  ALTERNATE_1: 'mok-mzansi-books-clients-alt1',
  ALTERNATE_2: 'mok-mzansi-books-clients-alt2',
  
  // Backup keys
  BACKUP: 'mok-mzansi-books-clients-backup',
  SESSION_BACKUP: 'mok-mzansi-books-clients-session-backup',
  
  // IndexedDB configuration
  INDEXED_DB_NAME: 'MokMzansiBooksClientDB',
  INDEXED_DB_STORE: 'clientDataStore',
  INDEXED_DB_KEY: 'clientData'
};

// Default empty state
const defaultState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

// Variable to track if IndexedDB has been initialized and is ready
let indexedDBInitialized = false;

/**
 * Explicitly create and initialize IndexedDB for client data persistence
 * @returns Promise that resolves to true if initialization was successful
 */
const initializeIndexedDB = (): Promise<boolean> => {
  // If already initialized, return success immediately
  if (indexedDBInitialized) {
    console.log('IndexedDB already initialized, skipping initialization');
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    // Check if IndexedDB is available in this browser
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not available for client data persistence');
      resolve(false);
      return;
    }
    
    try {
      // Use a timeout to handle potential hanging
      const timeoutId = setTimeout(() => {
        console.warn('IndexedDB initialization timed out for client data');
        resolve(false);
      }, 8000); // Increased timeout for reliability
      
      console.log('Opening client data IndexedDB with version 1');
      const request = indexedDB.open(STORAGE_KEYS.INDEXED_DB_NAME, 1);
      
      // Set up database when first created or version upgraded
      request.onupgradeneeded = (event) => {
        try {
          console.log('IndexedDB upgrade needed - creating schema');
          const db = request.result;
          
          // Create object store if it doesn't exist
          if (!db.objectStoreNames.contains(STORAGE_KEYS.INDEXED_DB_STORE)) {
            console.log('Creating client data object store in IndexedDB');
            const store = db.createObjectStore(STORAGE_KEYS.INDEXED_DB_STORE, { keyPath: 'id' });
            
            // Create indexes for better querying if needed
            store.createIndex('timestamp', 'timestamp', { unique: false });
            
            console.log('Client data object store created successfully');
          } else {
            console.log('Client data object store already exists');
          }
        } catch (error) {
          console.error('Error during IndexedDB upgrade:', error);
        }
      };
      
      // Handle successful database open
      request.onsuccess = () => {
        const db = request.result;
        clearTimeout(timeoutId);
        
        // Verify that the store exists
        if (!db.objectStoreNames.contains(STORAGE_KEYS.INDEXED_DB_STORE)) {
          console.warn('Store not found after successful open - creating it now');
          
          // Close the current connection
          db.close();
          
          // Retry with version increment to trigger the upgrade
          const newVersion = db.version + 1;
          console.log(`Retrying with version ${newVersion}`);
          
          const retryRequest = indexedDB.open(STORAGE_KEYS.INDEXED_DB_NAME, newVersion);
          
          retryRequest.onupgradeneeded = (event) => {
            try {
              console.log('Creating object store in retry attempt');
              const retryDb = retryRequest.result;
              const store = retryDb.createObjectStore(STORAGE_KEYS.INDEXED_DB_STORE, { keyPath: 'id' });
              store.createIndex('timestamp', 'timestamp', { unique: false });
            } catch (retryError) {
              console.error('Error in retry store creation:', retryError);
            }
          };
          
          retryRequest.onsuccess = () => {
            console.log('IndexedDB retry initialization successful');
            // Set the global flag
            indexedDBInitialized = true;
            resolve(true);
          };
          
          retryRequest.onerror = (event) => {
            console.error('IndexedDB retry initialization failed:', retryRequest.error);
            resolve(false);
          };
        } else {
          console.log('Client data IndexedDB initialized successfully');
          // Set the global flag
          indexedDBInitialized = true;
          resolve(true);
        }
      };
      
      // Handle database errors
      request.onerror = (event) => {
        clearTimeout(timeoutId);
        console.error('Error initializing client data IndexedDB:', request.error);
        resolve(false);
      };
    } catch (error) {
      console.error('Unexpected error initializing client data IndexedDB:', error);
      resolve(false);
    }
  });
};




/**
 * Initialize client data persistence system with multiple storage mechanisms
 * This should be called early in the application lifecycle
 */
export function initializeClientDataPersistence(): Promise<void> {
  console.log('Initializing client data persistence system with enhanced reliability');
  
  // Initialize IndexedDB first, regardless of other operations
  // This ensures the database is ready when we need it later
  initializeIndexedDB().catch(err => {
    console.warn('IndexedDB initialization during app startup had an issue:', err);
  });
  
  return new Promise<void>(async (resolve) => {
    try {
      // Check if primary client data exists
      const clientData = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      
      if (!clientData) {
        console.log('No client data found, checking for backups');
        
        // Try to restore from backup (await to ensure completion)
        const success = await restoreClientDataFromBackup();
        
        if (!success) {
          console.log('No backups found, creating empty state');
          // Initialize with empty state
          const emptyState = JSON.stringify(defaultState);
          localStorage.setItem(STORAGE_KEYS.CLIENTS, emptyState);
          
          // Initialize other storage keys with empty state for redundancy
          localStorage.setItem(STORAGE_KEYS.PERSISTENT, emptyState);
          localStorage.setItem(STORAGE_KEYS.ALTERNATE_1, emptyState);
          localStorage.setItem(STORAGE_KEYS.ALTERNATE_2, emptyState);
          localStorage.setItem(STORAGE_KEYS.BACKUP, emptyState);
          
          // Also store the empty state in IndexedDB if available
          // Don't wait for this to complete since we already have data in localStorage
          storeInIndexedDB(emptyState).catch(err => {
            console.warn('Failed to store empty state in IndexedDB:', err);
          });
        }
      } else {
        console.log('Client data found in localStorage');
        
        // Create backup of existing data in all storage mechanisms
        createClientDataBackup();
        
        // Ensure persistent copies exist for redundancy
        if (!localStorage.getItem(STORAGE_KEYS.PERSISTENT)) {
          localStorage.setItem(STORAGE_KEYS.PERSISTENT, clientData);
        }
        
        if (!localStorage.getItem(STORAGE_KEYS.ALTERNATE_1)) {
          localStorage.setItem(STORAGE_KEYS.ALTERNATE_1, clientData);
        }
        
        if (!localStorage.getItem(STORAGE_KEYS.ALTERNATE_2)) {
          localStorage.setItem(STORAGE_KEYS.ALTERNATE_2, clientData);
        }
        
        // Also ensure the data is in IndexedDB (fire and forget, don't block)
        if (indexedDBInitialized) {
          storeInIndexedDB(clientData).catch(err => {
            console.warn('Failed to store existing data in IndexedDB during initialization:', err);
          });
        }
      }
      
      resolve();
    } catch (error) {
      console.error('Error initializing client data persistence:', error);
      resolve(); // Resolve anyway to not block application startup
    }
  });
}

/**
 * Initialize client data from storage or backup
 */
export function initializeClientData(): void {
  try {
    // If no client data exists, try to restore from backup
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      console.log('No primary client data found, attempting to restore from backup');
      restoreClientDataFromBackup();
    } else {
      console.log('Client data found, ensuring redundant copies exist');
      // Make sure we have redundant copies
      const clientData = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      localStorage.setItem(STORAGE_KEYS.PERSISTENT, clientData || '');
      localStorage.setItem(STORAGE_KEYS.ALTERNATE_1, clientData || '');
      localStorage.setItem(STORAGE_KEYS.ALTERNATE_2, clientData || '');
    }
  } catch (error) {
    console.error('Error initializing client data:', error);
  }
}

/**
 * Get client data safely with fallbacks
 */
export function getSafeClientData(): ClientsState {
  try {
    // Try multiple storage locations in order of preference
    let clientData = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    
    // If not found, try persistent storage
    if (!clientData) {
      clientData = localStorage.getItem(STORAGE_KEYS.PERSISTENT);
    }
    
    // If still not found, try alternates
    if (!clientData) {
      clientData = localStorage.getItem(STORAGE_KEYS.ALTERNATE_1) || 
                 localStorage.getItem(STORAGE_KEYS.ALTERNATE_2);
    }
    
    if (!clientData) return defaultState;
    
    // Parse and validate the data structure
    try {
      const parsedData = JSON.parse(clientData) as ClientsState;
      return {
        companies: Array.isArray(parsedData.companies) ? parsedData.companies : [],
        individuals: Array.isArray(parsedData.individuals) ? parsedData.individuals : [],
        vendors: Array.isArray(parsedData.vendors) ? parsedData.vendors : []
      };
    } catch (parseError) {
      console.error('Error parsing client data:', parseError);
      return defaultState;
    }
  } catch (error) {
    console.error('Error getting safe client data:', error);
    return defaultState;
  }
}

/**
 * Create a comprehensive backup of client data across multiple storage mechanisms
 */
export function createClientDataBackup(): boolean {
  try {
    // Get the primary data
    const clientData = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!clientData) {
      console.warn('No client data found to backup');
      return false;
    }
    
    // Validate data before backup
    try {
      JSON.parse(clientData);
    } catch (parseError) {
      console.error('Invalid client data found, not backing up:', parseError);
      return false;
    }
    
    // Store redundant copies in localStorage with different keys
    localStorage.setItem(STORAGE_KEYS.BACKUP, clientData);
    localStorage.setItem(STORAGE_KEYS.PERSISTENT, clientData);
    localStorage.setItem(STORAGE_KEYS.ALTERNATE_1, clientData);
    localStorage.setItem(STORAGE_KEYS.ALTERNATE_2, clientData);
    
    // Store to sessionStorage for session-level protection
    sessionStorage.setItem(STORAGE_KEYS.SESSION_BACKUP, clientData);
    
    // Store in IndexedDB for maximum persistence (non-blocking)
    storeInIndexedDB(clientData).catch(err => {
      console.error('Failed to backup client data to IndexedDB:', err);
    });
    
    console.log('Comprehensive client data backup created across multiple storage mechanisms');
    return true;
  } catch (error) {
    console.error('Error creating client data backup:', error);
    return false;
  }
}

/**
 * Store client data in IndexedDB for maximum persistence
 * Includes automatic store creation if not found
 */
const storeInIndexedDB = (clientData: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    // Validate the data first
    try {
      JSON.parse(clientData);
    } catch (e) {
      console.error('Invalid client data for IndexedDB storage:', e);
      resolve(false);
      return;
    }
    
    // Check if IndexedDB is available
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not available for client data storage');
      resolve(false);
      return;
    }
    
    // If we're already in the middle of initializing, queue this operation with a short delay
    if (!indexedDBInitialized) {
      console.log('IndexedDB not initialized yet, initializing now before storage...');
    }
    
    try {
      // Use a timeout to handle potential hanging
      const timeoutId = setTimeout(() => {
        console.warn('IndexedDB storage operation timed out for client data');
        // Store in localStorage as fallback when IndexedDB times out
        try {
          localStorage.setItem(STORAGE_KEYS.PERSISTENT, clientData);
          localStorage.setItem(STORAGE_KEYS.ALTERNATE_1, clientData);
          console.log('Data saved to localStorage as fallback due to IndexedDB timeout');
        } catch (fallbackError) {
          console.error('Even localStorage fallback failed:', fallbackError);
        }
        resolve(false);
      }, 6000); // Increased timeout for reliability
      
      // First ensure the database is initialized properly
      initializeIndexedDB()
        .then(initialized => {
          if (!initialized) {
            clearTimeout(timeoutId);
            console.error('Failed to initialize IndexedDB before storage - using localStorage fallback');
            // Use localStorage as fallback
            try {
              localStorage.setItem(STORAGE_KEYS.PERSISTENT, clientData);
              localStorage.setItem(STORAGE_KEYS.ALTERNATE_1, clientData);
              console.log('Data saved to localStorage as fallback');
              resolve(true); // Still consider it a success since we saved the data somewhere
            } catch (fallbackError) {
              console.error('Failed to use localStorage fallback:', fallbackError);
              resolve(false);
            }
            return;
          }
          
          // Now open the database for the actual storage operation
          const request = indexedDB.open(STORAGE_KEYS.INDEXED_DB_NAME, 1);
          
          // Handle schema upgrades if needed
          request.onupgradeneeded = (event) => {
            try {
              console.log('Creating object store during storage operation');
              const db = request.result;
              if (!db.objectStoreNames.contains(STORAGE_KEYS.INDEXED_DB_STORE)) {
                const store = db.createObjectStore(STORAGE_KEYS.INDEXED_DB_STORE, { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
              }
            } catch (upgradeError) {
              console.error('Error during upgrade in storage operation:', upgradeError);
            }
          };
          
          // Handle successful database open
          request.onsuccess = () => {
            try {
              const db = request.result;
              
              // Verify our object store exists one more time
              if (!db.objectStoreNames.contains(STORAGE_KEYS.INDEXED_DB_STORE)) {
                console.error('Client data store still not found in IndexedDB after initialization');
                db.close();
                clearTimeout(timeoutId);
                
                // Last resort: try with version upgrade
                const currentVersion = db.version;
                const retryRequest = indexedDB.open(STORAGE_KEYS.INDEXED_DB_NAME, currentVersion + 1);
                
                retryRequest.onupgradeneeded = (event) => {
                  try {
                    console.log('Creating client data store in emergency retry');
                    const retryDb = retryRequest.result;
                    const store = retryDb.createObjectStore(STORAGE_KEYS.INDEXED_DB_STORE, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                  } catch (retryError) {
                    console.error('Error in emergency store creation:', retryError);
                  }
                };
                
                retryRequest.onsuccess = () => {
                  try {
                    const retryDb = retryRequest.result;
                    // Now try to store the data
                    const transaction = retryDb.transaction([STORAGE_KEYS.INDEXED_DB_STORE], 'readwrite');
                    const store = transaction.objectStore(STORAGE_KEYS.INDEXED_DB_STORE);
                    
                    const putRequest = store.put({
                      id: STORAGE_KEYS.INDEXED_DB_KEY,
                      data: clientData,
                      timestamp: new Date().toISOString()
                    });
                    
                    transaction.oncomplete = () => {
                      clearTimeout(timeoutId);
                      console.log('Client data stored in IndexedDB after emergency retry');
                      resolve(true);
                    };
                    
                    transaction.onerror = (error) => {
                      clearTimeout(timeoutId);
                      console.error('Transaction error in emergency retry:', error);
                      resolve(false);
                    };
                  } catch (finalError) {
                    clearTimeout(timeoutId);
                    console.error('Final error in emergency retry:', finalError);
                    resolve(false);
                  }
                };
                
                retryRequest.onerror = () => {
                  clearTimeout(timeoutId);
                  console.error('Failed emergency retry:', retryRequest.error);
                  resolve(false);
                };
                
                return;
              }
              
              // Normal path - store exists, proceed with transaction
              const transaction = db.transaction([STORAGE_KEYS.INDEXED_DB_STORE], 'readwrite');
              const store = transaction.objectStore(STORAGE_KEYS.INDEXED_DB_STORE);
              
              // Handle transaction completion
              transaction.oncomplete = () => {
                clearTimeout(timeoutId);
                console.log('Client data successfully stored in IndexedDB');
                resolve(true);
              };
              
              // Handle transaction errors
              transaction.onerror = (error) => {
                clearTimeout(timeoutId);
                console.error('Error in IndexedDB transaction for client data:', error);
                resolve(false);
              };
              
              // Store the data
              const putRequest = store.put({
                id: STORAGE_KEYS.INDEXED_DB_KEY,
                data: clientData,
                timestamp: new Date().toISOString()
              });
              
              putRequest.onerror = (event) => {
                console.error('Error writing client data to IndexedDB:', putRequest.error);
              };
            } catch (err) {
              clearTimeout(timeoutId);
              console.error('Error during IndexedDB transaction setup for client data:', err);
              resolve(false);
            }
          };
          
          // Handle database open errors
          request.onerror = (event) => {
            clearTimeout(timeoutId);
            console.error('IndexedDB open error for client data storage:', request.error);
            resolve(false);
          };
        })
        .catch(err => {
          clearTimeout(timeoutId);
          console.error('Error in initialization promise during storage:', err);
          resolve(false);
        });
    } catch (error) {
      console.error('Unexpected error storing client data in IndexedDB:', error);
      resolve(false);
    }
  });
};

/**
 * Restore client data from IndexedDB with enhanced error handling and auto-initialization
 */
const restoreFromIndexedDB = (): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    // Check if IndexedDB is available
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not available for client data restoration');
      resolve(false);
      return;
    }
    
    // Check initialization state
    if (!indexedDBInitialized) {
      console.log('IndexedDB not yet initialized - initializing before restoration');
    }
    
    try {
      // Use a timeout to handle potential hanging
      const timeoutId = setTimeout(() => {
        console.warn('IndexedDB restoration timed out - checking localStorage fallbacks');
        // Try getting data from localStorage instead
        const fallbackData = localStorage.getItem(STORAGE_KEYS.PERSISTENT) || 
                            localStorage.getItem(STORAGE_KEYS.ALTERNATE_1) || 
                            localStorage.getItem(STORAGE_KEYS.ALTERNATE_2);
        
        if (fallbackData) {
          console.log('Successfully retrieved data from localStorage fallback after IndexedDB timeout');
          resolve(true);
        } else {
          console.warn('No fallback data found in localStorage either');
          resolve(false);
        }
      }, 5000); // Increased timeout for reliability
      
      // First ensure the database is properly initialized
      initializeIndexedDB()
        .then(initialized => {
          if (!initialized) {
            clearTimeout(timeoutId);
            console.warn('Failed to initialize IndexedDB for restoration - checking localStorage instead');
            
            // Try getting data from localStorage instead
            const fallbackData = localStorage.getItem(STORAGE_KEYS.PERSISTENT) || 
                                localStorage.getItem(STORAGE_KEYS.ALTERNATE_1) || 
                                localStorage.getItem(STORAGE_KEYS.ALTERNATE_2);
            
            if (fallbackData) {
              console.log('Successfully retrieved data from localStorage fallback');
              resolve(true);
            } else {
              console.warn('No fallback data found in localStorage either');
              resolve(false);
            }
            return;
          }
          
          // Now open the database for the actual restoration
          const request = indexedDB.open(STORAGE_KEYS.INDEXED_DB_NAME, 1);
          
          // Handle successful database open
          request.onsuccess = () => {
            try {
              const db = request.result;
              
              // Verify our object store exists
              if (!db.objectStoreNames.contains(STORAGE_KEYS.INDEXED_DB_STORE)) {
                console.warn('Client data store not found in IndexedDB during restoration');
                db.close();
                clearTimeout(timeoutId);
                resolve(false);
                return;
              }
              
              // Create transaction and get data
              const transaction = db.transaction([STORAGE_KEYS.INDEXED_DB_STORE], 'readonly');
              const store = transaction.objectStore(STORAGE_KEYS.INDEXED_DB_STORE);
              
              // Handle transaction errors
              transaction.onerror = (error) => {
                clearTimeout(timeoutId);
                console.error('Error in IndexedDB transaction during client data restoration:', error);
                resolve(false);
              };
              
              // Request the data
              const getRequest = store.get(STORAGE_KEYS.INDEXED_DB_KEY);
              
              getRequest.onsuccess = (event) => {
                const clientDataObj = getRequest.result;
                
                if (clientDataObj && clientDataObj.data) {
                  try {
                    // Validate the data before restoration
                    try {
                      const parsed = JSON.parse(clientDataObj.data);
                      if (!parsed || typeof parsed !== 'object') {
                        throw new Error('Invalid data format');
                      }
                    } catch (parseError) {
                      console.error('Invalid client data format in IndexedDB:', parseError);
                      clearTimeout(timeoutId);
                      resolve(false);
                      return;
                    }
                    
                    // Restore to localStorage with multiple keys for redundancy
                    localStorage.setItem(STORAGE_KEYS.CLIENTS, clientDataObj.data);
                    localStorage.setItem(STORAGE_KEYS.PERSISTENT, clientDataObj.data);
                    localStorage.setItem(STORAGE_KEYS.ALTERNATE_1, clientDataObj.data);
                    localStorage.setItem(STORAGE_KEYS.ALTERNATE_2, clientDataObj.data);
                    
                    // Also store to session storage as another layer
                    sessionStorage.setItem(STORAGE_KEYS.SESSION_BACKUP, clientDataObj.data);
                    
                    console.log('Client data restored successfully from IndexedDB', {
                      timestamp: clientDataObj.timestamp,
                      dataSize: clientDataObj.data.length
                    });
                    
                    // Success
                    clearTimeout(timeoutId);
                    resolve(true);
                  } catch (storageError) {
                    console.error('Error setting localStorage during client data IndexedDB restoration:', storageError);
                    clearTimeout(timeoutId);
                    resolve(false);
                  }
                } else {
                  console.warn('No valid client data found in IndexedDB');
                  clearTimeout(timeoutId);
                  resolve(false);
                }
              };
              
              getRequest.onerror = (event) => {
                console.error('Error reading client data from IndexedDB:', getRequest.error);
                clearTimeout(timeoutId);
                resolve(false);
              };
            } catch (err) {
              console.error('Error during IndexedDB transaction setup for client data restoration:', err);
              clearTimeout(timeoutId);
              resolve(false);
            }
          };
          
          // Handle database open errors
          request.onerror = (event) => {
            console.error('IndexedDB open error during client data restoration:', request.error);
            clearTimeout(timeoutId);
            resolve(false);
          };
        })
        .catch(initError => {
          clearTimeout(timeoutId);
          console.error('Error in initialization during restoration:', initError);
          resolve(false);
        });
    } catch (error) {
      console.error('Unexpected error during client data IndexedDB restoration:', error);
      resolve(false);
    }
  });
};

/**
 * Restore client data from backup with multiple storage mechanisms
 * @returns A Promise that resolves to true if data was restored successfully
 */
export function restoreClientDataFromBackup(): Promise<boolean> {
  return new Promise<boolean>(async (resolve) => {
    try {
      // Try persistent storage first (most likely to survive logout)
      let backup = localStorage.getItem(STORAGE_KEYS.PERSISTENT);
      
      // If not found, try alternate persistent storage
      if (!backup) {
        backup = localStorage.getItem(STORAGE_KEYS.ALTERNATE_1);
      }
      
      // If not found, try another alternate
      if (!backup) {
        backup = localStorage.getItem(STORAGE_KEYS.ALTERNATE_2);
      }
      
      // If not found, try regular backup
      if (!backup) {
        backup = localStorage.getItem(STORAGE_KEYS.BACKUP);
      }
      
      // If not found, try session storage
      if (!backup) {
        backup = sessionStorage.getItem(STORAGE_KEYS.SESSION_BACKUP);
      }
      
      // If we found a backup in any storage, use it
      if (backup) {
        // Validate backup data
        try {
          JSON.parse(backup);
          
          // Restore to all storage locations for redundancy
          localStorage.setItem(STORAGE_KEYS.CLIENTS, backup);
          localStorage.setItem(STORAGE_KEYS.PERSISTENT, backup);
          localStorage.setItem(STORAGE_KEYS.ALTERNATE_1, backup);
          localStorage.setItem(STORAGE_KEYS.ALTERNATE_2, backup);
          
          console.log('Client data restored from local backup');
          resolve(true);
          return;
        } catch (e) {
          console.error('Invalid backup data found:', e);
        }
      }
      
      // If all else fails, try IndexedDB as last resort
      console.log('No local client data backups found, trying IndexedDB');
      const indexedDBResult = await restoreFromIndexedDB();
      
      if (indexedDBResult) {
        console.log('Successfully restored client data from IndexedDB');
        resolve(true);
      } else {
        console.log('Failed to restore client data from any source');
        resolve(false);
      }
    } catch (error) {
      console.error('Error restoring client data from backup:', error);
      resolve(false);
    }
  });
}

/**
 * Save client data safely with comprehensive persistence across multiple storage mechanisms
 * @param clientData The client data to save
 * @returns Promise that resolves to true if save was successful
 */
export function setSafeClientData(clientData: ClientsState): Promise<boolean> {
  return new Promise<boolean>(async (resolve) => {
    try {
      // Validate and normalize data structure
      const safeData: ClientsState = {
        companies: Array.isArray(clientData.companies) ? clientData.companies : [],
        individuals: Array.isArray(clientData.individuals) ? clientData.individuals : [],
        vendors: Array.isArray(clientData.vendors) ? clientData.vendors : []
      };
      
      // Convert to string once for all storage operations
      const jsonData = JSON.stringify(safeData);
      
      // Primary storage
      localStorage.setItem(STORAGE_KEYS.CLIENTS, jsonData);
      
      // Create redundant copies in localStorage with different keys
      // These are especially important to preserve during logout
      localStorage.setItem(STORAGE_KEYS.PERSISTENT, jsonData);
      localStorage.setItem(STORAGE_KEYS.ALTERNATE_1, jsonData);
      localStorage.setItem(STORAGE_KEYS.ALTERNATE_2, jsonData);
      
      // Session storage backup
      sessionStorage.setItem(STORAGE_KEYS.SESSION_BACKUP, jsonData);
      
      // Create regular backup
      localStorage.setItem(STORAGE_KEYS.BACKUP, jsonData);
      
      // Store in IndexedDB for maximum persistence (important for keeping data during logout)
      const indexedDBResult = await storeInIndexedDB(jsonData).catch(() => false);
      
      if (indexedDBResult) {
        console.log('Client data saved successfully with IndexedDB backup');
      } else {
        console.log('Client data saved successfully, but IndexedDB backup failed');
      }
      
      // Overall operation is successful as long as primary storage succeeded
      resolve(true);
    } catch (error) {
      console.error('Error saving client data:', error);
      resolve(false);
    }
  });
}
