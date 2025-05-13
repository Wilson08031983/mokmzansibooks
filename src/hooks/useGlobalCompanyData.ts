
/**
 * Hook for accessing company data throughout the application
 * This provides a consistent way to access company information
 * from any component without direct dependency on the CompanyContext
 */

import { useContext, useEffect, useState } from 'react';
import { CompanyDetails } from '@/types/company';
import { safeJsonParse } from '@/utils/errorHandling';
import { validateCompanyData } from '@/utils/companyDataSafeguards';

// Default company details structure
const defaultCompanyDetails: Partial<CompanyDetails> = {
  name: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
};

/**
 * Hook to access company data throughout the application
 * Returns read-only company data that persists across the application
 */
export const useGlobalCompanyData = () => {
  const [companyData, setCompanyData] = useState<Partial<CompanyDetails>>(defaultCompanyDetails);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasData, setHasData] = useState<boolean>(false);

  useEffect(() => {
    try {
      setIsLoading(true);
      
      // Attempt to load from localStorage - try multiple sources
      const sources = [
        localStorage.getItem('companyDetails'),
        localStorage.getItem('publicCompanyDetails')
      ];
      
      // Use the first valid source
      for (const source of sources) {
        if (!source) continue;
        
        const parsedData = safeJsonParse(source, defaultCompanyDetails);
        if (validateCompanyData(parsedData)) {
          setCompanyData(parsedData);
          setHasData(true);
          break;
        }
      }
      
    } catch (error) {
      console.error('Error loading global company data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up a listener for changes to company data
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'companyDetails' || event.key === 'publicCompanyDetails') {
        if (event.newValue) {
          try {
            const newData = safeJsonParse(event.newValue, defaultCompanyDetails);
            if (validateCompanyData(newData)) {
              setCompanyData(newData);
              setHasData(true);
            }
          } catch (error) {
            console.error('Error parsing updated company data:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    companyData,
    isLoading,
    hasData,
    // Read-only properties for commonly used fields
    companyName: companyData.name || '',
    companyEmail: companyData.contactEmail || companyData.email || '',
    companyPhone: companyData.contactPhone || companyData.phone || '',
    companyAddress: companyData.address || '',
    companyLogo: companyData.logo || null,
  };
};

export default useGlobalCompanyData;
