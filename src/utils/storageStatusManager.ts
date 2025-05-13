
/**
 * Utility for checking and managing storage status
 */

// Interface for storage status
interface StorageStatus {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  degradedMode: boolean;
}

// Singleton for managing storage status
const storageStatusManager = {
  initialized: false,
  status: {
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    degradedMode: false,
  } as StorageStatus,
  
  /**
   * Initialize storage status manager
   * @returns Promise that resolves when initialization is complete
   */
  initialize: async (): Promise<boolean> => {
    try {
      // Check localStorage
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        storageStatusManager.status.localStorage = true;
      } catch (e) {
        console.error('localStorage not available:', e);
        storageStatusManager.status.localStorage = false;
      }
      
      // Check sessionStorage
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        storageStatusManager.status.sessionStorage = true;
      } catch (e) {
        console.error('sessionStorage not available:', e);
        storageStatusManager.status.sessionStorage = false;
      }
      
      // Check IndexedDB
      try {
        const request = indexedDB.open('test', 1);
        let isAvailable = false;
        
        const checkPromise = new Promise<boolean>((resolve) => {
          request.onerror = () => {
            console.error('IndexedDB not available');
            resolve(false);
          };
          
          request.onsuccess = () => {
            const db = request.result;
            db.close();
            
            // Try to delete the test database
            try {
              indexedDB.deleteDatabase('test');
            } catch (e) {
              console.warn('Could not delete test IndexedDB database:', e);
            }
            
            resolve(true);
          };
        });
        
        isAvailable = await checkPromise;
        storageStatusManager.status.indexedDB = isAvailable;
      } catch (e) {
        console.error('Error checking IndexedDB availability:', e);
        storageStatusManager.status.indexedDB = false;
      }
      
      // Set degraded mode if needed storage mechanisms are unavailable
      storageStatusManager.status.degradedMode = !storageStatusManager.status.localStorage || 
                                                 !storageStatusManager.status.sessionStorage;
      
      // Store status in global object for debugging
      if (typeof window !== 'undefined') {
        (window as any).__STORAGE_STATUS__ = storageStatusManager.status;
      }
      
      storageStatusManager.initialized = true;
      console.log('Storage status initialized:', storageStatusManager.status);
      
      return true;
    } catch (error) {
      console.error('Error initializing storage status manager:', error);
      return false;
    }
  },
};

export default storageStatusManager;
