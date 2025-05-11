
import { initializeClientDataPersistence, initializeClientData } from './clientDataPersistence';
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
 * Initialize the application
 * This function is called at application startup
 */
export async function initializeApp(): Promise<void> {
  try {
    console.log('🚀 Starting MokMzansi Books application initialization...');
    
    // Initialize emergency data recovery system first
    console.log('🚨 Initializing emergency data recovery system...');
    await initializeEmergencyRecovery();
    
    // Fix any database issues first before proceeding
    console.log('🔧 Checking and fixing database issues...');
    const fixResult = await autoFixDatabaseIssues();
    if (!fixResult) {
      console.warn('⚠️ Database auto-fix was not fully successful, attempting full rebuild...');
      await recreateObjectStores();
    }
    
    // Initialize all databases
    console.log('💾 Initializing databases...');
    await initializeAllDatabases();
    
    // Initialize the super persistent storage system
    console.log('💾 Initializing super persistent storage...');
    const storageReady = await superPersistentStorage.ensureReady();
    
    // Set up basic error handlers and logging
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
      // Try to save any unsaved data
      try {
        localStorage.setItem('emergency_recovery_triggered', 'true');
      } catch (e) {
        console.error('Failed to set emergency recovery flag', e);
      }
    });

    // Initialize company data persistence (critical for business info)
    console.log('🏢 Initializing company data persistence...');
    initializeCompanyStorage();
    
    // Initialize client data persistence (critical for customer management)
    console.log('👥 Initializing client data persistence...');
    initializeClientDataPersistence();
    
    // Initialize client data from storage/backup
    console.log('🔄 Loading client data from persistent storage...');
    initializeClientData();
    
    // Initialize form data persistence for quotes and invoices
    console.log('📝 Initializing form data persistence...');
    initializeFormDataPersistence();
    
    // Initialize image storage for company assets
    console.log('🖼️ Initializing image storage...');
    initializeImageStorage();
    
    // Initialize all other storage adapters (accounting, HR, inventory, reports)
    console.log('📊 Initializing specialized storage adapters...');
    initializeAllStorageAdapters().then(success => {
      if (success) {
        console.log('✅ All storage adapters initialized successfully');
      } else {
        console.warn('⚠️ Some storage adapters failed to initialize');
      }
    });
    
    // Set up global sync status indicators
    const setupDefaultSyncCallbacks = () => {
      setGlobalSyncCallbacks({
        onSyncStart: (message) => console.log(`🔄 Sync started: ${message || 'Saving data...'}`),
        onSyncSuccess: (message) => console.log(`✅ Sync success: ${message || 'Data saved'}`),
        onSyncError: (message) => console.error(`❌ Sync error: ${message || 'Error saving data'}`)
      });
    };
    
    // Default callbacks until the UI context is available
    setupDefaultSyncCallbacks();
    
    console.log('✅ Application initialized successfully with multi-layer data persistence');
    
    // Set up health checks
    if (storageReady) {
      try {
        // Run a health check and log results
        const health = await superPersistentStorage.validateHealth();
        
        // If health check fails, attempt recovery
        if (!health.healthy) {
          console.warn('⚠️ Storage health check failed, attempting recovery...');
          await superPersistentStorage.attemptRecovery();
        }
      } catch (error) {
        console.error('Error during storage health check:', error);
      }
    }
    
    // Periodically check storage health
    setInterval(() => {
      if (storageReady) {
        try {
          // Run a health check and log results
          superPersistentStorage.validateHealth().then(health => {
            if (!health.healthy) {
              console.warn('⚠️ Storage health check failed:', health.issues);
              // Attempt recovery
              superPersistentStorage.attemptRecovery();
            }
          });
        } catch (error) {
          console.error('Error during storage health check:', error);
        }
      }
    }, 300000); // Check every 5 minutes
    
  } catch (error) {
    console.error('❌ Error initializing application:', error);
    
    // Emergency recovery attempt
    try {
      console.log('🚨 Attempting emergency recovery...');
      localStorage.setItem('emergency_recovery_triggered', 'true');
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
    }
  }
}

/**
 * Call this function to reinitialize the app after logout
 * to ensure data is still available
 */
export async function reinitializeAfterLogout(): Promise<void> {
  try {
    console.log('🔄 Reinitializing application after logout...');
    
    // Run emergency data recovery first to ensure all data is available
    await runEmergencyRecovery();
    
    // Ensure storage system is ready
    superPersistentStorage.ensureReady();
    
    // Restore client data from backup if needed
    initializeClientData();
    
    // Reinitialize form data persistence
    initializeFormDataPersistence();
    
    // Reinitialize image storage
    initializeImageStorage();
    
    // Reinitialize all specialized storage adapters
    initializeAllStorageAdapters().then(success => {
      if (success) {
        console.log('✅ All storage adapters reinitialized successfully after logout');
      } else {
        console.warn('⚠️ Some storage adapters failed to reinitialize after logout');
      }
    });
    
    console.log('✅ Application reinitialized after logout with data persistence intact');
  } catch (error) {
    console.error('❌ Error reinitializing application after logout:', error);
    
    // Emergency recovery
    try {
      console.log('🚨 Attempting emergency recovery after logout...');
      // Force reload the application
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
    }
  }
}

/**
 * Add health check and validation methods to the window object for debugging
 */
export function exposeDebugMethods(): void {
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
