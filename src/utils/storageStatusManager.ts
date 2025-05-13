
/**
 * Storage Status Manager
 * Monitors the availability and health of browser storage mechanisms
 */

// Types for the status
export interface StorageStatus {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  degradedMode: boolean;
}

// Singleton class to manage storage status
class StorageStatusManager {
  initialized: boolean = false;
  status: StorageStatus = {
    localStorage: true,
    sessionStorage: true,
    indexedDB: true,
    degradedMode: false
  };

  // Initialize and check storage
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      // Check localStorage
      this.status.localStorage = this.isStorageAvailable('localStorage');
      
      // Check sessionStorage
      this.status.sessionStorage = this.isStorageAvailable('sessionStorage');
      
      // Check indexedDB
      this.status.indexedDB = 'indexedDB' in window;
      
      // Set degraded mode flag if critical storage is unavailable
      this.status.degradedMode = !this.status.localStorage || !this.status.indexedDB;
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing storage status manager:', error);
      this.status.degradedMode = true;
      this.initialized = true;
      return false;
    }
  }

  // Helper to check if storage type is available
  private isStorageAvailable(type: string): boolean {
    try {
      const storage = window[type as keyof Window] as Storage;
      if (!storage) return false;
      
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Create and export a singleton instance
const storageStatusManager = new StorageStatusManager();
export default storageStatusManager;
