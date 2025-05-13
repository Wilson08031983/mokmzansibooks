
/**
 * Utility for managing and tracking storage availability status
 */

export type StorageType = 'localStorage' | 'sessionStorage' | 'indexedDB';

export interface StorageStatus {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  degradedMode: boolean;
}

// Initial status assume everything works until we check
const initialStatus: StorageStatus = {
  localStorage: true,
  sessionStorage: true,
  indexedDB: true,
  degradedMode: false
};

let currentStatus = { ...initialStatus };

// Make status globally accessible for other modules that load before our context system
if (typeof window !== 'undefined') {
  (window as any).__STORAGE_STATUS__ = currentStatus;
}

const storageStatusManager = {
  initialize: async (): Promise<StorageStatus> => {
    return await storageStatusManager.initializeStorageStatus();
  },

  initializeStorageStatus: async (): Promise<StorageStatus> => {
    try {
      // Test localStorage
      try {
        localStorage.setItem('__storage_test__', 'test');
        localStorage.removeItem('__storage_test__');
        currentStatus.localStorage = true;
      } catch (e) {
        currentStatus.localStorage = false;
        currentStatus.degradedMode = true;
      }

      // Test sessionStorage
      try {
        sessionStorage.setItem('__storage_test__', 'test');
        sessionStorage.removeItem('__storage_test__');
        currentStatus.sessionStorage = true;
      } catch (e) {
        currentStatus.sessionStorage = false;
        currentStatus.degradedMode = true;
      }

      // Test indexedDB using a more reliable approach
      try {
        const testDb = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('__idb_test__', 1);
          request.onerror = () => reject(new Error('IndexedDB access denied'));
          request.onsuccess = () => resolve(request.result);
        });
        
        testDb.close();
        indexedDB.deleteDatabase('__idb_test__');
        currentStatus.indexedDB = true;
      } catch (e) {
        currentStatus.indexedDB = false;
        currentStatus.degradedMode = true;
      }

      // Update global reference
      if (typeof window !== 'undefined') {
        (window as any).__STORAGE_STATUS__ = currentStatus;
      }

      return { ...currentStatus };
    } catch (e) {
      // If we can't even run the tests, we're definitely in degraded mode
      currentStatus.degradedMode = true;
      return { ...currentStatus };
    }
  },

  getStorageStatus: (): StorageStatus => {
    return { ...currentStatus };
  },

  isDegradedMode: (): boolean => {
    return currentStatus.degradedMode;
  },

  isStorageTypeAvailable: (type: StorageType): boolean => {
    return currentStatus[type];
  },

  startStorageMonitoring: (intervalMs = 60000) => {
    const interval = setInterval(async () => {
      await storageStatusManager.initializeStorageStatus();
    }, intervalMs);

    return () => clearInterval(interval);
  }
};

export default storageStatusManager;
