
/**
 * Storage Status Manager
 * Monitors the availability and health of various storage mechanisms.
 */

// Storage types that we monitor
export type StorageType = 'localStorage' | 'sessionStorage' | 'indexedDB';

// Holds the current status of each storage mechanism
export interface StorageStatus {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  degradedMode: boolean; // If true, we're falling back to alternative storage
}

// Initialize with default values (all unknown)
let currentStatus: StorageStatus = {
  localStorage: false,
  sessionStorage: false,
  indexedDB: false,
  degradedMode: false
};

// Check if a web storage type is available and working
function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const testKey = `test-${Math.random()}`;
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

// Check if IndexedDB is available and working
async function isIndexedDBAvailable(): Promise<boolean> {
  if (!window.indexedDB) return false;
  
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open('test-db', 1);
      
      request.onerror = () => {
        resolve(false);
      };
      
      request.onsuccess = () => {
        const db = request.result;
        db.close();
        
        // Clean up test database
        window.indexedDB.deleteDatabase('test-db');
        resolve(true);
      };
    } catch (e) {
      resolve(false);
    }
  });
}

// Initialize and check all storage mechanisms
export async function initializeStorageStatus(): Promise<StorageStatus> {
  try {
    const localStorageAvailable = isStorageAvailable('localStorage');
    const sessionStorageAvailable = isStorageAvailable('sessionStorage');
    const indexedDBAvailable = await isIndexedDBAvailable();
    
    currentStatus = {
      localStorage: localStorageAvailable,
      sessionStorage: sessionStorageAvailable,
      indexedDB: indexedDBAvailable,
      // In degraded mode if primary storage options are unavailable
      degradedMode: !localStorageAvailable || !indexedDBAvailable
    };
    
    return currentStatus;
  } catch (error) {
    console.error('Error initializing storage status:', error);
    
    // If we can't check status, assume degraded mode
    currentStatus = {
      localStorage: false,
      sessionStorage: false,
      indexedDB: false,
      degradedMode: true
    };
    
    return currentStatus;
  }
}

// Get the current storage status
export function getStorageStatus(): StorageStatus {
  return currentStatus;
}

// Check if we're in degraded mode
export function isDegradedMode(): boolean {
  return currentStatus.degradedMode;
}

// Check a specific storage type
export function isStorageTypeAvailable(type: StorageType): boolean {
  return currentStatus[type];
}

// Monitor for changes in storage availability
export function startStorageMonitoring(intervalMs: number = 60000): () => void {
  const intervalId = setInterval(async () => {
    const previousStatus = { ...currentStatus };
    await initializeStorageStatus();
    
    // If status changed, trigger an event
    if (
      previousStatus.localStorage !== currentStatus.localStorage ||
      previousStatus.sessionStorage !== currentStatus.sessionStorage ||
      previousStatus.indexedDB !== currentStatus.indexedDB ||
      previousStatus.degradedMode !== currentStatus.degradedMode
    ) {
      const event = new CustomEvent('storageStatusChanged', { 
        detail: { 
          previousStatus, 
          currentStatus 
        } 
      });
      window.dispatchEvent(event);
    }
  }, intervalMs);
  
  // Return function to stop monitoring
  return () => clearInterval(intervalId);
}

export default {
  initializeStorageStatus,
  getStorageStatus,
  isDegradedMode,
  isStorageTypeAvailable,
  startStorageMonitoring
};
