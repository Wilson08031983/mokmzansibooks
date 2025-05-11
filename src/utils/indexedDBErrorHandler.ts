/**
 * IndexedDB Error Handler Utility
 * 
 * This module provides robust error handling for IndexedDB operations,
 * helping diagnose and recover from common issues.
 */

// Check if IndexedDB is available in this browser
export const isIndexedDBAvailable = (): boolean => {
  try {
    return 'indexedDB' in window && window.indexedDB !== null;
  } catch (error) {
    console.error('Error checking IndexedDB availability:', error);
    return false;
  }
};

// Log and standardize IndexedDB errors
export const handleIndexedDBError = (
  error: any, 
  operation: string, 
  store: string
): Error => {
  let errorMessage = 'Unknown IndexedDB error';
  let errorCode = 'UNKNOWN';
  
  // Standardize error reporting
  if (error instanceof Error) {
    errorMessage = error.message;
    // Extract error code if available
    const dOMException = error as DOMException;
    if (dOMException.code) {
      errorCode = `CODE_${dOMException.code}`;
    } else if (dOMException.name) {
      errorCode = dOMException.name;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    errorMessage = JSON.stringify(error);
  }
  
  // Enhanced logging
  console.error(`[IndexedDB Error] ${errorCode} in ${operation} for ${store}: ${errorMessage}`);
  
  // Return standardized error for handling
  return new Error(`IndexedDB ${operation} failed for ${store}: ${errorMessage}`);
};

// Check database connection status
export const checkDatabaseConnection = async (
  dbName: string, 
  version?: number
): Promise<boolean> => {
  if (!isIndexedDBAvailable()) {
    console.warn('IndexedDB is not available in this browser');
    return false;
  }
  
  return new Promise((resolve) => {
    try {
      const openRequest = indexedDB.open(dbName, version);
      
      const timeoutId = setTimeout(() => {
        console.warn(`IndexedDB connection to ${dbName} timed out`);
        resolve(false);
      }, 2000); // 2 second timeout
      
      openRequest.onsuccess = () => {
        clearTimeout(timeoutId);
        const db = openRequest.result;
        db.close();
        resolve(true);
      };
      
      openRequest.onerror = (event) => {
        clearTimeout(timeoutId);
        console.error('Error opening IndexedDB:', (event.target as any).error);
        resolve(false);
      };
      
      openRequest.onblocked = () => {
        clearTimeout(timeoutId);
        console.warn('IndexedDB connection blocked');
        resolve(false);
      };
    } catch (error) {
      console.error('Exception checking IndexedDB connection:', error);
      resolve(false);
    }
  });
};

// Attempt to fix common IndexedDB issues
export const attemptIndexedDBRepair = async (dbName: string): Promise<boolean> => {
  console.log(`Attempting to repair IndexedDB database: ${dbName}`);
  
  // First check if we can connect at all
  const canConnect = await checkDatabaseConnection(dbName);
  if (canConnect) {
    console.log(`Connected to ${dbName} successfully, no repair needed`);
    return true;
  }
  
  // Try to delete the database and recreate it
  return new Promise((resolve) => {
    try {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      
      deleteRequest.onsuccess = () => {
        console.log(`Successfully deleted ${dbName} database for repair`);
        
        // Try to recreate with a basic structure
        const openRequest = indexedDB.open(dbName, 1);
        
        openRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          // Create a basic object store to ensure the database is valid
          db.createObjectStore('system', { keyPath: 'id' });
        };
        
        openRequest.onsuccess = () => {
          console.log(`Successfully repaired ${dbName} database`);
          openRequest.result.close();
          resolve(true);
        };
        
        openRequest.onerror = () => {
          console.error(`Failed to recreate ${dbName} database`);
          resolve(false);
        };
      };
      
      deleteRequest.onerror = () => {
        console.error(`Failed to delete ${dbName} database for repair`);
        resolve(false);
      };
    } catch (error) {
      console.error('Exception during IndexedDB repair:', error);
      resolve(false);
    }
  });
};

// Safely execute an IndexedDB operation with retries and fallback
export const safeIndexedDBOperation = async <T>(
  operation: () => Promise<T>,
  fallback: () => Promise<T>,
  options: {
    operationName: string;
    storeName: string;
    maxRetries?: number;
    delayBetweenRetries?: number;
  }
): Promise<T> => {
  const { operationName, storeName, maxRetries = 2, delayBetweenRetries = 500 } = options;
  
  // Try the main operation with retries
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If not the first attempt, add a small delay
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRetries));
        console.log(`Retry attempt ${attempt} for ${operationName} on ${storeName}`);
      }
      
      return await operation();
    } catch (error) {
      handleIndexedDBError(error, operationName, storeName);
      
      // If we've exhausted retries, fall back
      if (attempt === maxRetries) {
        console.warn(`All ${maxRetries} retries failed for ${operationName} on ${storeName}, using fallback`);
        try {
          return await fallback();
        } catch (fallbackError) {
          console.error(`Fallback also failed for ${operationName}:`, fallbackError);
          throw new Error(`Both main operation and fallback failed for ${operationName}`);
        }
      }
    }
  }
  
  // This should never be reached due to the return in the loop, but TypeScript requires it
  throw new Error(`Unexpected error in safeIndexedDBOperation for ${operationName}`);
};

// Initialize all the databases we expect to use, ensuring they're created
export const initializeAllDatabases = async (): Promise<boolean> => {
  const databases = [
    'MokMzansiBooks', // Main database
    'MokMzansiInventory',
    'MokMzansiAccounting',
    'MokMzansiHR',
    'MokMzansiReports',
    'MokMzansiSettings',
    'MokMzansiClients',
    'MokMzansiCompany'
  ];
  
  let successCount = 0;
  
  for (const dbName of databases) {
    // Try to connect to each database
    try {
      const success = await checkDatabaseConnection(dbName);
      if (!success) {
        console.log(`Attempting to create database: ${dbName}`);
        
        // Try to create a basic version of the database
        const created = await new Promise<boolean>((resolve) => {
          try {
            const openRequest = indexedDB.open(dbName, 1);
            
            openRequest.onupgradeneeded = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              // Just create a basic store to initialize it
              if (!db.objectStoreNames.contains('system')) {
                db.createObjectStore('system', { keyPath: 'id' });
              }
            };
            
            openRequest.onsuccess = () => {
              const db = openRequest.result;
              console.log(`Successfully created database: ${dbName}`);
              db.close();
              resolve(true);
            };
            
            openRequest.onerror = (event) => {
              console.error(`Error creating database ${dbName}:`, (event.target as any).error);
              resolve(false);
            };
          } catch (error) {
            console.error(`Exception creating database ${dbName}:`, error);
            resolve(false);
          }
        });
        
        if (created) {
          successCount++;
        }
      } else {
        successCount++;
      }
    } catch (error) {
      console.error(`Failed to initialize database ${dbName}:`, error);
    }
  }
  
  return successCount === databases.length;
};
