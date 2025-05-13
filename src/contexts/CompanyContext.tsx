
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { CompanyDetails, User, AuditLogEntry, CompanySettings } from '@/types/company';
import { safeJsonStringify } from '@/utils/errorHandling';

// Initial company details
const defaultCompanyDetails: CompanyDetails = {
  name: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  country: 'South Africa',
};

// Context interface
export interface CompanyContextProps {
  company: CompanyDetails;
  updateCompany: (updatedDetails: Partial<CompanyDetails>) => void;
  loading: boolean;
  error: string | null;
}

// Create the context
const CompanyContext = createContext<CompanyContextProps>({
  company: defaultCompanyDetails,
  updateCompany: () => {},
  loading: false,
  error: null,
});

// Provider component
export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyDetails>(defaultCompanyDetails);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load company details from storage on mount
  useEffect(() => {
    try {
      setLoading(true);
      const storedCompany = localStorage.getItem('company_details');
      if (storedCompany) {
        const parsedCompany = JSON.parse(storedCompany) as CompanyDetails;
        setCompany(parsedCompany);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading company details:', err);
      setError('Failed to load company details');
      setLoading(false);
    }
  }, []);

  // Update company details
  const updateCompany = (updatedDetails: Partial<CompanyDetails>) => {
    try {
      const updatedCompany = {
        ...company,
        ...updatedDetails,
        updatedAt: new Date().toISOString()
      };
      setCompany(updatedCompany);
      
      // Save to local storage
      localStorage.setItem('company_details', safeJsonStringify(updatedCompany));
    } catch (err) {
      console.error('Error updating company details:', err);
      setError('Failed to update company details');
    }
  };

  return (
    <CompanyContext.Provider 
      value={{ 
        company, 
        updateCompany,
        loading,
        error
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

// Custom hook for using the company context
export const useCompany = () => useContext(CompanyContext);

export default CompanyContext;
