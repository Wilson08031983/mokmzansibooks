
import React, { useState, useEffect } from 'react';
import { CompanyDetails } from '@/contexts/CompanyContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Mock dataService temporarily
const dataService = {
  fetchCompanyDetails: async () => {
    return null;
  }
};

interface CompanyDisplaySafeProps {
  companyDetails?: CompanyDetails;
  company?: any; // Added to support backward compatibility with existing components
}

/**
 * A safe version of CompanyDisplay that handles missing data gracefully
 */
const CompanyDisplaySafe: React.FC<CompanyDisplaySafeProps> = ({
  companyDetails,
  company,
}) => {
  // Use either companyDetails or company prop, for backward compatibility
  const companyData = companyDetails || company;
  
  const [companyState, setCompanyState] = useState<CompanyDetails | null>(companyData || null);
  const [isLoading, setIsLoading] = useState<boolean>(!companyData);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // If no company details are provided, try to fetch them
  useEffect(() => {
    if (companyData) {
      setCompanyState(companyData);
      setIsLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const data = await dataService.fetchCompanyDetails();
        if (data) {
          setCompanyState(data);
        } else {
          // Use locally stored company data as fallback
          const localData = localStorage.getItem('companyDetails');
          if (localData) {
            setCompanyState(JSON.parse(localData));
          } else {
            setError('No company details found');
          }
        }
      } catch (err) {
        console.error('Error fetching company details:', err);
        setError('Failed to load company details');
        toast({
          title: 'Error',
          description: 'Failed to load company information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [companyData, toast]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    );
  }

  if (error || !companyState) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-800">
        <p className="font-medium">Company Information Not Available</p>
        <p className="text-sm mt-1">{error || 'Please add your company details in settings.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-lg">{companyState.name}</h3>
      {companyState.address && (
        <p className="text-sm text-gray-600">{companyState.address}</p>
      )}
      {companyState.addressLine2 && (
        <p className="text-sm text-gray-600">{companyState.addressLine2}</p>
      )}
      {companyState.city && companyState.province && companyState.postalCode && (
        <p className="text-sm text-gray-600">
          {companyState.city}, {companyState.province}, {companyState.postalCode}
        </p>
      )}
      {companyState.contactEmail && (
        <p className="text-sm text-gray-600">Email: {companyState.contactEmail}</p>
      )}
      {companyState.contactPhone && (
        <p className="text-sm text-gray-600">Phone: {companyState.contactPhone}</p>
      )}
      {companyState.registrationNumber && (
        <p className="text-sm text-gray-600">Reg: {companyState.registrationNumber}</p>
      )}
      {companyState.vatNumber && (
        <p className="text-sm text-gray-600">VAT: {companyState.vatNumber}</p>
      )}
    </div>
  );
};

export default CompanyDisplaySafe;
