/**
 * This module provides a direct forcing mechanism for company data synchronization
 * between Invoice and Quote forms. It uses a global shared object for immediate updates.
 */

import { SimplifiedCompanyData } from "./companyDataSync";

// Global event name for company data updates
export const COMPANY_DATA_CHANGE_EVENT = 'company-data-change';

/**
 * Creates a custom event to broadcast company data changes throughout the application
 */
export const broadcastCompanyUpdate = (companyData: SimplifiedCompanyData): void => {
  try {
    // Save to a consistent location
    localStorage.setItem('FORCED_COMPANY_DATA', JSON.stringify({
      timestamp: Date.now(),
      data: companyData
    }));
    
    // Create and dispatch custom event for immediate notification
    const event = new CustomEvent(COMPANY_DATA_CHANGE_EVENT, { 
      detail: { companyData }
    });
    
    console.log("Broadcasting company update event:", companyData);
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Error broadcasting company update:", error);
  }
};

/**
 * Forces all forms to reload the latest company data
 * Call this whenever company data needs to be synchronized
 */
export const forceCompanyDataSync = (companyData: any): void => {
  try {
    // Create standardized data format
    const standardizedData: SimplifiedCompanyData = {
      name: companyData.name || '',
      address: companyData.address || '',
      email: companyData.contactEmail || companyData.email || '',
      phone: companyData.contactPhone || companyData.phone || '',
      logo: companyData.logo || null,
      stamp: companyData.stamp || null,
      signature: companyData.signature || null
    };
    
    // Broadcast the update
    broadcastCompanyUpdate(standardizedData);
    
    // Directly inject into existing forms if possible
    if (window.MokMzansiGlobal) {
      window.MokMzansiGlobal.latestCompanyData = standardizedData;
      console.log("Company data set in global state:", standardizedData);
    } else {
      // Initialize global state if it doesn't exist
      window.MokMzansiGlobal = {
        latestCompanyData: standardizedData
      };
      console.log("Global state initialized with company data");
    }
  } catch (error) {
    console.error("Error forcing company data sync:", error);
  }
};

/**
 * Gets the latest company data from all possible sources
 */
export const getLatestCompanyData = (): SimplifiedCompanyData | null => {
  try {
    // First check global variable (fastest)
    if (window.MokMzansiGlobal && window.MokMzansiGlobal.latestCompanyData) {
      return window.MokMzansiGlobal.latestCompanyData;
    }
    
    // Then check localStorage
    const storedData = localStorage.getItem('FORCED_COMPANY_DATA');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      return parsed.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting latest company data:", error);
    return null;
  }
};
