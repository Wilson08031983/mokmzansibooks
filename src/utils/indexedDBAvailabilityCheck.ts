
/**
 * Utility for checking if IndexedDB is available in the current browser environment
 */

/**
 * Check if IndexedDB is available
 * @returns Promise that resolves with a boolean indicating if IndexedDB is available
 */
export const checkIndexedDBAvailability = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return false;
  }
  
  return new Promise<boolean>((resolve) => {
    try {
      const request = indexedDB.open('indexeddb_check', 1);
      let hasTimedOut = false;
      
      // Set a timeout in case the request never completes
      const timeout = setTimeout(() => {
        hasTimedOut = true;
        resolve(false);
      }, 2000);
      
      request.onerror = () => {
        clearTimeout(timeout);
        if (!hasTimedOut) {
          console.warn('IndexedDB check failed: Error opening database');
          resolve(false);
        }
      };
      
      request.onblocked = () => {
        clearTimeout(timeout);
        if (!hasTimedOut) {
          console.warn('IndexedDB check failed: Request was blocked');
          resolve(false);
        }
      };
      
      request.onsuccess = (event) => {
        clearTimeout(timeout);
        if (!hasTimedOut) {
          const db = request.result;
          db.close();
          
          // Try to delete the test database
          const deleteRequest = indexedDB.deleteDatabase('indexeddb_check');
          deleteRequest.onerror = () => {
            console.warn('Could not delete test IndexedDB database');
          };
          
          resolve(true);
        }
      };
    } catch (error) {
      console.error('Error checking IndexedDB availability:', error);
      resolve(false);
    }
  });
};

/**
 * Check if IndexedDB has sufficient storage quota
 * @param requiredMB Required storage in MB
 * @returns Promise that resolves with a boolean indicating if there's enough quota
 */
export const checkStorageQuota = async (requiredMB: number = 10): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
    return true; // Assume enough storage if we can't check
  }
  
  try {
    const estimate = await navigator.storage.estimate();
    const availableBytes = (estimate.quota || 0) - (estimate.usage || 0);
    const requiredBytes = requiredMB * 1024 * 1024;
    
    return availableBytes >= requiredBytes;
  } catch (error) {
    console.error('Error checking storage quota:', error);
    return true; // Assume enough storage if we can't check
  }
};

export default {
  checkIndexedDBAvailability,
  checkStorageQuota
};
