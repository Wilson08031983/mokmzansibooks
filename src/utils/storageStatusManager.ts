
/**
 * Utility for checking and managing storage status
 * This provides information about available storage mechanisms and their status
 */

const storageStatusManager = {
  initialized: false,
  
  // Storage status information
  status: {
    localStorage: true,
    sessionStorage: true,
    indexedDB: false,
    degradedMode: false
  },
  
  /**
   * Initializes the storage status manager
   * @returns Promise that resolves when initialization is complete
   */
  initialize: async (): Promise<boolean> => {
    if (storageStatusManager.initialized) {
      return true;
    }
    
    try {
      console.log('Initializing storage status manager...');
      
      // Check localStorage availability
      try {
        localStorage.setItem('storage-test', 'test');
        localStorage.removeItem('storage-test');
        storageStatusManager.status.localStorage = true;
      } catch (e) {
        console.warn('localStorage not available');
        storageStatusManager.status.localStorage = false;
        storageStatusManager.status.degradedMode = true;
      }
      
      // Check sessionStorage availability
      try {
        sessionStorage.setItem('storage-test', 'test');
        sessionStorage.removeItem('storage-test');
        storageStatusManager.status.sessionStorage = true;
      } catch (e) {
        console.warn('sessionStorage not available');
        storageStatusManager.status.sessionStorage = false;
        storageStatusManager.status.degradedMode = true;
      }
      
      // Check IndexedDB availability
      try {
        if ('indexedDB' in window) {
          storageStatusManager.status.indexedDB = true;
        } else {
          console.warn('IndexedDB not available');
          storageStatusManager.status.indexedDB = false;
          storageStatusManager.status.degradedMode = true;
        }
      } catch (e) {
        console.warn('Error checking IndexedDB availability:', e);
        storageStatusManager.status.indexedDB = false;
        storageStatusManager.status.degradedMode = true;
      }
      
      // Set global variable for access in other places
      if (typeof window !== 'undefined') {
        (window as any).__STORAGE_STATUS__ = storageStatusManager.status;
      }
      
      storageStatusManager.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize storage status manager:', error);
      return false;
    }
  }
};

export default storageStatusManager;
