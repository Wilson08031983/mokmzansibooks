
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
