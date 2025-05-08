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
  const { companyDetails, loading } = useCompany();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const [safeguardChecksComplete, setSafeguardChecksComplete] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!companyDetails?.name || !companyDetails?.address || !companyDetails?.email || !companyDetails?.phone) {
        // Add a notification
        notifications.add({
          title: 'Company details missing',
          message: 'Please complete your company profile to enable full functionality.',
          type: 'warning',
          actionLabel: 'Update Profile',
          action: () => navigate('/settings/company'),
          timestamp: Date.now(),
          read: false,
          id: ''
        });
      }

      setSafeguardChecksComplete(true);
    }
  }, [companyDetails, loading, navigate, notifications]);

  return { safeguardChecksComplete };
};
