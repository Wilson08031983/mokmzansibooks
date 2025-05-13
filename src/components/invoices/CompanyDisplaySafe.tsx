
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
}

/**
 * A safe version of CompanyDisplay that handles missing data gracefully
 */
const CompanyDisplaySafe: React.FC<CompanyDisplaySafeProps> = ({
  companyDetails,
}) => {
  const [company, setCompany] = useState<CompanyDetails | null>(companyDetails || null);
  const [isLoading, setIsLoading] = useState<boolean>(!companyDetails);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // If no company details are provided, try to fetch them
  useEffect(() => {
    if (companyDetails) {
      setCompany(companyDetails);
      setIsLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const data = await dataService.fetchCompanyDetails();
        if (data) {
          setCompany(data);
        } else {
          // Use locally stored company data as fallback
          const localData = localStorage.getItem('companyDetails');
          if (localData) {
            setCompany(JSON.parse(localData));
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
  }, [companyDetails, toast]);

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

  if (error || !company) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-800">
        <p className="font-medium">Company Information Not Available</p>
        <p className="text-sm mt-1">{error || 'Please add your company details in settings.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-lg">{company.name}</h3>
      {company.address && (
        <p className="text-sm text-gray-600">{company.address}</p>
      )}
      {company.addressLine2 && (
        <p className="text-sm text-gray-600">{company.addressLine2}</p>
      )}
      {company.city && company.province && company.postalCode && (
        <p className="text-sm text-gray-600">
          {company.city}, {company.province}, {company.postalCode}
        </p>
      )}
      {company.contactEmail && (
        <p className="text-sm text-gray-600">Email: {company.contactEmail}</p>
      )}
      {company.contactPhone && (
        <p className="text-sm text-gray-600">Phone: {company.contactPhone}</p>
      )}
      {company.registrationNumber && (
        <p className="text-sm text-gray-600">Reg: {company.registrationNumber}</p>
      )}
      {company.vatNumber && (
        <p className="text-sm text-gray-600">VAT: {company.vatNumber}</p>
      )}
    </div>
  );
};

export default CompanyDisplaySafe;
