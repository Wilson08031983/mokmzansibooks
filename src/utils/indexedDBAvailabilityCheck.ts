
/**
 * IndexedDB Availability Check
 * Utility to verify if IndexedDB is available and working correctly.
 */

// Result of the availability check
export interface IndexedDBAvailabilityResult {
  available: boolean;
  error?: string;
  browserSupported: boolean;
  privateMode: boolean;
  storageQuota: {
    estimated: number;
    quota: number;
    percentUsed: number;
  } | null;
}

// Check if the browser supports IndexedDB
function isBrowserSupported(): boolean {
  return 'indexedDB' in window;
}

// Check if the browser is in private/incognito mode
// This is a best effort detection as browsers handle this differently
async function isPrivateMode(): Promise<boolean> {
  if (!isBrowserSupported()) return false;
  
  try {
    // Try to open a test database
    const request = window.indexedDB.open('test-private-mode', 1);
    
    return new Promise((resolve) => {
      request.onerror = () => {
        // In Safari private mode, this will fail
        resolve(true);
      };
      
      request.onsuccess = () => {
        // Clean up and resolve
        const db = request.result;
        db.close();
        window.indexedDB.deleteDatabase('test-private-mode');
        resolve(false);
      };
    });
  } catch (e) {
    return true;
  }
}

// Estimate storage quota information
async function getStorageQuotaInfo(): Promise<{
  estimated: number;
  quota: number;
  percentUsed: number;
} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      
      if (estimate.usage !== undefined && estimate.quota !== undefined) {
        return {
          estimated: estimate.usage,
          quota: estimate.quota,
          percentUsed: (estimate.usage / estimate.quota) * 100
        };
      }
    } catch (e) {
      console.error('Error estimating storage quota:', e);
    }
  }
  
  return null;
}

// Check if IndexedDB is available and usable
export async function checkIndexedDBAvailability(): Promise<IndexedDBAvailabilityResult> {
  const browserSupported = isBrowserSupported();
  
  if (!browserSupported) {
    return {
      available: false,
      error: 'IndexedDB is not supported in this browser',
      browserSupported: false,
      privateMode: false,
      storageQuota: null
    };
  }
  
  const privateMode = await isPrivateMode();
  const storageQuota = await getStorageQuotaInfo();
  
  if (privateMode) {
    return {
      available: false,
      error: 'Browser is in private/incognito mode which may restrict IndexedDB',
      browserSupported: true,
      privateMode: true,
      storageQuota
    };
  }
  
  try {
    // More thorough test - try creating an object store
    const request = window.indexedDB.open('test-availability', 1);
    
    return new Promise((resolve) => {
      request.onerror = (event) => {
        const error = (event.target as any)?.error?.message || 'Unknown error opening IndexedDB';
        resolve({
          available: false,
          error,
          browserSupported: true,
          privateMode: false,
          storageQuota
        });
      };
      
      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          db.createObjectStore('test-store', { keyPath: 'id' });
        } catch (e) {
          console.error('Error creating object store:', e);
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        
        try {
          // Try a transaction
          const tx = db.transaction('test-store', 'readwrite');
          const store = tx.objectStore('test-store');
          
          const addRequest = store.add({ id: 1, test: 'data' });
          
          addRequest.onsuccess = () => {
            // Clean up and resolve
            db.close();
            window.indexedDB.deleteDatabase('test-availability');
            
            resolve({
              available: true,
              browserSupported: true,
              privateMode: false,
              storageQuota
            });
          };
          
          addRequest.onerror = () => {
            db.close();
            window.indexedDB.deleteDatabase('test-availability');
            
            resolve({
              available: false,
              error: 'Failed to write data to IndexedDB',
              browserSupported: true,
              privateMode: false,
              storageQuota
            });
          };
        } catch (e) {
          console.error('Error during IndexedDB transaction test:', e);
          db.close();
          window.indexedDB.deleteDatabase('test-availability');
          
          resolve({
            available: false,
            error: e instanceof Error ? e.message : 'Unknown error during IndexedDB transaction',
            browserSupported: true,
            privateMode: false,
            storageQuota
          });
        }
      };
    });
  } catch (e) {
    return {
      available: false,
      error: e instanceof Error ? e.message : 'Unexpected error checking IndexedDB availability',
      browserSupported: true,
      privateMode,
      storageQuota
    };
  }
}

export function isIndexedDBAvailable(): boolean {
  return 'indexedDB' in window;
}

export default { checkIndexedDBAvailability, isIndexedDBAvailable };
