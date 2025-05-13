import React, { useState, useEffect } from 'react';
import { CompanyDetails } from '@/contexts/CompanyContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import robustStorageMigrator from '@/utils/robustStorageMigrator';
import indexedDBAvailabilityCheck from '@/utils/indexedDBAvailabilityCheck';

interface CompanyDisplayProps {
  companyDetails?: CompanyDetails;
  minimal?: boolean;
}

/**
 * Component to display company information in invoices and quotes
 */
const CompanyDisplay: React.FC<CompanyDisplayProps> = ({
  companyDetails,
  minimal = false,
}) => {
  const [company, setCompany] = useState<CompanyDetails | null>(companyDetails || null);
  const [isLoading, setIsLoading] = useState<boolean>(!companyDetails);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for and load company details from various sources
  useEffect(() => {
    if (companyDetails) {
      setCompany(companyDetails);
      setIsLoading(false);
      return;
    }

    const loadCompanyDetails = async () => {
      try {
        setIsLoading(true);
        
        // Check if IndexedDB is available
        const indexedDBAvailable = await indexedDBAvailabilityCheck.checkIndexedDBAvailability();
        
        if (!indexedDBAvailable) {
          console.warn('IndexedDB not available, falling back to localStorage');
        }
        
        // Try to load from localStorage with fallbacks
        const result = robustStorageMigrator.consolidateStorage(
          ['companyDetails', 'company', 'businessDetails', 'organization'],
          'companyDetails'
        );
        
        if (result.success && result.result) {
          setCompany(result.result);
        } else {
          setError('No company details found');
        }
      } catch (err) {
        console.error('Error loading company details:', err);
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

    loadCompanyDetails();
  }, [companyDetails, toast]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        {!minimal && <Skeleton className="h-4 w-1/4" />}
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

  // Basic display with just essential info
  if (minimal) {
    return (
      <div className="text-sm">
        <h3 className="font-semibold">{company.name}</h3>
        {company.contactEmail && (
          <p className="text-gray-600">{company.contactEmail}</p>
        )}
        {company.contactPhone && (
          <p className="text-gray-600">{company.contactPhone}</p>
        )}
      </div>
    );
  }

  // Full display with all company details
  return (
    <div className="space-y-1">
      <h3 className="font-bold text-lg">{company.name}</h3>
      
      {/* Contact information */}
      <div className="space-y-0.5">
        {company.address && (
          <p className="text-sm">{company.address}</p>
        )}
        {company.addressLine2 && (
          <p className="text-sm">{company.addressLine2}</p>
        )}
        {company.city && company.province && company.postalCode && (
          <p className="text-sm">
            {company.city}, {company.province}, {company.postalCode}
          </p>
        )}
        {company.contactEmail && (
          <p className="text-sm">Email: {company.contactEmail}</p>
        )}
        {company.contactPhone && (
          <p className="text-sm">Phone: {company.contactPhone}</p>
        )}
        {company.website && (
          <p className="text-sm">Website: {company.website}</p>
        )}
      </div>
      
      {/* Registration information */}
      <div className="space-y-0.5 pt-1">
        {company.registrationNumber && (
          <p className="text-xs text-gray-600">Registration No: {company.registrationNumber}</p>
        )}
        {company.vatNumber && (
          <p className="text-xs text-gray-600">VAT No: {company.vatNumber}</p>
        )}
      </div>
    </div>
  );
};

export default CompanyDisplay;
