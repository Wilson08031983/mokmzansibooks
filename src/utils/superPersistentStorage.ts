/**
 * Super Persistent Storage Manager
 * 
 * This module provides ultra-reliable data persistence with multiple fallback mechanisms
 * to ensure data is never lost between sessions. Enhanced with improved IndexedDB error handling.
 */

import { handleIndexedDBError } from './indexedDBErrorHandler';

// Storage types that we support
export enum StorageType {
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  INDEXED_DB = 'indexedDB',
  MEMORY = 'memory'
}

// Data categories for organization
export enum DataCategory {
  COMPANY = 'company',
  CLIENTS = 'clients',
  QUOTES = 'quotes',
  INVOICES = 'invoices',
  SETTINGS = 'settings',
  USER = 'user',
  ACCOUNTING = 'accounting',
  HR = 'hr',
  PAYROLL = 'payroll',
  INVENTORY = 'inventory',
  REPORTS = 'reports',
  QUOTE_ARCHIVE = 'quote_archive',
  QUOTE_VERSIONS = 'quote_versions',
  EMPLOYEES = 'employees'
}

// Configuration for the storage system
interface StorageConfig {
  enableIndexedDB: boolean;
  enableSessionStorage: boolean;
  enableMultipleBackups: boolean;
  autoRestoreOnLoad: boolean;
  validateAfterSave: boolean;
  debugMode: boolean;
  saveDelay: number; // Milliseconds to delay save operations (prevents race conditions)
  loadRetryAttempts: number; // Number of attempts to retry loading
  loadTimeout: number; // Milliseconds to wait before timing out a load operation
  saveTimeout: number; // Milliseconds to wait before timing out a save operation
  dbTimeout: number; // Milliseconds to wait before timing out IndexedDB operations
  operationTimeout: number; // Milliseconds to wait before timing out IndexedDB operations
  dbName: string; // Name of the IndexedDB database
  dbVersion: number; // Version of the IndexedDB database
}

// Default configuration
const DEFAULT_CONFIG: StorageConfig = {
  enableIndexedDB: true,
  enableSessionStorage: true,
  enableMultipleBackups: true,
  autoRestoreOnLoad: true,
  validateAfterSave: true,
  debugMode: true,
  saveDelay: 50,
  loadRetryAttempts: 3,
  loadTimeout: 5000,
  saveTimeout: 5000,
  dbTimeout: 5000,
  operationTimeout: 3000,
  dbName: 'MokMzansiSuperStorage',
  dbVersion: 1
};

/**
 * The main storage manager class
 */
class SuperPersistentStorageManager {
  private config: StorageConfig;
  private ready: boolean = false;
  private db: IDBDatabase | null = null;
  private inMemoryBackup: Record<string, any> = {};
  private saveQueue: Record<string, NodeJS.Timeout> = {};
  private initPromise: Promise<boolean> | null = null;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    // Initialize immediately, but don't wait for it
    this.initPromise = this.initialize();
  }

  /**
   * Log a message if debug mode is enabled
   */
  private debugLog(...args: any[]): void {
    if (this.config.debugMode) {
      console.log('[SuperPersistentStorage]', ...args);
    }
  }

  /**
   * Initialize the storage system
   */
  public async initialize(): Promise<boolean> {
    try {
      this.debugLog('Initializing storage system...');
      
      // Initialize IndexedDB if enabled
      if (this.config.enableIndexedDB) {
        await this.initializeIndexedDB();
      }

      // Pre-load all data from storage to ensure it's available
      if (this.config.autoRestoreOnLoad) {
        await this.preloadFromAllSources();
      }

      this.ready = true;
      this.debugLog('Storage system initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize storage system:', error);
      // Even if initialization fails, we'll mark as ready and use fallback mechanisms
      this.ready = true;
      return false;
    }
  }

  /**
   * Initialize IndexedDB storage
   */
  private initializeIndexedDB(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (!window.indexedDB) {
          this.debugLog('IndexedDB not supported by this browser');
          resolve(false);
          return;
        }

        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
          this.debugLog('IndexedDB initialization timed out');
          resolve(false);
        }, this.config.dbTimeout);

        const request = indexedDB.open(this.config.dbName, this.config.dbVersion);

        request.onupgradeneeded = (event) => {
          this.debugLog('Upgrading IndexedDB database...');
          const db = (event.target as IDBOpenDBRequest).result;

          // Create object stores for each data category if they don't exist
          Object.values(DataCategory).forEach(category => {
            if (!db.objectStoreNames.contains(category)) {
              db.createObjectStore(category);
              this.debugLog(`Created object store: ${category}`);
            }
          });
        };

        request.onsuccess = (event) => {
          clearTimeout(timeout);
          this.db = (event.target as IDBOpenDBRequest).result;
          this.debugLog('IndexedDB initialized successfully');
          resolve(true);
        };

        request.onerror = (event) => {
          clearTimeout(timeout);
          console.error('Error initializing IndexedDB:', (event.target as IDBOpenDBRequest).error);
          // Record the error to help with debugging
          localStorage.setItem('indexeddb_error_detected', 'true');
          localStorage.setItem('indexeddb_last_error', JSON.stringify({
            time: new Date().toISOString(),
            error: (event.target as IDBOpenDBRequest).error?.message || 'Unknown error'
          }));
          resolve(false);
        };
      } catch (error) {
        console.error('Exception during IndexedDB initialization:', error);
        localStorage.setItem('indexeddb_error_detected', 'true');
        resolve(false);
      }
    });
  }

  /**
   * Make sure storage is ready before performing operations
   */
  public async ensureReady(): Promise<boolean> {
    if (this.ready) return true;
    
    if (this.initPromise) {
      return await this.initPromise;
    }
    
    return new Promise((resolve) => {
      // Set a timeout
      const timeout = setTimeout(() => {
        this.debugLog('Timeout waiting for storage to be ready, proceeding anyway');
        this.ready = true;
        resolve(true);
      }, this.config.operationTimeout);
      
      // Check periodically
      const checkInterval = setInterval(() => {
        if (this.ready) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
    });
  }

  /**
   * Preload data from all available sources
   */
  private async preloadFromAllSources(): Promise<void> {
    this.debugLog('Preloading data from all sources...');
    
    for (const category of Object.values(DataCategory)) {
      try {
        await this.loadWithRedundancy(category);
      } catch (error) {
        console.error(`Failed to preload data for category ${category}:`, error);
      }
    }
  }

  /**
   * Generate storage keys for a category with namespacing
   */
  private getKeys(category: DataCategory): Record<string, string> {
    const primaryKey = `mok_${category}`;
    const backupKeys = this.config.enableMultipleBackups 
      ? [
          `mok_${category}_backup1`,
          `mok_${category}_backup2`,
          `mok_emergency_${category}`
        ] 
      : [];
    
    return {
      primary: primaryKey,
      backups: backupKeys
    };
  }

  /**
   * Save data with redundancy across all storage mechanisms
   */
  public async save<T>(category: DataCategory, data: T): Promise<boolean> {
    await this.ensureReady();
    
    // Cancel any pending save operations for this category
    if (this.saveQueue[category]) {
      clearTimeout(this.saveQueue[category]);
      delete this.saveQueue[category];
    }
    
    // Delay save operation to prevent race conditions
    return new Promise((resolve) => {
      this.saveQueue[category] = setTimeout(async () => {
        const result = await this.executeSave(category, data);
        resolve(result);
      }, this.config.saveDelay);
    });
  }

  /**
   * Execute the actual save operation
   */
  private async executeSave<T>(category: DataCategory, data: T): Promise<boolean> {
    try {
      this.debugLog(`Saving data for category: ${category}`);
      
      // Convert data to JSON string for storage
      const jsonData = JSON.stringify(data);
      
      // Save to memory backup first (always fast, always works)
      this.inMemoryBackup[category] = data;
      
      // Save to localStorage (primary storage)
      const keys = this.getKeys(category);
      try {
        localStorage.setItem(keys.primary, jsonData);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      // Save to backup keys in localStorage
      if (this.config.enableMultipleBackups) {
        for (const backupKey of keys.backups) {
          try {
            localStorage.setItem(backupKey, jsonData);
          } catch (error) {
            console.error(`Error saving to backup key ${backupKey}:`, error);
          }
        }
      }
      
      // Save to sessionStorage if enabled
      if (this.config.enableSessionStorage) {
        try {
          sessionStorage.setItem(keys.primary, jsonData);
        } catch (error) {
          console.error('Error saving to sessionStorage:', error);
        }
      }
      
      // Save to IndexedDB if enabled (don't await, let it run in the background)
      if (this.config.enableIndexedDB && this.db) {
        this.saveToIndexedDB(category, jsonData).catch(error => {
          console.error(`Error saving to IndexedDB for category ${category}:`, error);
        });
      }
      
      // Validate the save if configured
      if (this.config.validateAfterSave) {
        setTimeout(async () => {
          await this.validateSavedData(category, jsonData);
        }, 100);
      }
      
      // Add an event that data changed
      const event = new CustomEvent('mokstoragechanged', { 
        detail: { category, action: 'save' } 
      });
      window.dispatchEvent(event);
      
      return true;
    } catch (error) {
      console.error(`Failed to save data for category ${category}:`, error);
      return false;
    }
  }

  /**
   * Load data with fallback to multiple sources
   */
  public async load<T>(category: DataCategory, defaultValue: T | null = null): Promise<T | null> {
    await this.ensureReady();
    
    let data: T | null = null;
    let attempt = 0;
    
    while (attempt < this.config.loadRetryAttempts) {
      try {
        data = await this.loadWithRedundancy<T>(category);
        if (data !== null) break;
      } catch (error) {
        console.error(`Load attempt ${attempt + 1} failed for category ${category}:`, error);
      }
      attempt++;
    }
    
    // If we couldn't load any data, return the default value
    if (data === null) {
      this.debugLog(`Using default value for category ${category}`);
      return defaultValue;
    }
    
    return data;
  }

  /**
   * Load data from all available sources with redundancy
   */
  private async loadWithRedundancy<T>(category: DataCategory): Promise<T | null> {
    this.debugLog(`Loading data for category: ${category} with redundancy`);
    
    // Check memory backup first (fastest)
    if (this.inMemoryBackup[category] !== undefined) {
      this.debugLog(`Found data in memory backup for category: ${category}`);
      return this.inMemoryBackup[category] as T;
    }
    
    const keys = this.getKeys(category);
    let jsonData: string | null = null;
    
    // Try localStorage primary key
    try {
      jsonData = localStorage.getItem(keys.primary);
      if (jsonData) {
        this.debugLog(`Found data in localStorage for category: ${category}`);
        return JSON.parse(jsonData) as T;
      }
    } catch (error) {
      console.error(`Error loading from localStorage for category ${category}:`, error);
    }
    
    // Try backup keys
    if (this.config.enableMultipleBackups) {
      for (const backupKey of keys.backups) {
        try {
          jsonData = localStorage.getItem(backupKey);
          if (jsonData) {
            this.debugLog(`Found data in backup key ${backupKey} for category: ${category}`);
            return JSON.parse(jsonData) as T;
          }
        } catch (error) {
          console.error(`Error loading from backup key ${backupKey}:`, error);
        }
      }
    }
    
    // Try sessionStorage
    if (this.config.enableSessionStorage) {
      try {
        jsonData = sessionStorage.getItem(keys.primary);
        if (jsonData) {
          this.debugLog(`Found data in sessionStorage for category: ${category}`);
          return JSON.parse(jsonData) as T;
        }
      } catch (error) {
        console.error(`Error loading from sessionStorage for category ${category}:`, error);
      }
    }
    
    // Try IndexedDB as last resort
    if (this.config.enableIndexedDB && this.db) {
      try {
        const indexedDBData = await this.loadFromIndexedDB<T>(category);
        if (indexedDBData !== null) {
          this.debugLog(`Found data in IndexedDB for category: ${category}`);
          return indexedDBData;
        }
      } catch (error) {
        console.error(`Error loading from IndexedDB for category ${category}:`, error);
      }
    }
    
    this.debugLog(`No data found in any source for category: ${category}`);
    return null;
  }

  /**
   * Save data to IndexedDB
   */
  private saveToIndexedDB(category: DataCategory, jsonData: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          this.debugLog('IndexedDB not initialized');
          resolve(false);
          return;
        }
        
        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
          this.debugLog(`IndexedDB save operation timed out for category ${category}`);
          resolve(false);
        }, this.config.saveTimeout);
        
        const transaction = this.db.transaction([category], 'readwrite');
        const objectStore = transaction.objectStore(category);
        
        const request = objectStore.put(jsonData, 'data');
        
        request.onsuccess = () => {
          clearTimeout(timeout);
          this.debugLog(`Successfully saved to IndexedDB for category ${category}`);
          resolve(true);
        };
        
        request.onerror = (event) => {
          clearTimeout(timeout);
          const error = (event.target as IDBRequest).error;
          handleIndexedDBError(error, 'save operation', `${this.config.dbName}:${category}`);
          resolve(false);
        };
        
        transaction.oncomplete = () => {
          clearTimeout(timeout);
          this.debugLog(`IndexedDB transaction completed for category ${category}`);
          resolve(true);
        };
        
        transaction.onerror = (event) => {
          clearTimeout(timeout);
          const error = (event.target as IDBTransaction).error;
          handleIndexedDBError(error, 'transaction', `${this.config.dbName}:${category}`);
          resolve(false);
        };
        
        transaction.onabort = (event) => {
          clearTimeout(timeout);
          console.error(`IndexedDB transaction aborted for category ${category}:`, (event.target as IDBTransaction).error);
          resolve(false);
        };
      } catch (error) {
        console.error(`Exception during IndexedDB save for category ${category}:`, error);
        resolve(false);
      }
    });
  }

  /**
   * Load data from IndexedDB
   */
  private loadFromIndexedDB<T>(category: DataCategory): Promise<T | null> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          this.debugLog('IndexedDB not initialized');
          resolve(null);
          return;
        }
        
        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
          this.debugLog(`IndexedDB load operation timed out for category ${category}`);
          resolve(null);
        }, this.config.loadTimeout);
        
        // Check if the object store exists
        if (!this.db.objectStoreNames.contains(category)) {
          clearTimeout(timeout);
          this.debugLog(`Object store ${category} doesn't exist`);
          resolve(null);
          return;
        }
        
        const transaction = this.db.transaction([category], 'readonly');
        const objectStore = transaction.objectStore(category);
        
        const request = objectStore.get('data');
        
        request.onsuccess = () => {
          clearTimeout(timeout);
          if (request.result) {
            try {
              const data = JSON.parse(request.result) as T;
              this.debugLog(`Successfully loaded from IndexedDB for category ${category}`);
              resolve(data);
            } catch (error) {
              console.error(`Error parsing IndexedDB data for category ${category}:`, error);
              resolve(null);
            }
          } else {
            this.debugLog(`No data found in IndexedDB for category ${category}`);
            resolve(null);
          }
        };
        
        request.onerror = (event) => {
          clearTimeout(timeout);
          const error = (event.target as IDBRequest).error;
          handleIndexedDBError(error, 'load operation', `${this.config.dbName}:${category}`);
          resolve(null);
        };
        
        transaction.onerror = (event) => {
          clearTimeout(timeout);
          const error = (event.target as IDBTransaction).error;
          handleIndexedDBError(error, 'transaction', `${this.config.dbName}:${category}`);
          resolve(null);
        };
      } catch (error) {
        console.error(`Exception during IndexedDB load for category ${category}:`, error);
        resolve(null);
      }
    });
  }

  /**
   * Validate that data was saved correctly
   */
  private async validateSavedData(category: DataCategory, expectedData: string): Promise<boolean> {
    try {
      const keys = this.getKeys(category);
      const savedData = localStorage.getItem(keys.primary);
      
      if (savedData !== expectedData) {
        console.error(`Validation failed for category ${category}: Data mismatch`);
        
        // Attempt to fix by re-saving
        try {
          localStorage.setItem(keys.primary, expectedData);
        } catch (error) {
          console.error(`Failed to re-save during validation for category ${category}:`, error);
        }
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error validating saved data for category ${category}:`, error);
      return false;
    }
  }

  /**
   * Clear all data for a category
   */
  public async clear(category: DataCategory): Promise<boolean> {
    await this.ensureReady();
    
    try {
      this.debugLog(`Clearing data for category: ${category}`);
      
      // Clear memory backup
      delete this.inMemoryBackup[category];
      
      // Clear localStorage
      const keys = this.getKeys(category);
      localStorage.removeItem(keys.primary);
      
      // Clear backup keys
      if (this.config.enableMultipleBackups) {
        for (const backupKey of keys.backups) {
          localStorage.removeItem(backupKey);
        }
      }
      
      // Clear sessionStorage
      if (this.config.enableSessionStorage) {
        sessionStorage.removeItem(keys.primary);
      }
      
      // Clear IndexedDB
      if (this.config.enableIndexedDB && this.db) {
        await this.clearFromIndexedDB(category);
      }
      
      // Add an event that data changed
      const event = new CustomEvent('mokstoragechanged', { 
        detail: { category, action: 'clear' } 
      });
      window.dispatchEvent(event);
      
      return true;
    } catch (error) {
      console.error(`Failed to clear data for category ${category}:`, error);
      return false;
    }
  }

  /**
   * Clear data from IndexedDB
   */
  private clearFromIndexedDB(category: DataCategory): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (!this.db) {
          this.debugLog('IndexedDB not initialized');
          resolve(false);
          return;
        }
        
        // Check if the object store exists
        if (!this.db.objectStoreNames.contains(category)) {
          this.debugLog(`Object store ${category} doesn't exist, nothing to clear`);
          resolve(true);
          return;
        }
        
        const transaction = this.db.transaction([category], 'readwrite');
        const objectStore = transaction.objectStore(category);
        
        const request = objectStore.delete('data');
        
        request.onsuccess = () => {
          this.debugLog(`Successfully cleared from IndexedDB for category ${category}`);
          resolve(true);
        };
        
        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          handleIndexedDBError(error, 'clear operation', `${this.config.dbName}:${category}`);
          resolve(false);
        };
      } catch (error) {
        console.error(`Exception during IndexedDB clear for category ${category}:`, error);
        resolve(false);
      }
    });
  }

  /**
   * Validate the health of the storage system
   */
  public async validateHealth(): Promise<{
    healthy: boolean;
    issues: string[];
    storageTypes: {
      localStorage: boolean;
      sessionStorage: boolean;
      indexedDB: boolean;
    }
  }> {
    const issues: string[] = [];
    
    // Check localStorage
    let localStorageWorking = true;
    try {
      localStorage.setItem('mokhealth_test', 'test');
      const testValue = localStorage.getItem('mokhealth_test');
      if (testValue !== 'test') {
        localStorageWorking = false;
        issues.push('localStorage test failed: Value mismatch');
      }
      localStorage.removeItem('mokhealth_test');
    } catch (error) {
      localStorageWorking = false;
      issues.push(`localStorage test failed: ${error}`);
    }
    
    // Check sessionStorage
    let sessionStorageWorking = true;
    try {
      sessionStorage.setItem('mokhealth_test', 'test');
      const testValue = sessionStorage.getItem('mokhealth_test');
      if (testValue !== 'test') {
        sessionStorageWorking = false;
        issues.push('sessionStorage test failed: Value mismatch');
      }
      sessionStorage.removeItem('mokhealth_test');
    } catch (error) {
      sessionStorageWorking = false;
      issues.push(`sessionStorage test failed: ${error}`);
    }
    
    // Check IndexedDB
    let indexedDBWorking = this.db !== null;
    if (!indexedDBWorking) {
      issues.push('IndexedDB not initialized');
    }
    
    const healthy = localStorageWorking && (sessionStorageWorking || !this.config.enableSessionStorage) && 
                 (indexedDBWorking || !this.config.enableIndexedDB);
    
    return {
      healthy,
      issues,
      storageTypes: {
        localStorage: localStorageWorking,
        sessionStorage: sessionStorageWorking,
        indexedDB: indexedDBWorking
      }
    };
  }

  /**
   * Attempt to recover from storage issues
   */
  public async attemptRecovery(): Promise<boolean> {
    this.debugLog('Attempting storage recovery...');
    
    try {
      // Re-initialize IndexedDB
      if (this.config.enableIndexedDB) {
        await this.initializeIndexedDB();
      }
      
      // Try to restore data from backups for all categories
      for (const category of Object.values(DataCategory)) {
        const data = await this.loadWithRedundancy(category);
        if (data !== null) {
          // Save back to all storage mechanisms
          await this.save(category, data);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to recover storage:', error);
      return false;
    }
  }
}

// Create a singleton instance
const superPersistentStorage = new SuperPersistentStorageManager();

export default superPersistentStorage;
