
/**
 * Utility to check IndexedDB availability and provide status information
 */

export const storageAvailability = {
  checked: false,
  localStorage: true,
  sessionStorage: true,
  indexedDB: false,
  
  /**
   * Check availability of different storage mechanisms
   * @returns Promise that resolves when checks are complete
   */
  check: async (): Promise<boolean> => {
    try {
      // Check localStorage
      try {
        localStorage.setItem('storage-test', 'test');
        localStorage.removeItem('storage-test');
        storageAvailability.localStorage = true;
      } catch (e) {
        console.warn('localStorage not available');
        storageAvailability.localStorage = false;
      }
      
      // Check sessionStorage
      try {
        sessionStorage.setItem('storage-test', 'test');
        sessionStorage.removeItem('storage-test');
        storageAvailability.sessionStorage = true;
      } catch (e) {
        console.warn('sessionStorage not available');
        storageAvailability.sessionStorage = false;
      }
      
      // Check IndexedDB
      if (window.indexedDB) {
        try {
          const request = window.indexedDB.open('availability-test', 1);
          
          request.onerror = () => {
            console.warn('IndexedDB access denied');
            storageAvailability.indexedDB = false;
          };
          
          request.onsuccess = (event) => {
            const db = request.result;
            db.close();
            window.indexedDB.deleteDatabase('availability-test');
            storageAvailability.indexedDB = true;
          };
        } catch (e) {
          console.warn('Error testing IndexedDB:', e);
          storageAvailability.indexedDB = false;
        }
      } else {
        console.warn('IndexedDB not supported');
        storageAvailability.indexedDB = false;
      }
      
      storageAvailability.checked = true;
      return true;
    } catch (error) {
      console.error('Error checking storage availability:', error);
      return false;
    }
  }
};

export default storageAvailability;
