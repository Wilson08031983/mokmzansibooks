/**
 * PermanentStorage - A bombproof data persistence system for MokMzansi Books
 * 
 * This system provides multiple layers of redundancy to ensure critical data is never lost:
 * 1. Immediate localStorage with multiple backup keys
 * 2. SessionStorage for additional protection
 * 3. IndexedDB for deep persistence (with automatic retry)
 * 4. Redundant JSON formatting with error correction
 * 5. Automatic backup restoration with verification
 * 6. Delayed validation to ensure data is successfully written
 */

// Type definitions for stored data
export interface StorageOptions {
  enableIndexedDB?: boolean;
  enableSessionStorage?: boolean;
  enableMultipleFormats?: boolean;
  enableAutoRestore?: boolean;
  validateAfterSave?: boolean;
  autoRestoreOnCorruption?: boolean;
  debugMode?: boolean;
}

// Default options
const DEFAULT_OPTIONS: StorageOptions = {
  enableIndexedDB: true,
  enableSessionStorage: true,
  enableMultipleFormats: true,
  enableAutoRestore: true,
  validateAfterSave: true,
  autoRestoreOnCorruption: true,
  debugMode: false
};

// Storage namespaces to avoid collisions
export enum StorageNamespace {
  COMPANY = 'company',
  CLIENTS = 'clients',
  INVOICES = 'invoices',
  QUOTES = 'quotes',
  SETTINGS = 'settings',
  USER = 'user'
}

// Define the PermanentStorage class as a singleton
class PermanentStorageSystem {
  private indexedDBName = 'MokMzansiBooksPermanentStorage';
  private initialized = false;
  private options: StorageOptions = DEFAULT_OPTIONS;
  private errorCount: Record<string, number> = {};
  private lastRestored: Record<string, number> = {};
  private ready = false;
  
  // Storage keys with built-in redundancy
  private getStorageKeys(namespace: StorageNamespace) {
    const base = `mok-mzansi-books-${namespace}`;
    return {
      PRIMARY: base,
      BACKUP_1: `${base}-backup-1`,
      BACKUP_2: `${base}-backup-2`,
      SECURE: `${base}-secure`,
      PERSISTENT: `${base}-persistent`,
      SESSION: `${base}-session`,
      INDEXED_DB_STORE: `${namespace}Store`,
      INDEXED_DB_KEY: `${namespace}Data`
    };
  }
  
  constructor() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('PermanentStorage: Not in browser environment, some features will be disabled');
      this.options.enableIndexedDB = false;
      this.options.enableSessionStorage = false;
      return;
    }
    
    this.initializeStorage();
  }
  
  /**
   * Initialize the storage system
   */
  async initializeStorage(options: StorageOptions = {}): Promise<boolean> {
    // If already initialized, don't do it again
    if (this.initialized) {
      return true;
    }
    
    try {
      // Apply options with defaults
      this.options = { ...DEFAULT_OPTIONS, ...options };
      
      if (this.options.debugMode) {
        console.log('PermanentStorage: Initializing with options', this.options);
      }
      
      // Initialize IndexedDB if enabled
      if (this.options.enableIndexedDB) {
        await this.initializeIndexedDB();
      }
      
      // Mark as initialized
      this.initialized = true;
      this.ready = true;
      
      if (this.options.debugMode) {
        console.log('PermanentStorage: Initialization complete');
      }
      
      // Validate existing data integrity
      if (this.options.autoRestoreOnCorruption) {
        this.validateAllData();
      }
      
      return true;
    } catch (error) {
      console.error('PermanentStorage: Failed to initialize', error);
      // We still mark as initialized to prevent repeated init attempts
      this.initialized = true;
      return false;
    }
  }
  
  /**
   * Initialize IndexedDB
   */
  private async initializeIndexedDB(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if IndexedDB is available
      if (!('indexedDB' in window)) {
        console.warn('PermanentStorage: IndexedDB not available');
        resolve(false);
        return;
      }
      
      try {
        // Open the database
        const openRequest = indexedDB.open(this.indexedDBName, 1);
        
        // Set a timeout to resolve in case the operation hangs
        const timeout = setTimeout(() => {
          console.warn('PermanentStorage: IndexedDB initialization timed out');
          resolve(false);
        }, 3000);
        
        // Error handler
        openRequest.onerror = (event) => {
          clearTimeout(timeout);
          console.error('PermanentStorage: IndexedDB error', event);
          resolve(false);
        };
        
        // Success handler
        openRequest.onsuccess = () => {
          clearTimeout(timeout);
          if (this.options.debugMode) {
            console.log('PermanentStorage: IndexedDB opened successfully');
          }
          resolve(true);
        };
        
        // Upgrade needed handler (first time or version change)
        openRequest.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          
          // Create object stores for each namespace
          Object.values(StorageNamespace).forEach(namespace => {
            const storeName = this.getStorageKeys(namespace as StorageNamespace).INDEXED_DB_STORE;
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName);
            }
          });
          
          if (this.options.debugMode) {
            console.log('PermanentStorage: IndexedDB schema upgraded');
          }
        };
      } catch (error) {
        console.error('PermanentStorage: Failed to initialize IndexedDB', error);
        resolve(false);
      }
    });
  }
  
  /**
   * Save data to storage with multiple redundancy layers
   * @param namespace The storage namespace
   * @param data The data to save
   * @returns Promise that resolves to true if saved successfully
   */
  async saveData<T>(namespace: StorageNamespace, data: T): Promise<boolean> {
    // If not initialized, initialize first
    if (!this.initialized) {
      await this.initializeStorage();
    }
    
    try {
      const keys = this.getStorageKeys(namespace);
      const jsonData = this.safeStringify(data);
      
      if (!jsonData) {
        console.error(`PermanentStorage: Failed to stringify data for ${namespace}`);
        return false;
      }
      
      // 1. Save to localStorage (primary)
      localStorage.setItem(keys.PRIMARY, jsonData);
      
      // 2. Create immediate backups in localStorage
      localStorage.setItem(keys.BACKUP_1, jsonData);
      localStorage.setItem(keys.BACKUP_2, jsonData);
      
      // 3. Create a secure backup (simple encoding)
      if (this.options.enableMultipleFormats) {
        try {
          localStorage.setItem(keys.SECURE, btoa(jsonData));
        } catch (error) {
          console.warn(`PermanentStorage: Could not create secure backup for ${namespace}`, error);
        }
      }
      
      // 4. Save to persistent storage (special format)
      localStorage.setItem(keys.PERSISTENT, jsonData);
      
      // 5. Save to sessionStorage if enabled
      if (this.options.enableSessionStorage) {
        try {
          sessionStorage.setItem(keys.SESSION, jsonData);
        } catch (error) {
          console.warn(`PermanentStorage: Could not save to sessionStorage for ${namespace}`, error);
        }
      }
      
      // 6. Save to IndexedDB if enabled (non-blocking)
      if (this.options.enableIndexedDB) {
        this.saveToIndexedDB(namespace, jsonData).catch(error => {
          console.error(`PermanentStorage: IndexedDB save failed for ${namespace}`, error);
        });
      }
      
      // 7. Validate data was saved correctly if enabled
      if (this.options.validateAfterSave) {
        setTimeout(() => {
          this.validateData(namespace);
        }, 500);
      }
      
      if (this.options.debugMode) {
        console.log(`PermanentStorage: Data saved for ${namespace}`);
      }
      
      return true;
    } catch (error) {
      console.error(`PermanentStorage: Failed to save data for ${namespace}`, error);
      return false;
    }
  }
  
  /**
   * Load data from storage with automatic fallback to backups
   * @param namespace The storage namespace
   * @returns The loaded data or null if not found
   */
  async loadData<T>(namespace: StorageNamespace): Promise<T | null> {
    // If not initialized, initialize first
    if (!this.initialized) {
      await this.initializeStorage();
    }
    
    try {
      const keys = this.getStorageKeys(namespace);
      
      // 1. Try to load from primary localStorage
      let data = this.loadFromLocalStorage<T>(keys.PRIMARY);
      if (data) return data;
      
      // 2. Try to load from backup localStorage
      data = this.loadFromLocalStorage<T>(keys.BACKUP_1);
      if (data) return data;
      
      data = this.loadFromLocalStorage<T>(keys.BACKUP_2);
      if (data) return data;
      
      // 3. Try to load from persistent storage
      data = this.loadFromLocalStorage<T>(keys.PERSISTENT);
      if (data) return data;
      
      // 4. Try to load from secure storage
      if (this.options.enableMultipleFormats) {
        try {
          const secureData = localStorage.getItem(keys.SECURE);
          if (secureData) {
            const jsonData = atob(secureData);
            const parsedData = this.safeParse<T>(jsonData);
            if (parsedData) return parsedData;
          }
        } catch (error) {
          console.warn(`PermanentStorage: Could not load from secure storage for ${namespace}`, error);
        }
      }
      
      // 5. Try to load from sessionStorage if enabled
      if (this.options.enableSessionStorage) {
        try {
          const sessionData = sessionStorage.getItem(keys.SESSION);
          if (sessionData) {
            const parsedData = this.safeParse<T>(sessionData);
            if (parsedData) return parsedData;
          }
        } catch (error) {
          console.warn(`PermanentStorage: Could not load from sessionStorage for ${namespace}`, error);
        }
      }
      
      // 6. Try to load from IndexedDB if enabled
      if (this.options.enableIndexedDB) {
        try {
          const dbData = await this.loadFromIndexedDB<T>(namespace);
          if (dbData) {
            if (this.options.debugMode) {
              console.log(`PermanentStorage: Loaded data from IndexedDB for ${namespace}`);
            }
            
            // Restore to other storage mechanisms if loaded from IndexedDB
            this.saveData(namespace, dbData);
            
            return dbData;
          }
        } catch (error) {
          console.error(`PermanentStorage: IndexedDB load failed for ${namespace}`, error);
        }
      }
      
      // 7. Auto-restore from backups if enabled
      if (this.options.enableAutoRestore && 
          this.lastRestored[namespace] === undefined || 
          Date.now() - this.lastRestored[namespace] > 3600000) { // Once per hour max
        
        this.lastRestored[namespace] = Date.now();
        this.restoreData(namespace);
      }
      
      // Return null if all attempts failed
      return null;
    } catch (error) {
      console.error(`PermanentStorage: Failed to load data for ${namespace}`, error);
      return null;
    }
  }
  
  /**
   * Load data from localStorage
   */
  private loadFromLocalStorage<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return this.safeParse<T>(data);
    } catch (error) {
      console.warn(`PermanentStorage: Error loading from localStorage key ${key}`, error);
      return null;
    }
  }
  
  /**
   * Save data to IndexedDB
   */
  private saveToIndexedDB(namespace: StorageNamespace, jsonData: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const keys = this.getStorageKeys(namespace);
        const storeName = keys.INDEXED_DB_STORE;
        const key = keys.INDEXED_DB_KEY;
        
        // Open the database
        const openRequest = indexedDB.open(this.indexedDBName, 1);
        
        // Set a timeout to resolve in case the operation hangs
        const timeout = setTimeout(() => {
          console.warn(`PermanentStorage: IndexedDB save timed out for ${namespace}`);
          resolve(false);
        }, 3000);
        
        // Error handler
        openRequest.onerror = (event) => {
          clearTimeout(timeout);
          reject(new Error(`Failed to open IndexedDB: ${event}`));
        };
        
        // Success handler
        openRequest.onsuccess = (event: any) => {
          clearTimeout(timeout);
          const db = event.target.result;
          
          try {
            // Create a transaction
            const transaction = db.transaction([storeName], 'readwrite');
            const objectStore = transaction.objectStore(storeName);
            
            // Add/update the data
            const request = objectStore.put(jsonData, key);
            
            request.onsuccess = () => {
              if (this.options.debugMode) {
                console.log(`PermanentStorage: IndexedDB save successful for ${namespace}`);
              }
              resolve(true);
            };
            
            request.onerror = (error: any) => {
              console.error(`PermanentStorage: IndexedDB save error for ${namespace}`, error);
              reject(error);
            };
            
            // Ensure the transaction completes
            transaction.oncomplete = () => {
              if (this.options.debugMode) {
                console.log(`PermanentStorage: IndexedDB transaction complete for ${namespace}`);
              }
              db.close();
            };
            
            transaction.onerror = (error) => {
              console.error(`PermanentStorage: IndexedDB transaction error for ${namespace}`, error);
              reject(error);
            };
          } catch (error) {
            console.error(`PermanentStorage: IndexedDB transaction creation failed for ${namespace}`, error);
            db.close();
            reject(error);
          }
        };
      } catch (error) {
        console.error(`PermanentStorage: IndexedDB save setup failed for ${namespace}`, error);
        reject(error);
      }
    });
  }
  
  /**
   * Load data from IndexedDB
   */
  private loadFromIndexedDB<T>(namespace: StorageNamespace): Promise<T | null> {
    return new Promise((resolve) => {
      try {
        const keys = this.getStorageKeys(namespace);
        const storeName = keys.INDEXED_DB_STORE;
        const key = keys.INDEXED_DB_KEY;
        
        // Open the database
        const openRequest = indexedDB.open(this.indexedDBName, 1);
        
        // Set a timeout to resolve in case the operation hangs
        const timeout = setTimeout(() => {
          console.warn(`PermanentStorage: IndexedDB load timed out for ${namespace}`);
          resolve(null);
        }, 3000);
        
        // Error handler
        openRequest.onerror = () => {
          clearTimeout(timeout);
          resolve(null);
        };
        
        // Success handler
        openRequest.onsuccess = (event: any) => {
          const db = event.target.result;
          
          try {
            // Check if the store exists
            if (!db.objectStoreNames.contains(storeName)) {
              clearTimeout(timeout);
              console.warn(`PermanentStorage: IndexedDB store not found for ${namespace}`);
              db.close();
              resolve(null);
              return;
            }
            
            // Create a transaction
            const transaction = db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            
            // Get the data
            const request = objectStore.get(key);
            
            request.onsuccess = () => {
              clearTimeout(timeout);
              const data = request.result;
              
              if (!data) {
                db.close();
                resolve(null);
                return;
              }
              
              // Parse the data
              const parsedData = this.safeParse<T>(data);
              db.close();
              resolve(parsedData);
            };
            
            request.onerror = () => {
              clearTimeout(timeout);
              console.error(`PermanentStorage: IndexedDB get error for ${namespace}`);
              db.close();
              resolve(null);
            };
            
            transaction.onerror = () => {
              clearTimeout(timeout);
              console.error(`PermanentStorage: IndexedDB transaction error for ${namespace}`);
              db.close();
              resolve(null);
            };
          } catch (error) {
            clearTimeout(timeout);
            console.error(`PermanentStorage: IndexedDB load failed for ${namespace}`, error);
            db.close();
            resolve(null);
          }
        };
      } catch (error) {
        console.error(`PermanentStorage: IndexedDB load setup failed for ${namespace}`, error);
        resolve(null);
      }
    });
  }
  
  /**
   * Safely stringify data with error handling
   */
  private safeStringify(data: any): string | null {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('PermanentStorage: Error stringifying data', error);
      return null;
    }
  }
  
  /**
   * Safely parse JSON data with error handling
   */
  private safeParse<T>(data: string): T | null {
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('PermanentStorage: Error parsing data', error);
      return null;
    }
  }
  
  /**
   * Validate that data was saved correctly
   */
  private validateData(namespace: StorageNamespace): boolean {
    try {
      const keys = this.getStorageKeys(namespace);
      
      // Check primary storage
      const primaryData = localStorage.getItem(keys.PRIMARY);
      
      // If no data, no need to validate
      if (!primaryData) {
        return true;
      }
      
      // Check if the data can be parsed
      try {
        JSON.parse(primaryData);
      } catch (error) {
        console.error(`PermanentStorage: Data validation failed for ${namespace}`, error);
        this.incrementErrorCount(namespace);
        
        // Try to restore from backup if too many errors
        if (this.errorCount[namespace] > 2) {
          this.restoreData(namespace);
        }
        
        return false;
      }
      
      // Check if backup data matches primary data
      const backup1Data = localStorage.getItem(keys.BACKUP_1);
      const backup2Data = localStorage.getItem(keys.BACKUP_2);
      
      if (backup1Data !== primaryData || backup2Data !== primaryData) {
        console.warn(`PermanentStorage: Backup data mismatch for ${namespace}`);
        
        // Update backups with primary data
        if (primaryData) {
          localStorage.setItem(keys.BACKUP_1, primaryData);
          localStorage.setItem(keys.BACKUP_2, primaryData);
        }
      }
      
      // Data is valid
      this.errorCount[namespace] = 0;
      return true;
    } catch (error) {
      console.error(`PermanentStorage: Validation error for ${namespace}`, error);
      return false;
    }
  }
  
  /**
   * Validate all data in storage
   */
  private validateAllData(): void {
    Object.values(StorageNamespace).forEach(namespace => {
      this.validateData(namespace as StorageNamespace);
    });
  }
  
  /**
   * Increment error count for a namespace
   */
  private incrementErrorCount(namespace: StorageNamespace): void {
    if (!this.errorCount[namespace]) {
      this.errorCount[namespace] = 0;
    }
    
    this.errorCount[namespace]++;
  }
  
  /**
   * Try to restore data from backups
   */
  private async restoreData(namespace: StorageNamespace): Promise<boolean> {
    try {
      const keys = this.getStorageKeys(namespace);
      
      // Try all backup sources in order
      const backupSources = [
        keys.BACKUP_1,
        keys.BACKUP_2,
        keys.PERSISTENT,
        keys.SECURE,
        keys.SESSION
      ];
      
      for (const source of backupSources) {
        if (source === keys.SECURE) {
          // Handle secure source differently
          try {
            const secureData = localStorage.getItem(source);
            if (secureData) {
              const jsonData = atob(secureData);
              try {
                // Verify it's valid JSON
                JSON.parse(jsonData);
                
                // Restore to primary storage
                localStorage.setItem(keys.PRIMARY, jsonData);
                console.log(`PermanentStorage: Restored data for ${namespace} from secure backup`);
                return true;
              } catch {}
            }
          } catch {}
        } else if (source === keys.SESSION) {
          if (!this.options.enableSessionStorage) continue;
          
          try {
            const sessionData = sessionStorage.getItem(source);
            if (sessionData) {
              try {
                // Verify it's valid JSON
                JSON.parse(sessionData);
                
                // Restore to primary storage
                localStorage.setItem(keys.PRIMARY, sessionData);
                console.log(`PermanentStorage: Restored data for ${namespace} from session storage`);
                return true;
              } catch {}
            }
          } catch {}
        } else {
          // Standard localStorage source
          const backupData = localStorage.getItem(source);
          if (backupData) {
            try {
              // Verify it's valid JSON
              JSON.parse(backupData);
              
              // Restore to primary storage
              localStorage.setItem(keys.PRIMARY, backupData);
              console.log(`PermanentStorage: Restored data for ${namespace} from ${source}`);
              return true;
            } catch {}
          }
        }
      }
      
      // Try IndexedDB as last resort
      if (this.options.enableIndexedDB) {
        try {
          const dbData = await this.loadFromIndexedDB(namespace);
          if (dbData) {
            await this.saveData(namespace, dbData);
            console.log(`PermanentStorage: Restored data for ${namespace} from IndexedDB`);
            return true;
          }
        } catch {}
      }
      
      console.warn(`PermanentStorage: Could not restore data for ${namespace} from any backup`);
      return false;
    } catch (error) {
      console.error(`PermanentStorage: Error restoring data for ${namespace}`, error);
      return false;
    }
  }
  
  /**
   * Clear all storage for a namespace
   */
  async clearData(namespace: StorageNamespace): Promise<boolean> {
    try {
      const keys = this.getStorageKeys(namespace);
      
      // Clear localStorage
      localStorage.removeItem(keys.PRIMARY);
      localStorage.removeItem(keys.BACKUP_1);
      localStorage.removeItem(keys.BACKUP_2);
      localStorage.removeItem(keys.SECURE);
      localStorage.removeItem(keys.PERSISTENT);
      
      // Clear sessionStorage
      if (this.options.enableSessionStorage) {
        try {
          sessionStorage.removeItem(keys.SESSION);
        } catch (error) {
          console.warn(`PermanentStorage: Could not clear sessionStorage for ${namespace}`, error);
        }
      }
      
      // Clear IndexedDB
      if (this.options.enableIndexedDB) {
        try {
          await this.clearFromIndexedDB(namespace);
        } catch (error) {
          console.warn(`PermanentStorage: Could not clear IndexedDB for ${namespace}`, error);
        }
      }
      
      if (this.options.debugMode) {
        console.log(`PermanentStorage: Cleared data for ${namespace}`);
      }
      
      return true;
    } catch (error) {
      console.error(`PermanentStorage: Failed to clear data for ${namespace}`, error);
      return false;
    }
  }
  
  /**
   * Clear data from IndexedDB
   */
  private clearFromIndexedDB(namespace: StorageNamespace): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const keys = this.getStorageKeys(namespace);
        const storeName = keys.INDEXED_DB_STORE;
        const key = keys.INDEXED_DB_KEY;
        
        // Open the database
        const openRequest = indexedDB.open(this.indexedDBName, 1);
        
        // Set a timeout to resolve in case the operation hangs
        const timeout = setTimeout(() => {
          console.warn(`PermanentStorage: IndexedDB clear timed out for ${namespace}`);
          resolve(false);
        }, 3000);
        
        // Error handler
        openRequest.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };
        
        // Success handler
        openRequest.onsuccess = (event: any) => {
          clearTimeout(timeout);
          const db = event.target.result;
          
          try {
            // Check if the store exists
            if (!db.objectStoreNames.contains(storeName)) {
              db.close();
              resolve(true);
              return;
            }
            
            // Create a transaction
            const transaction = db.transaction([storeName], 'readwrite');
            const objectStore = transaction.objectStore(storeName);
            
            // Delete the data
            const request = objectStore.delete(key);
            
            request.onsuccess = () => {
              if (this.options.debugMode) {
                console.log(`PermanentStorage: IndexedDB clear successful for ${namespace}`);
              }
              db.close();
              resolve(true);
            };
            
            request.onerror = () => {
              console.error(`PermanentStorage: IndexedDB delete error for ${namespace}`);
              db.close();
              resolve(false);
            };
            
            transaction.onerror = () => {
              console.error(`PermanentStorage: IndexedDB transaction error for ${namespace}`);
              db.close();
              resolve(false);
            };
          } catch (error) {
            console.error(`PermanentStorage: IndexedDB clear failed for ${namespace}`, error);
            db.close();
            resolve(false);
          }
        };
      } catch (error) {
        console.error(`PermanentStorage: IndexedDB clear setup failed for ${namespace}`, error);
        resolve(false);
      }
    });
  }
  
  // Get isReady status
  isReady(): boolean {
    return this.ready;
  }
  
  // Wait until ready
  async waitUntilReady(timeoutMs: number = 5000): Promise<boolean> {
    if (this.ready) return true;
    
    return new Promise((resolve) => {
      // Set timeout
      const timeout = setTimeout(() => {
        console.warn('PermanentStorage: Timed out waiting for ready state');
        resolve(false);
      }, timeoutMs);
      
      // Check ready state every 100ms
      const checkInterval = setInterval(() => {
        if (this.ready) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
    });
  }
}

// Create singleton instance
const permanentStorage = new PermanentStorageSystem();

// Export singleton
export default permanentStorage;
