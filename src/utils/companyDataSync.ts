/**
 * Enhanced utility for ensuring company data synchronization across all pages
 * This ensures that company data is consistent between My Company page and all other components
 */

import { CompanyDetails } from "@/contexts/CompanyContext";

// Define a comprehensive company data structure used across all pages
export interface ComprehensiveCompanyData {
  name: string;
  address: string;
  email: string;
  phone: string;
  vatNumber?: string;
  registrationNumber?: string;
  website?: string;
  directorFirstName?: string;
  directorLastName?: string;
  logo?: string | null;
  stamp?: string | null;
  signature?: string | null;
  bankingDetails?: string;
  industry?: string;
  taxId?: string;
  notes?: string;
}

// Key for storing the shared company data in localStorage
const SHARED_COMPANY_DATA_KEY = 'shared_company_data';

// Special key for forced immediate update (must be unique)
const COMPANY_DATA_FORCE_UPDATE_KEY = 'COMPANY_DATA_FORCE_UPDATE_NOW';

// Simple flag to ensure all components are using the most updated data
const COMPANY_DATA_UPDATE_FLAG = 'company_data_updated_at';

// Key for storing company data in Supabase (via dataService)
const COMPANY_DATA_TYPE = 'company';

/**
 * Stores company data in a shared location to be accessed by all components
 * 
 * @param companyData The company data to store
 */
export const storeSharedCompanyData = (companyData: any): void => {
  try {
    // Create a comprehensive data object with all possible fields
    const comprehensiveData: ComprehensiveCompanyData = {
      name: companyData.name || '',
      address: companyData.address || '',
      email: companyData.contactEmail || companyData.email || '',
      phone: companyData.contactPhone || companyData.phone || '',
      vatNumber: companyData.vatNumber || '',
      registrationNumber: companyData.registrationNumber || '',
      website: companyData.website || '',
      directorFirstName: companyData.directorFirstName || '',
      directorLastName: companyData.directorLastName || '',
      logo: companyData.logo || null,
      stamp: companyData.stamp || null,
      signature: companyData.signature || null,
      bankingDetails: companyData.bankingDetails || '',
      industry: companyData.industry || '',
      taxId: companyData.taxId || '',
      notes: companyData.notes || ''
    };
    
    // Store in localStorage for immediate access
    localStorage.setItem(SHARED_COMPANY_DATA_KEY, JSON.stringify(comprehensiveData));
    
    // Update timestamp to flag that data has changed
    localStorage.setItem(COMPANY_DATA_UPDATE_FLAG, Date.now().toString());
    
    // Also store in a special key for forced updates
    localStorage.setItem(COMPANY_DATA_FORCE_UPDATE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: comprehensiveData
    }));
    
    // Dispatch a custom event for real-time updates
    const event = new CustomEvent('company-data-changed', { detail: comprehensiveData });
    window.dispatchEvent(event);
    
    console.log('Company data stored for sync:', comprehensiveData.name);
  } catch (error) {
    console.error('Failed to store shared company data:', error);
  }
};

/**
 * Retrieves the shared company data for use across all components
 * 
 * @returns The shared company data object or null if not found
 */
export const getSharedCompanyData = (): ComprehensiveCompanyData | null => {
  try {
    const storedData = localStorage.getItem(SHARED_COMPANY_DATA_KEY);
    if (!storedData) {
      return null;
    }
    
    return JSON.parse(storedData) as ComprehensiveCompanyData;
  } catch (error) {
    console.error('Failed to retrieve shared company data:', error);
    return null;
  }
};

/**
 * Gets the last update timestamp for company data
 * Used to determine if data needs refreshing
 */
export const getLastUpdateTimestamp = (): number => {
  try {
    const timestamp = localStorage.getItem(COMPANY_DATA_UPDATE_FLAG);
    if (!timestamp) {
      return 0;
    }
    
    return parseInt(timestamp, 10);
  } catch (error) {
    console.error('Failed to get company data update timestamp:', error);
    return 0;
  }
};

/**
 * Force update all components with the latest company data
 * This is useful when making changes in the My Company page
 */
export const forceCompanyDataUpdate = (): void => {
  const companyData = getSharedCompanyData();
  if (companyData) {
    const event = new CustomEvent('company-data-changed', {
      detail: companyData
    });
    window.dispatchEvent(event);
    console.log('Forced company data update dispatched');
  }
};

/**
 * Get company data from all possible sources and return the most up-to-date version
 */
export const getCompanyDataFromAllSources = async (): Promise<ComprehensiveCompanyData | null> => {
  // Try direct sync data first (most immediate)
  const directData = getDirectSyncData();
  if (directData && typeof directData === 'object' && 'name' in directData && directData.name) {
    return directData;
  }
  
  // Try shared data next
  const sharedData = getSharedCompanyData();
  if (sharedData && typeof sharedData === 'object' && 'name' in sharedData && sharedData.name) {
    return sharedData;
  }
  
  // Try Supabase
  try {
    const dataService = await import('@/services/supabase/dataService').then(module => module.default);
    if (dataService) {
      const supabaseData = await dataService.getAllData<ComprehensiveCompanyData>(COMPANY_DATA_TYPE);
      if (supabaseData && supabaseData.length > 0 && typeof supabaseData[0] === 'object' && supabaseData[0] !== null) {
        const companyData = supabaseData[0] as ComprehensiveCompanyData;
        if (companyData.name) {
          return companyData;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load company data from Supabase:', error);
  }
  
  // Try localStorage as last resort
  try {
    const localData = localStorage.getItem('companyDetails');
    if (localData) {
      return JSON.parse(localData) as ComprehensiveCompanyData;
    }
  } catch (error) {
    console.error('Failed to load company data from localStorage:', error);
  }
  
  return null;
};

/**
 * Updates the company data across all components and storage mechanisms
 * This should be called whenever company details are updated in the My Company page
 * 
 * @param companyDetails The updated company details
 */
export const syncCompanyData = async (companyDetails: CompanyDetails | any): Promise<void> => {
  try {
    if (!companyDetails) {
      console.warn('Cannot sync null or undefined company details');
      return;
    }
    
    // Store the data in shared location
    storeSharedCompanyData(companyDetails);
    
    // Create a timestamp for this update
    const timestamp = Date.now();
    
    // Store a special update record for force-refreshing
    localStorage.setItem(COMPANY_DATA_FORCE_UPDATE_KEY, JSON.stringify({
      timestamp,
      data: companyDetails
    }));
    
    // Try to update Supabase if available
    try {
      const dataService = await import('@/services/supabase/dataService').then(module => module.default);
      if (dataService) {
        dataService.saveData(COMPANY_DATA_TYPE, companyDetails, 'company-details')
          .then(() => console.log('Company data saved to Supabase'))
          .catch(err => console.error('Failed to save company data to Supabase:', err));
      }
    } catch (supabaseError) {
      console.warn('Supabase data service not available:', supabaseError);
    }
    
    // Dispatch an event for real-time listeners
    try {
      const event = new CustomEvent('company-data-changed', {
        detail: companyDetails
      });
      window.dispatchEvent(event);
      console.log('Company data change event dispatched');
    } catch (eventError) {
      console.error('Failed to dispatch company data change event:', eventError);
    }
    
    console.log('Company data synced successfully:', companyDetails.name);
  } catch (error) {
    console.error('Failed to sync company data:', error);
  }
};

/**
 * Gets the latest direct sync data - this is more immediate than the polling approach
 */
export const getDirectSyncData = (): ComprehensiveCompanyData | null => {
  try {
    const forcedUpdateData = localStorage.getItem(COMPANY_DATA_FORCE_UPDATE_KEY);
    if (!forcedUpdateData) {
      return null;
    }
    
    const parsedData = JSON.parse(forcedUpdateData);
    return parsedData.data as ComprehensiveCompanyData;
  } catch (error) {
    console.error('Failed to get direct sync data:', error);
    return null;
  }
};

/**
 * Setup a watcher for company data changes and update shared storage
 * This should be called once during application initialization
 * 
 * @param getCompanyDetails Function to retrieve current company details
 */
export const setupCompanyDataSync = async (getCompanyDetails: () => CompanyDetails): Promise<void> => {
  // Initial sync
  const companyDetails = getCompanyDetails();
  if (companyDetails) {
    await syncCompanyData(companyDetails);
  }
  
  // Try to load from Supabase if available
  try {
    const dataService = await import('@/services/supabase/dataService').then(module => module.default);
    if (dataService) {
      const supabaseData = await dataService.getAllData<ComprehensiveCompanyData>(COMPANY_DATA_TYPE);
      if (supabaseData && supabaseData.length > 0 && typeof supabaseData[0] === 'object' && supabaseData[0] !== null) {
        // Only update if we have data and it's different from what we have
        const currentData = getSharedCompanyData();
        const companyData = supabaseData[0] as ComprehensiveCompanyData;
        
        if (companyData.name && (!currentData || 
            (typeof currentData === 'object' && 'name' in currentData && currentData.name !== companyData.name))) {
          await syncCompanyData(companyData);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load company data from Supabase:', error);
  }
  
  // Set up listeners for changes from other tabs/windows
  window.addEventListener('storage', (e) => {
    if (e.key === SHARED_COMPANY_DATA_KEY || e.key === COMPANY_DATA_FORCE_UPDATE_KEY) {
      console.log('Company data changed in another tab/window');
      const event = new CustomEvent('company-data-changed', {
        detail: getSharedCompanyData()
      });
      window.dispatchEvent(event);
    }
  });
};
