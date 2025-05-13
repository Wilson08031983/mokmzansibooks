
/**
 * Utility to check IndexedDB availability
 */

/**
 * Check if IndexedDB is available in the current browser
 * @returns Promise resolving to true if IndexedDB is available
 */
export const checkIndexedDBAvailability = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if the API exists
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB is not available in this browser');
      resolve(false);
      return;
    }
    
    // Try to open a test database
    const request = indexedDB.open('test-db', 1);
    
    request.onerror = () => {
      console.warn('IndexedDB permission denied or not available');
      resolve(false);
    };
    
    request.onsuccess = (event) => {
      const db = request.result;
      db.close();
      
      // Clean up the test database
      const deleteRequest = indexedDB.deleteDatabase('test-db');
      deleteRequest.onerror = () => {
        console.warn('Error cleaning up test IndexedDB database');
      };
      
      resolve(true);
    };
  });
};

/**
 * Check if storage quota is available
 * @returns Promise resolving to the available storage quota in bytes
 */
export const checkStorageQuota = async (): Promise<number> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const { quota, usage } = await navigator.storage.estimate();
      if (quota && usage) {
        return quota - usage;
      }
    } catch (error) {
      console.warn('Error checking storage quota:', error);
    }
  }
  
  return -1; // Unknown quota
};

export default {
  checkIndexedDBAvailability,
  checkStorageQuota
};
