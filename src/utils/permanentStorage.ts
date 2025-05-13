/**
 * Permanent storage module with multiple fallback mechanisms for data persistence
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Namespaces for different types of data
 */
export enum StorageNamespace {
  COMPANY = 'company',
  CLIENTS = 'clients',
  INVOICES = 'invoices',
  QUOTES = 'quotes',
  SETTINGS = 'settings',
  USER_DATA = 'user',
  APP_DATA = 'app'
}

interface StorageState {
  isInitialized: boolean;
  idbAvailable: boolean;
  isPersistent: boolean;
  deviceId: string;
}

/**
 * Result of a storage operation
 */
export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
}

class PermanentStorage {
  private state: StorageState = {
    isInitialized: false,
    idbAvailable: false,
    isPersistent: false,
    deviceId: ''
  };
  
  private initPromise: Promise<boolean> | null = null;
  
  constructor() {
    this.init();
  }
  
  /**
   * Initialize the storage system
   */
  private init(): Promise<boolean> {
    // Only initialize once
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.initPromise = new Promise<boolean>(async (resolve) => {
      try {
        // Check if storage is persistent
        if (navigator.storage && navigator.storage.persist) {
          this.state.isPersistent = await navigator.storage.persist();
        }
        
        // Generate or retrieve device ID
        let deviceId = localStorage.getItem('perm-storage-device-id');
        if (!deviceId) {
          deviceId = uuidv4();
          localStorage.setItem('perm-storage-device-id', deviceId);
        }
        this.state.deviceId = deviceId;
        
        // Basic feature detection for IndexedDB
        if ('indexedDB' in window) {
          this.state.idbAvailable = true;
        }
        
        this.state.isInitialized = true;
        resolve(true);
      } catch (error) {
        console.error('Failed to initialize permanent storage:', error);
        // Even if initialization fails, set initialized so we don't keep trying
        this.state.isInitialized = true;
        resolve(false);
      }
    });
    
    return this.initPromise;
  }
  
  /**
   * Check if storage system is ready
   */
  public isReady(): boolean {
    return this.state.isInitialized;
  }
  
  /**
   * Wait until storage is ready
   * @param timeoutMs - Timeout in milliseconds
   */
  public async waitUntilReady(timeoutMs: number = 5000): Promise<boolean> {
    if (this.state.isInitialized) {
      return true;
    }
    
    return new Promise((resolve) => {
      // Set timeout to resolve false if it takes too long
      const timeout = setTimeout(() => {
        console.warn('PermanentStorage: Timed out waiting for initialization');
        resolve(false);
      }, timeoutMs);
      
      // Wait for initialization
      this.initPromise?.then((result) => {
        clearTimeout(timeout);
        resolve(result);
      }).catch(() => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }
  
  /**
   * Save data to storage
   * @param namespace - Storage namespace
   * @param data - Data to save
   */
  public async saveData<T>(namespace: StorageNamespace, data: T): Promise<boolean> {
    try {
      await this.waitUntilReady();
      
      // Prepare data object with metadata
      const storageObject = {
        data,
        timestamp: new Date().toISOString(),
        deviceId: this.state.deviceId
      };
      
      // 1. Try localStorage first
      try {
        localStorage.setItem(
          `perm-${namespace}`,
          JSON.stringify(storageObject)
        );
      } catch (e) {
        console.warn(`Failed to save to localStorage for ${namespace}`);
      }
      
      // 2. Try sessionStorage as backup
      try {
        sessionStorage.setItem(
          `perm-${namespace}`,
          JSON.stringify(storageObject)
        );
      } catch (e) {
        console.warn(`Failed to save to sessionStorage for ${namespace}`);
      }
      
      // 3. Try IndexedDB if available
      if (this.state.idbAvailable) {
        // Implementation would go here
        // Not critical for basic function, so we'll skip in this simplified version
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to save data for ${namespace}:`, error);
      return false;
    }
  }
  
  /**
   * Load data from storage
   * @param namespace - Storage namespace
   */
  public async loadData<T>(namespace: StorageNamespace): Promise<T | null> {
    try {
      await this.waitUntilReady();
      
      // Try to get from localStorage
      const localData = localStorage.getItem(`perm-${namespace}`);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          return parsed.data as T;
        } catch (e) {
          console.warn(`Failed to parse localStorage data for ${namespace}`);
        }
      }
      
      // Try to get from sessionStorage
      const sessionData = sessionStorage.getItem(`perm-${namespace}`);
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          return parsed.data as T;
        } catch (e) {
          console.warn(`Failed to parse sessionStorage data for ${namespace}`);
        }
      }
      
      // Try IndexedDB if implemented
      
      return null;
    } catch (error) {
      console.error(`Failed to load data for ${namespace}:`, error);
      return null;
    }
  }
  
  /**
   * Clear data from all storage mechanisms
   * @param namespace - Storage namespace to clear
   */
  public async clearData(namespace: StorageNamespace): Promise<boolean> {
    try {
      await this.waitUntilReady();
      
      // Clear from localStorage
      localStorage.removeItem(`perm-${namespace}`);
      
      // Clear from sessionStorage
      sessionStorage.removeItem(`perm-${namespace}`);
      
      // Clear from IndexedDB if implemented
      
      return true;
    } catch (error) {
      console.error(`Failed to clear data for ${namespace}:`, error);
      return false;
    }
  }
  
  /**
   * Check if data exists in storage
   * @param namespace - Storage namespace
   */
  public async hasData(namespace: StorageNamespace): Promise<boolean> {
    try {
      await this.waitUntilReady();
      
      // Check localStorage
      if (localStorage.getItem(`perm-${namespace}`)) {
        return true;
      }
      
      // Check sessionStorage
      if (sessionStorage.getItem(`perm-${namespace}`)) {
        return true;
      }
      
      // Check IndexedDB if implemented
      
      return false;
    } catch (error) {
      console.error(`Failed to check if data exists for ${namespace}:`, error);
      return false;
    }
  }
}

// Create a singleton instance
const permanentStorage = new PermanentStorage();
export default permanentStorage;
