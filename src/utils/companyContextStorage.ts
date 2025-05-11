/**
 * Company context storage integration with PermanentStorage
 * Ensures company data is never lost between sessions
 */

import permanentStorage, { StorageNamespace } from './permanentStorage';
import { CompanyDetails } from '@/contexts/CompanyContext';

// Default company details to use if storage is empty
export const defaultCompanyDetails: CompanyDetails = {
  name: "Your Company", 
  registrationNumber: "",
  vatNumber: "",
  contactEmail: "",
  contactPhone: "",
  address: ""
};

/**
 * Get company details with multi-layer fallback system
 * Tries multiple storage methods and returns default if all fail
 */
export const getCompanyDetails = async (): Promise<CompanyDetails> => {
  try {
    // Initialize permanent storage if needed
    if (!permanentStorage.isReady()) {
      await permanentStorage.waitUntilReady(2000);
    }
    
    // Try to get from permanent storage
    const storedData = await permanentStorage.loadData<CompanyDetails>(StorageNamespace.COMPANY);
    
    if (storedData && storedData.name) {
      console.log('Company data loaded from permanent storage:', storedData.name);
      return storedData;
    }
    
    // Legacy data loading - try old localStorage key
    try {
      const legacyData = localStorage.getItem('companyDetails');
      if (legacyData) {
        const parsedData = JSON.parse(legacyData) as CompanyDetails;
        if (parsedData && parsedData.name) {
          console.log('Company data loaded from legacy storage:', parsedData.name);
          
          // Save to permanent storage for next time
          permanentStorage.saveData(StorageNamespace.COMPANY, parsedData);
          
          return parsedData;
        }
      }
    } catch (error) {
      console.warn('Error loading legacy company data:', error);
    }
    
    // Return default if nothing found
    return defaultCompanyDetails;
  } catch (error) {
    console.error('Error getting company details:', error);
    return defaultCompanyDetails;
  }
};

/**
 * Save company details with guaranteed persistence
 */
export const saveCompanyDetails = async (companyDetails: CompanyDetails): Promise<boolean> => {
  try {
    // Initialize permanent storage if needed
    if (!permanentStorage.isReady()) {
      await permanentStorage.waitUntilReady(2000);
    }
    
    // Legacy format save - to maintain compatibility
    localStorage.setItem('companyDetails', JSON.stringify(companyDetails));
    
    // Save to our bombproof storage system
    const result = await permanentStorage.saveData(StorageNamespace.COMPANY, companyDetails);
    
    if (result) {
      console.log('Company data saved to permanent storage:', companyDetails.name);
    } else {
      console.error('Failed to save company data to permanent storage');
    }
    
    return result;
  } catch (error) {
    console.error('Error saving company details:', error);
    
    // Legacy emergency backup - if new system fails
    try {
      localStorage.setItem('companyDetails_emergency_backup', JSON.stringify(companyDetails));
    } catch {}
    
    return false;
  }
};

/**
 * Check if company details exist
 */
export const hasCompanyDetails = async (): Promise<boolean> => {
  try {
    // Initialize permanent storage if needed
    if (!permanentStorage.isReady()) {
      await permanentStorage.waitUntilReady(2000);
    }
    
    // Check permanent storage
    const storedData = await permanentStorage.loadData<CompanyDetails>(StorageNamespace.COMPANY);
    if (storedData && storedData.name) {
      return true;
    }
    
    // Check legacy storage
    const legacyData = localStorage.getItem('companyDetails');
    if (legacyData) {
      try {
        const parsedData = JSON.parse(legacyData) as CompanyDetails;
        return !!(parsedData && parsedData.name);
      } catch {}
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if company details exist:', error);
    return false;
  }
};
