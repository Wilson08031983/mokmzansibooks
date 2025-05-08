import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// This component handles redirects from incorrect accounting routes to the correct ones
const AccountingRedirects = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Map of incorrect routes to their correct counterparts
      const redirectMap: Record<string, string> = {
        '/accounting/transactions': '/dashboard/accounting/transactions',
        '/accounting/reports': '/dashboard/accounting/reports',
        '/accounting/chart-of-accounts': '/dashboard/accounting/chart-of-accounts',
        '/accounting/bank-reconciliation': '/dashboard/accounting/bank-reconciliation',
        '/accounting/journal-entries': '/dashboard/accounting/journal-entries',
        '/accounting/test': '/dashboard/accounting/test'
      };

      // Check if current path needs redirection
      const currentPath = location.pathname;
      
      // Only redirect if it's an exact match (not a child route)
      if (redirectMap[currentPath]) {
        console.log(`Redirecting from ${currentPath} to ${redirectMap[currentPath]}`);
        navigate(redirectMap[currentPath], { replace: true });
      }
    } catch (error) {
      console.error('Error in AccountingRedirects:', error);
      // Don't crash the app on redirect errors
    }
  }, [location.pathname, navigate]);

  // This component doesn't render anything
  return null;
};

export default AccountingRedirects;
