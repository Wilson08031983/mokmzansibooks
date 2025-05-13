
/**
 * Ensures the application's local storage is properly initialized with the correct version
 * This function provides robust handling of data migrations as the application evolves
 * @param appName - The name of the application 
 * @param currentVersion - The current version of the application
 * @returns A promise that resolves to true if initialization is successful, false otherwise
 */
export async function ensureInitialized(appName: string, currentVersion: string): Promise<boolean> {
  try {
    // Get stored version information
    const storedVersionInfo = localStorage.getItem(`${appName}_version`);
    
    if (!storedVersionInfo) {
      // First time initialization
      console.log(`Initializing storage for ${appName} version ${currentVersion}`);
      localStorage.setItem(`${appName}_version`, currentVersion);
      localStorage.setItem(`${appName}_initialized`, 'true');
      return true;
    }
    
    // Check if version has changed and migrations are needed
    if (storedVersionInfo !== currentVersion) {
      console.log(`Upgrading storage from ${storedVersionInfo} to ${currentVersion}`);
      
      // Perform migrations here if needed based on version changes
      // Example: if (storedVersionInfo === '1.0.0' && currentVersion === '1.1.0') { ... }
      
      // Update stored version
      localStorage.setItem(`${appName}_version`, currentVersion);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
}

// Export a default version as well for compatibility
export default ensureInitialized;
