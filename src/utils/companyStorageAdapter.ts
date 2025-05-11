/**
 * Company Storage Adapter
 * 
 * This adapter connects the SuperPersistentStorage system to the company information
 * module, ensuring data never gets lost between sessions.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';
import { CompanyDetails } from '@/contexts/CompanyContext';

// Default company details to use if no saved data is found
export const defaultCompanyDetails: CompanyDetails = {
  id: "",
  name: "",
  registrationNumber: "",
  vatNumber: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  websiteUrl: '',
  logo: null,
  stamp: null,
  signature: null,
  taxRegistrationNumber: '',
  csdRegistrationNumber: '',
  directorFirstName: '',
  directorLastName: ''
};

/**
 * Load company details with all available fallback mechanisms
 */
export const loadCompanyDetails = async (): Promise<CompanyDetails> => {
  try {
    console.log('CompanyStorageAdapter: Loading company details...');
    
    // First try our super persistent storage
    const data = await superPersistentStorage.load<CompanyDetails>(DataCategory.COMPANY);
    
    if (data && data.name) {
      console.log('CompanyStorageAdapter: Loaded company details from super persistent storage');
      
      // Also migrate to legacy storage to ensure compatibility with existing code
      localStorage.setItem('companyDetails', JSON.stringify(data));
      
      // Return the loaded data
      return data;
    }
    
    // If super persistent storage failed, try legacy storage
    const legacyData = localStorage.getItem('companyDetails');
    if (legacyData) {
      try {
        const parsedData = JSON.parse(legacyData) as CompanyDetails;
        
        if (parsedData && parsedData.name) {
          console.log('CompanyStorageAdapter: Loaded company details from legacy storage');
          
          // Migrate to super persistent storage for future use
          await superPersistentStorage.save(DataCategory.COMPANY, parsedData);
          
          return parsedData;
        }
      } catch (error) {
        console.error('CompanyStorageAdapter: Error parsing legacy company data', error);
      }
    }
    
    // If all else fails, return default
    console.log('CompanyStorageAdapter: No company details found, using defaults');
    return { ...defaultCompanyDetails };
  } catch (error) {
    console.error('CompanyStorageAdapter: Error loading company details', error);
    return { ...defaultCompanyDetails };
  }
};

/**
 * Save company details with super persistence
 */
export const saveCompanyDetails = async (companyDetails: CompanyDetails): Promise<boolean> => {
  try {
    console.log('CompanyStorageAdapter: Saving company details...');
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.COMPANY, companyDetails);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('companyDetails', JSON.stringify(companyDetails));
    
    // Save partial data for public display components to use
    const publicData = {
      name: companyDetails.name,
      contactEmail: companyDetails.contactEmail,
      contactPhone: companyDetails.contactPhone,
      address: companyDetails.address,
      addressLine2: companyDetails.addressLine2,
      city: companyDetails.city,
      province: companyDetails.province,
      postalCode: companyDetails.postalCode,
      websiteUrl: companyDetails.websiteUrl
    };
    
    localStorage.setItem('publicCompanyDetails', JSON.stringify(publicData));
    
    if (success) {
      console.log('CompanyStorageAdapter: Company details saved successfully');
    } else {
      console.warn('CompanyStorageAdapter: Some storage mechanisms failed');
    }
    
    return success;
  } catch (error) {
    console.error('CompanyStorageAdapter: Error saving company details', error);
    
    // Fall back to legacy storage when super persistent fails
    try {
      localStorage.setItem('companyDetails', JSON.stringify(companyDetails));
      localStorage.setItem('companyDetails_emergency_backup', JSON.stringify(companyDetails));
    } catch (fallbackError) {
      console.error('CompanyStorageAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};

/**
 * Check if company details exist in storage
 */
export const initializeCompanyStorage = async (): Promise<boolean> => {
  try {
    console.log('Initializing company storage adapter...');
    
    // Check if company details exist
    const hasDetails = await hasCompanyDetails();
    
    if (hasDetails) {
      // Pre-load company details to ensure they're available
      await loadCompanyDetails();
      console.log('Company details loaded successfully');
    } else {
      console.log('No existing company details found');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing company storage:', error);
    return false;
  }
};

export const hasCompanyDetails = async (): Promise<boolean> => {
  try {
    // Check super persistent storage first
    const data = await superPersistentStorage.load<CompanyDetails>(DataCategory.COMPANY);
    if (data && data.name) {
      return true;
    }
    
    // Check legacy storage
    const legacyData = localStorage.getItem('companyDetails');
    if (legacyData) {
      try {
        const parsedData = JSON.parse(legacyData) as CompanyDetails;
        return !!(parsedData && parsedData.name);
      } catch (error) {
        console.warn('CompanyStorageAdapter: Error parsing legacy company data', error);
      }
    }
    
    return false;
  } catch (error) {
    console.error('CompanyStorageAdapter: Error checking company details', error);
    return false;
  }
};
