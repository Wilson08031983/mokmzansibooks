
/**
 * Utility for initializing the application
 */

/**
 * Initialize the application
 * @returns Promise that resolves when initialization is complete
 */
export const initializeApp = async (): Promise<void> => {
  try {
    console.log('Initializing application...');
    
    // Additional initialization logic can be added here
    
    console.log('Application initialization complete');
  } catch (error) {
    console.error('Error initializing application:', error);
  }
};

/**
 * Reinitialize after logout to ensure data is still available
 * @returns Promise that resolves when reinitialization is complete
 */
export const reinitializeAfterLogout = async (): Promise<void> => {
  try {
    console.log('Reinitializing application after logout...');
    
    // Additional reinitialization logic can be added here
    
    console.log('Application reinitialization complete');
  } catch (error) {
    console.error('Error reinitializing application:', error);
  }
};

/**
 * Debug helpers for development purposes
 */
export const debugHelpers = {
  clearLocalStorage: () => {
    localStorage.clear();
    console.log('LocalStorage cleared');
  },
  
  clearSessionStorage: () => {
    sessionStorage.clear();
    console.log('SessionStorage cleared');
  },
  
  clearAllStorage: () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('All storage cleared');
  },
  
  logAllStorage: () => {
    console.log('LocalStorage:', { ...localStorage });
    console.log('SessionStorage:', { ...sessionStorage });
  }
};

export default {
  initializeApp,
  reinitializeAfterLogout,
  debugHelpers
};
