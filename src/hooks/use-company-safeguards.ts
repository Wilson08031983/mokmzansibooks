
import { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationsContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  actionLabel?: string;
  action?: () => void;
  timestamp: number;
  read: boolean;
}

export const useCompanySafeguards = () => {
  const { companyDetails } = useCompany();
  const navigate = useNavigate();
  const { add: addNotification } = useNotifications();
  const [safeguardChecksComplete, setSafeguardChecksComplete] = useState(false);

  useEffect(() => {
    if (companyDetails !== undefined) {
      if (!companyDetails?.name || !companyDetails?.address) {
        // Add a notification
        addNotification({
          title: 'Company details missing',
          message: 'Please complete your company profile to enable full functionality.',
          type: 'warning',
          actionLabel: 'Update Profile',
          action: () => navigate('/settings/company')
        });
      }

      setSafeguardChecksComplete(true);
    }
  }, [companyDetails, navigate, addNotification]);

  return { safeguardChecksComplete };
};
