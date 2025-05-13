
/**
 * Enhanced permanent storage service
 * Provides redundant, fault-tolerant storage mechanisms
 */

export enum StorageNamespace {
  APP_DATA = 'app-data',
  USER_PREFS = 'user-preferences',
  COMPANY = 'company',
  CLIENTS = 'clients',
  INVOICES = 'invoices',
  QUOTES = 'quotes',
}

interface StorageStatus {
  initialized: boolean;
  indexedDBAvailable: boolean;
  localStorageAvailable: boolean;
}

class PermanentStorage {
  private status: StorageStatus = {
    initialized: false,
    indexedDBAvailable: false,
    localStorageAvailable: false,
  };
  
  private dbName: string = 'mok-permanent-storage';
  private dbVersion: number = 1;
  private db: IDBDatabase | null = null;
  
  constructor() {
    this.checkStorageAvailability();
  }
  
  /**
   * Check if storage mechanisms are available
   */
  private checkStorageAvailability(): void {
    // Check localStorage
    try {
      localStorage.setItem('storage-test', 'test');
      localStorage.removeItem('storage-test');
      this.status.localStorageAvailable = true;
    } catch (e) {
      this.status.localStorageAvailable = false;
      console.warn('localStorage is not available');
    }
    
    // Check IndexedDB
    try {
      if (window.indexedDB) {
        this.status.indexedDBAvailable = true;
      } else {
        this.status.indexedDBAvailable = false;
        console.warn('IndexedDB is not available');
      }
    } catch (e) {
      this.status.indexedDBAvailable = false;
      console.warn('Error checking IndexedDB availability:', e);
    }
  }
  
  /**
   * Initialize the IndexedDB database
   */
  private async initIndexedDB(): Promise<boolean> {
    if (!this.status.indexedDBAvailable) {
      return false;
    }
    
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = (event) => {
          console.error('Failed to open IndexedDB:', event);
          this.status.indexedDBAvailable = false;
          resolve(false);
        };
        
        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.status.initialized = true;
          resolve(true);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores for each namespace
          for (const namespace of Object.values(StorageNamespace)) {
            if (!db.objectStoreNames.contains(namespace)) {
              db.createObjectStore(namespace);
            }
          }
        };
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
        this.status.indexedDBAvailable = false;
        resolve(false);
      }
    });
  }
  
  /**
   * Wait until storage is ready
   */
  public async waitUntilReady(timeoutMs: number = 5000): Promise<boolean> {
    if (this.status.initialized) {
      return true;
    }
    
    const startTime = Date.now();
    let initialized = false;
    
    while (Date.now() - startTime < timeoutMs && !initialized) {
      initialized = await this.initIndexedDB();
      
      if (!initialized && !this.status.indexedDBAvailable) {
        // If IndexedDB isn't available, fallback to localStorage
        if (this.status.localStorageAvailable) {
          this.status.initialized = true;
          initialized = true;
        } else {
          break; // No storage available
        }
      }
      
      // Small delay to prevent tight loop
      if (!initialized) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (!initialized) {
      console.warn(`Storage initialization timed out after ${timeoutMs}ms`);
    }
    
    return initialized;
  }
  
  /**
   * Check if storage is ready
   */
  public isReady(): boolean {
    return this.status.initialized;
  }
  
  /**
   * Save data to storage with namespace
   */
  public async saveData<T>(namespace: StorageNamespace, data: T): Promise<boolean> {
    try {
      // Ensure initialized
      if (!this.status.initialized) {
        await this.waitUntilReady(2000);
      }
      
      // Try IndexedDB first
      if (this.status.indexedDBAvailable && this.db) {
        return new Promise((resolve) => {
          try {
            const transaction = this.db!.transaction(namespace, 'readwrite');
            const store = transaction.objectStore(namespace);
            
            // Save under a generic key
            const request = store.put(data, 'data');
            
            request.onsuccess = () => {
              resolve(true);
            };
            
            request.onerror = (event) => {
              console.error(`Error saving to IndexedDB (${namespace}):`, event);
              
              // Try localStorage as fallback
              if (this.status.localStorageAvailable) {
                try {
                  localStorage.setItem(`${this.dbName}-${namespace}`, JSON.stringify(data));
                  resolve(true);
                } catch (e) {
                  console.error(`Error saving to localStorage (${namespace}):`, e);
                  resolve(false);
                }
              } else {
                resolve(false);
              }
            };
          } catch (error) {
            console.error(`Transaction error saving to IndexedDB (${namespace}):`, error);
            
            // Try localStorage as fallback
            if (this.status.localStorageAvailable) {
              try {
                localStorage.setItem(`${this.dbName}-${namespace}`, JSON.stringify(data));
                resolve(true);
              } catch (e) {
                console.error(`Error saving to localStorage (${namespace}):`, e);
                resolve(false);
              }
            } else {
              resolve(false);
            }
          }
        });
      }
      
      // Fallback to localStorage
      if (this.status.localStorageAvailable) {
        localStorage.setItem(`${this.dbName}-${namespace}`, JSON.stringify(data));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error saving data (${namespace}):`, error);
      return false;
    }
  }
  
  /**
   * Load data from storage with namespace
   */
  public async loadData<T>(namespace: StorageNamespace): Promise<T | null> {
    try {
      // Ensure initialized
      if (!this.status.initialized) {
        await this.waitUntilReady(2000);
      }
      
      // Try IndexedDB first
      if (this.status.indexedDBAvailable && this.db) {
        return new Promise((resolve) => {
          try {
            const transaction = this.db!.transaction(namespace, 'readonly');
            const store = transaction.objectStore(namespace);
            
            // Load from generic key
            const request = store.get('data');
            
            request.onsuccess = (event) => {
              const data = (event.target as IDBRequest).result;
              if (data) {
                resolve(data as T);
              } else {
                // Try localStorage as fallback
                this.loadFromLocalStorage<T>(namespace).then(resolve);
              }
            };
            
            request.onerror = () => {
              console.error(`Error loading from IndexedDB (${namespace})`);
              
              // Try localStorage as fallback
              this.loadFromLocalStorage<T>(namespace).then(resolve);
            };
          } catch (error) {
            console.error(`Transaction error loading from IndexedDB (${namespace}):`, error);
            
            // Try localStorage as fallback
            this.loadFromLocalStorage<T>(namespace).then(resolve);
          }
        });
      }
      
      // Fallback to localStorage
      return this.loadFromLocalStorage<T>(namespace);
    } catch (error) {
      console.error(`Error loading data (${namespace}):`, error);
      return null;
    }
  }
  
  /**
   * Load data from localStorage
   */
  private async loadFromLocalStorage<T>(namespace: StorageNamespace): Promise<T | null> {
    if (this.status.localStorageAvailable) {
      try {
        const data = localStorage.getItem(`${this.dbName}-${namespace}`);
        if (data) {
          return JSON.parse(data) as T;
        }
      } catch (e) {
        console.error(`Error parsing localStorage data (${namespace}):`, e);
      }
    }
    return null;
  }
  
  /**
   * Clear all data from a namespace
   */
  public async clearNamespace(namespace: StorageNamespace): Promise<boolean> {
    try {
      let success = false;
      
      // Clear from IndexedDB
      if (this.status.indexedDBAvailable && this.db) {
        try {
          const transaction = this.db.transaction(namespace, 'readwrite');
          const store = transaction.objectStore(namespace);
          store.clear();
          success = true;
        } catch (e) {
          console.error(`Error clearing IndexedDB namespace (${namespace}):`, e);
        }
      }
      
      // Clear from localStorage
      if (this.status.localStorageAvailable) {
        try {
          localStorage.removeItem(`${this.dbName}-${namespace}`);
          success = true;
        } catch (e) {
          console.error(`Error clearing localStorage namespace (${namespace}):`, e);
        }
      }
      
      return success;
    } catch (error) {
      console.error(`Error clearing namespace (${namespace}):`, error);
      return false;
    }
  }
}

const permanentStorage = new PermanentStorage();
export default permanentStorage;
