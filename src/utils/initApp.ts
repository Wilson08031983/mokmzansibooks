
import robustStorageMigrator from './robustStorageMigrator';
import testSupabaseConnection from './testSupabaseConnection';
import { initializeClientDataPersistence } from './clientDataPersistence';
import { initializeFormDataPersistence } from './formDataPersistence';
import { initializeImageStorage } from './invoiceFormPersistence';
import { initializeAllStorageAdapters } from '../contexts/integrateStorageAdapters';
import { initializeCompanyStorage } from './companyStorageAdapter';
import superPersistentStorage, { DataCategory } from './superPersistentStorage';
import { setGlobalSyncCallbacks } from './syncStorageUtils';
import { initializeAllDatabases } from './indexedDBErrorHandler';
import { autoFixDatabaseIssues, recreateObjectStores } from './fixIndexedDBIssues';
import { initializeEmergencyRecovery, runEmergencyRecovery } from './emergencyDataRecovery';
/**
 * Application initialization utilities
 * 
 * Handles app initialization, data loading, and restoration after logout
 */
import { getSafeClientData } from "./clientDataPersistence";
import { initializeCompanyDataPersistence } from "./companyDataPersistence";
import { initPersistenceService } from "@/services/persistenceService";

/**
 * Initialize the app when it first loads
 */
export const initializeApp = () => {
  try {
    console.log('Initializing application...');
    
    // Initialize persistence service first
    initPersistenceService();
    
    // Initialize company data persistence
    initializeCompanyDataPersistence();
    
    // Ensure client data is available
    const clients = getSafeClientData();
    console.log(`Found ${clients.companies.length + clients.individuals.length + clients.vendors.length} clients in storage`);
    
    // Set up event listeners for additional initialization
    window.addEventListener('storage', (event) => {
      // Watch for specific storage changes
      if (event.key === 'clients' || 
          event.key === 'mokClients' || 
          event.key === 'mok-mzansi-books-clients') {
        console.log('Client data changed in another tab');
      }
    });

    console.log('Application initialization complete');
  } catch (error) {
    console.error('Error during application initialization:', error);
  }
};

/**
 * Reinitialize critical data after logout
 */
export const reinitializeAfterLogout = () => {
  try {
    console.log('Reinitializing after logout...');
    
    // Reinitialize company data persistence
    initializeCompanyDataPersistence();
    
    // Ensure client data is available
    const clients = getSafeClientData();
    console.log(`Restored ${clients.companies.length + clients.individuals.length + clients.vendors.length} clients after logout`);
    
    console.log('Post-logout reinitialization complete');
    return true;
  } catch (error) {
    console.error('Error during post-logout reinitialization:', error);
    return false;
  }
};

// For debug.tsx usage
export const debugHelpers = {
  getClientData: () => getSafeClientData(),
  reinitialize: reinitializeAfterLogout
};

/**
 * Add health check and validation methods to the window object for debugging
 */
export const exposeDebugMethods = () => {
  // Expose the robustStorageMigrator for debugging and testing
  (window as any).robustStorageMigrator = robustStorageMigrator;
  
  // Expose Supabase connection test
  (window as any).testSupabaseConnection = testSupabaseConnection;
  
  // Expose data persistence test
  (window as any).testDataPersistence = async () => {
    // Function to test data persistence across logout/login cycles
    console.log('Running data persistence test...');
    try {
      await robustStorageMigrator.ensureInitialized();
      return 'Data persistence test completed - check console for detailed results';
    } catch (error) {
      console.error('Data persistence test failed:', error);
      return 'Data persistence test failed - see console for errors';
    }
  };

  if (process.env.NODE_ENV === 'development') {
    const debugWindow = window as any;
    
    // Add health check function
    debugWindow.checkStorageHealth = async () => {
      console.log('Running storage health check...');
      try {
        const health = await superPersistentStorage.validateHealth();
        console.log('Storage health status:', health);
        return health;
      } catch (error) {
        console.error('Error during health check:', error);
        return { healthy: false, issues: ['Exception during health check'] };
      }
    };
    
    // Add recovery function
    debugWindow.recoverStorage = async () => {
      console.log('Attempting storage recovery...');
      try {
        const result = await superPersistentStorage.attemptRecovery();
        console.log('Recovery result:', result);
        return result;
      } catch (error) {
        console.error('Error during recovery:', error);
        return false;
      }
    };
    
    // Add force save function
    debugWindow.testDataPersistence = {
      forceSave: async (category: DataCategory, testData: any) => {
        console.log(`Force saving test data to category ${DataCategory[category]}...`);
        return await superPersistentStorage.save(category, testData);
      },
      forceLoad: async (category: DataCategory) => {
        console.log(`Force loading data from category ${DataCategory[category]}...`);
        return await superPersistentStorage.load(category);
      },
      repairStorage: async () => {
        console.log('Attempting storage repair...');
        return await superPersistentStorage.attemptRecovery();
      }
    };
    
    console.log('💻 Debug methods exposed. Access via window.testDataPersistence');
  }
}
