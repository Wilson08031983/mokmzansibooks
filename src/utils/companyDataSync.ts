/**
 * Utility for ensuring company data synchronization between Invoice and Quote forms
 */

import { CompanyDetails } from "@/contexts/CompanyContext";

// Define a simplified company data structure used in forms
export interface SimplifiedCompanyData {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo?: string | null;
  stamp?: string | null;
  signature?: string | null;
}

// Key for storing the shared company data in localStorage
const SHARED_COMPANY_DATA_KEY = 'shared_company_data';

// Special key for forced immediate update (must be unique)
const COMPANY_DATA_FORCE_UPDATE_KEY = 'FORCE_COMPANY_DATA_UPDATE_NOW';

// Simple flag to ensure both forms are using the most updated data
const COMPANY_DATA_UPDATE_FLAG = 'company_data_updated_at';

/**
 * Stores company data in a shared location to be accessed by both forms
 * 
 * @param companyData The company data to store
 */
export const storeSharedCompanyData = (companyData: any): void => {
  try {
    // Standardize the company data format for both forms
    const standardizedData: SimplifiedCompanyData = {
      name: companyData.name || '',
      address: companyData.address || '',
      email: companyData.contactEmail || companyData.email || '',
      phone: companyData.contactPhone || companyData.phone || '',
      logo: companyData.logo || null,
      stamp: companyData.stamp || null,
      signature: companyData.signature || null
    };
    
    localStorage.setItem(SHARED_COMPANY_DATA_KEY, JSON.stringify(standardizedData));
    // Update timestamp to flag that data has changed
    localStorage.setItem(COMPANY_DATA_UPDATE_FLAG, Date.now().toString());
    
    console.log('Company data stored for sync:', standardizedData);
  } catch (error) {
    console.error('Failed to store shared company data:', error);
  }
};

/**
 * Retrieves the shared company data for use in forms
 * 
 * @returns The shared company data object or null if not found
 */
export const getSharedCompanyData = (): SimplifiedCompanyData | null => {
  try {
    const data = localStorage.getItem(SHARED_COMPANY_DATA_KEY);
    if (!data) return null;
    
    const parsedData = JSON.parse(data) as SimplifiedCompanyData;
    console.log('Retrieved shared company data:', parsedData);
    return parsedData;
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
    return timestamp ? parseInt(timestamp) : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Updates the company context and ensures it's stored in shared location
 * This should be called whenever company details are updated
 * 
 * @param companyDetails The updated company details
 */
export const syncCompanyData = (companyDetails: CompanyDetails | any): void => {
  try {
    // Format address for display
    const formattedAddress = [
      companyDetails.address,
      companyDetails.addressLine2,
      companyDetails.city,
      companyDetails.province,
      companyDetails.postalCode
    ].filter(Boolean).join('\n');
    
    // First update the shared data storage
    storeSharedCompanyData(companyDetails);
    
    // Create standardized data for all components
    const standardizedData = {
      name: companyDetails.name || '',
      address: formattedAddress || companyDetails.address || '',
      email: companyDetails.contactEmail || companyDetails.email || '',
      phone: companyDetails.contactPhone || companyDetails.phone || '',
      logo: companyDetails.logo || null,
      stamp: companyDetails.stamp || null,
      signature: companyDetails.signature || null,
      lastUpdated: new Date().toISOString()
    };
    
    // Then force a direct sync by updating a special key
    localStorage.setItem(
      COMPANY_DATA_FORCE_UPDATE_KEY, 
      JSON.stringify({
        timestamp: Date.now(),
        data: standardizedData
      })
    );
    
    // Broadcast via localStorage event for cross-tab synchronization
    window.dispatchEvent(new CustomEvent('company-data-changed', {
      detail: standardizedData
    }));
    
    console.log('Company data sync triggered with immediate update');
  } catch (error) {
    console.error('Failed to sync company data:', error);
  }
};

/**
 * Gets the latest direct sync data - this is more immediate than the polling approach
 */
export const getDirectSyncData = (): SimplifiedCompanyData | null => {
  try {
    const data = localStorage.getItem('DIRECT_COMPANY_SYNC');
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return parsed.data as SimplifiedCompanyData;
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
export const setupCompanyDataSync = (getCompanyDetails: () => CompanyDetails): void => {
  // Initial sync
  syncCompanyData(getCompanyDetails());
  
  // We could set up more complex watchers here if needed
  // For now, we'll rely on explicit calls to syncCompanyData when company data changes
};
