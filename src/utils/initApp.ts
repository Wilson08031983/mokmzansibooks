
import { initializeClientDataPersistence, initializeClientData } from './clientDataPersistence';

/**
 * Initialize the application
 * This function is called at application startup
 */
export function initializeApp(): void {
  try {
    // Initialize client data persistence
    initializeClientDataPersistence();
    
    // Initialize client data from storage/backup
    initializeClientData();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);
  }
}

/**
 * Call this function to reinitialize the app after logout
 * to ensure data is still available
 */
export function reinitializeAfterLogout(): void {
  try {
    // Restore client data from backup if needed
    initializeClientData();
    
    console.log('Application reinitialized after logout');
  } catch (error) {
    console.error('Error reinitializing application after logout:', error);
  }
}
