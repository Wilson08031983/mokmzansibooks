
import { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useCompanySafeguards = () => {
  const { companyDetails } = useCompany();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [safeguardChecksComplete, setSafeguardChecksComplete] = useState(false);

  useEffect(() => {
    if (companyDetails !== undefined) {
      if (!companyDetails?.name || !companyDetails?.address) {
        // Add a notification using toast
        toast({
          title: 'Company details missing',
          description: 'Please complete your company profile to enable full functionality.',
          variant: 'warning'
        });
      }

      setSafeguardChecksComplete(true);
    }
  }, [companyDetails, navigate, toast]);

  return { safeguardChecksComplete };
};
