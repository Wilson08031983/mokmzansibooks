
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CompanyDetails } from '@/types/company';

// This represents the shape of the company context
export interface CompanyContextProps {
  // Company details state
  companyDetails: CompanyDetails;
  setCompanyDetails: React.Dispatch<React.SetStateAction<CompanyDetails>>;
  loading: boolean;
  error: string | null;
  
  // Company-specific actions
  updateCompany: (details: CompanyDetails) => Promise<boolean>;
  company: CompanyDetails;
}

// Default company details
export const defaultCompanyDetails: CompanyDetails = {
  name: "My Company",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  phone: "",
  email: "",
  registrationNumber: "",
  vatNumber: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Create the context with an undefined default value
const CompanyContext = createContext<CompanyContextProps | undefined>(undefined);

// Provider component to wrap parts of the app that need the company context
export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for company details
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(defaultCompanyDetails);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load company details from localStorage on component mount
  useEffect(() => {
    const loadCompanyDetails = () => {
      try {
        const savedCompanyDetails = localStorage.getItem('companyDetails');
        
        if (savedCompanyDetails) {
          setCompanyDetails(JSON.parse(savedCompanyDetails));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading company details:', err);
        setError('Failed to load company details');
        setLoading(false);
      }
    };
    
    loadCompanyDetails();
  }, []);

  // Save company details to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('companyDetails', JSON.stringify(companyDetails));
      } catch (err) {
        console.error('Error saving company details:', err);
        setError('Failed to save company details');
      }
    }
  }, [companyDetails, loading]);

  // Function to update company details
  const updateCompany = async (details: CompanyDetails): Promise<boolean> => {
    try {
      setCompanyDetails(details);
      return true;
    } catch (err) {
      console.error('Error updating company:', err);
      setError('Failed to update company');
      return false;
    }
  };

  // Context value
  const value: CompanyContextProps = {
    companyDetails,
    setCompanyDetails,
    loading,
    error,
    updateCompany,
    company: companyDetails // Alias for backward compatibility
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};

// Custom hook to use the company context
export const useCompany = (): CompanyContextProps => {
  const context = useContext(CompanyContext);
  
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  
  return context;
};

export default CompanyContext;
