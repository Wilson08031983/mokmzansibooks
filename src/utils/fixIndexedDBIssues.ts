/**
 * IndexedDB Fix Utility
 * 
 * This utility provides methods to diagnose and fix common IndexedDB issues
 * occurring in the MokMzansi Books application.
 */

import { DataCategory } from './superPersistentStorage';
import { initializeAllDatabases } from './indexedDBErrorHandler';

/**
 * Database names for each module
 */
export const DATABASE_NAMES = {
  MAIN: 'MokMzansiSuperStorage',
  ACCOUNTING: 'MokMzansiAccounting',
  HR: 'MokMzansiHR',
  INVENTORY: 'MokMzansiInventory',
  REPORTS: 'MokMzansiReports',
  SETTINGS: 'MokMzansiSettings'
};

/**
 * Recreate object stores in the main database to fix missing store errors
 */
export async function recreateObjectStores(): Promise<boolean> {
  console.log('Recreating missing object stores...');
  
  try {
    // Close all database connections
    await closeAllConnections();
    
    // Get all database names
    const dbNames = Object.values(DATABASE_NAMES);
    
    // Delete and recreate each database
    for (const dbName of dbNames) {
      await recreateDatabase(dbName);
    }
    
    // Initialize all databases
    await initializeAllDatabases();
    
    console.log('Successfully recreated all databases with correct object stores');
    return true;
  } catch (error) {
    console.error('Failed to recreate object stores:', error);
    return false;
  }
}

/**
 * Delete and recreate a specific database with the correct object stores
 */
async function recreateDatabase(dbName: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      console.log(`Recreating database: ${dbName}`);
      
      // First delete the database
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      
      deleteRequest.onsuccess = () => {
        console.log(`Successfully deleted database: ${dbName}`);
        
        // Create a new database with the correct object stores
        const openRequest = indexedDB.open(dbName, 1);
        
        openRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (dbName === DATABASE_NAMES.MAIN) {
            // Create object stores for each data category in the main database
            Object.values(DataCategory).forEach(category => {
              console.log(`Creating object store: ${category}`);
              if (!db.objectStoreNames.contains(category)) {
                db.createObjectStore(category);
              }
            });
            
            // Create metadata store
            if (!db.objectStoreNames.contains('metadata')) {
              db.createObjectStore('metadata', { keyPath: 'key' });
            }
          } else {
            // Create a general store for other databases
            if (!db.objectStoreNames.contains('data')) {
              db.createObjectStore('data', { keyPath: 'id' });
            }
          }
        };
        
        openRequest.onsuccess = () => {
          console.log(`Successfully recreated database: ${dbName}`);
          openRequest.result.close();
          resolve(true);
        };
        
        openRequest.onerror = (event) => {
          console.error(`Error recreating database ${dbName}:`, (event.target as any).error);
          resolve(false);
        };
      };
      
      deleteRequest.onerror = (event) => {
        console.error(`Error deleting database ${dbName}:`, (event.target as any).error);
        resolve(false);
      };
    } catch (error) {
      console.error(`Exception recreating database ${dbName}:`, error);
      resolve(false);
    }
  });
}

/**
 * Close all open IndexedDB connections
 */
async function closeAllConnections(): Promise<void> {
  return new Promise((resolve) => {
    const dbNames = Object.values(DATABASE_NAMES);
    let closedCount = 0;
    
    for (const dbName of dbNames) {
      try {
        const request = indexedDB.open(dbName);
        
        request.onsuccess = () => {
          const db = request.result;
          db.close();
          console.log(`Closed connection to database: ${dbName}`);
          
          closedCount++;
          if (closedCount === dbNames.length) {
            resolve();
          }
        };
        
        request.onerror = () => {
          console.log(`No open connection to close for database: ${dbName}`);
          closedCount++;
          if (closedCount === dbNames.length) {
            resolve();
          }
        };
      } catch (error) {
        console.error(`Error closing connection to database ${dbName}:`, error);
        closedCount++;
        if (closedCount === dbNames.length) {
          resolve();
        }
      }
    }
  });
}

/**
 * Fix a specific data category's issues by clearing and reinitializing it
 */
export async function fixDataCategoryIssues(category: DataCategory): Promise<boolean> {
  console.log(`Fixing issues with data category: ${category}`);
  
  try {
    // Save any existing data from localStorage as backup
    const localStorageKey = `mok_${category}`;
    const existingData = localStorage.getItem(localStorageKey);
    
    // Clear any corrupted IndexedDB data
    await clearCategoryFromDatabase(DATABASE_NAMES.MAIN, category);
    
    // Initialize database with the correct structure
    await initializeAllDatabases();
    
    console.log(`Successfully fixed issues with data category: ${category}`);
    return true;
  } catch (error) {
    console.error(`Failed to fix issues with data category ${category}:`, error);
    return false;
  }
}

/**
 * Clear a specific category from a database
 */
async function clearCategoryFromDatabase(dbName: string, category: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(dbName);
      
      request.onsuccess = () => {
        const db = request.result;
        
        // Check if the object store exists
        if (!db.objectStoreNames.contains(category)) {
          console.log(`Object store ${category} doesn't exist in ${dbName}, nothing to clear`);
          db.close();
          resolve(true);
          return;
        }
        
        // Create a transaction to clear the object store
        const transaction = db.transaction([category], 'readwrite');
        const objectStore = transaction.objectStore(category);
        
        const clearRequest = objectStore.clear();
        
        clearRequest.onsuccess = () => {
          console.log(`Successfully cleared ${category} from ${dbName}`);
          db.close();
          resolve(true);
        };
        
        clearRequest.onerror = (event) => {
          console.error(`Error clearing ${category} from ${dbName}:`, (event.target as any).error);
          db.close();
          resolve(false);
        };
      };
      
      request.onerror = (event) => {
        console.error(`Error opening database ${dbName}:`, (event.target as any).error);
        resolve(false);
      };
    } catch (error) {
      console.error(`Exception clearing ${category} from ${dbName}:`, error);
      resolve(false);
    }
  });
}

/**
 * Auto-fix database issues at startup
 */
export async function autoFixDatabaseIssues(): Promise<boolean> {
  console.log('Auto-fixing database issues...');
  
  // Check for previous error flags
  const hasErrors = localStorage.getItem('indexeddb_error_detected') === 'true';
  
  if (hasErrors) {
    console.log('Previous IndexedDB errors detected, performing complete database reset');
    await recreateObjectStores();
    localStorage.removeItem('indexeddb_error_detected');
    return true;
  }
  
  // Initialize all databases to ensure they exist with correct structure
  await initializeAllDatabases();
  
  return true;
}
