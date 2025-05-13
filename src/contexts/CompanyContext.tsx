
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CompanyDetails } from '@/types/company';
import { useToast } from '@/hooks/use-toast';

// Define Company Context Types
interface CompanyContextProps {
  company: CompanyDetails;
  loading: boolean;
  error: string | null;
  updateCompany: (updatedCompany: Partial<CompanyDetails>) => Promise<void>;
  refreshCompany: () => Promise<void>;
}

// Create the context with a default empty value
const CompanyContext = createContext<CompanyContextProps>({
  company: {
    id: '',
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    registrationNumber: '',
    vatNumber: '',
    createdAt: '',
    updatedAt: '',
  },
  loading: true,
  error: null,
  updateCompany: async () => {},
  refreshCompany: async () => {},
});

// Define user types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

export interface UserPermissions {
  canViewCompany: boolean;
  canEditCompany: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canManageClients: boolean;
  canManageInvoices: boolean;
  canViewFinancials: boolean;
}

// Company Provider Component
export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyDetails>({
    id: '',
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    registrationNumber: '',
    vatNumber: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Function to load company data
  const loadCompanyData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would fetch from an API or storage
      // For now, we'll just use mock data
      const mockCompany: CompanyDetails = {
        id: 'company-1',
        name: 'MokMzansi Corp',
        address: '123 Business Street',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
        phone: '021-555-1234',
        email: 'info@mokmzansi.co.za',
        contactEmail: 'contact@mokmzansi.co.za',
        contactPhone: '021-555-5678',
        website: 'www.mokmzansi.co.za',
        registrationNumber: '2022/123456/07',
        vatNumber: '4230156789',
        primaryColor: '#3b82f6',
        secondaryColor: '#93c5fd',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setCompany(mockCompany);
    } catch (err) {
      console.error('Error loading company data:', err);
      setError('Failed to load company data');
      toast({
        title: 'Error',
        description: 'Failed to load company data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Load company data on mount
  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);
  
  // Function to update company details
  const updateCompany = async (updatedCompany: Partial<CompanyDetails>): Promise<void> => {
    try {
      setLoading(true);
      // In a real app, this would make an API call to update the company
      
      // Update local state
      setCompany(current => ({
        ...current,
        ...updatedCompany,
        updatedAt: new Date().toISOString(),
      }));
      
      toast({
        title: 'Success',
        description: 'Company details updated successfully',
      });
    } catch (err) {
      console.error('Error updating company:', err);
      setError('Failed to update company details');
      toast({
        title: 'Error',
        description: 'Failed to update company details',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to refresh company data
  const refreshCompany = async (): Promise<void> => {
    await loadCompanyData();
  };

  // User management functions that would be implemented in a real app
  const saveCompanyDetails = async (details: CompanyDetails) => {
    await updateCompany(details);
  };
  
  const users: User[] = [];
  const addUser = async () => {};
  const updateUser = async () => {};
  const removeUser = async () => {};
  const toggleUserStatus = async () => {};
  const auditLog = [];
  
  return (
    <CompanyContext.Provider
      value={{
        company,
        loading,
        error,
        updateCompany,
        refreshCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
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
