import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// This component redirects incorrect accounting routes to their dashboard counterparts
const AccountingRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(true);
  
  useEffect(() => {
    try {
      // Make sure we're not in an infinite loop
      if (location.pathname.startsWith('/accounting/')) {
        // Extract the path after /accounting/
        const path = location.pathname.replace('/accounting/', '');
        // Only redirect if there's a path to redirect to
        if (path) {
          // Redirect to the correct path with dashboard prefix
          navigate(`/dashboard/accounting/${path}`, { replace: true });
        } else {
          // If we're just at /accounting/, redirect to the main accounting page
          navigate('/dashboard/accounting', { replace: true });
        }
      } else {
        // If we're not on an accounting path, don't redirect
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error('Error during redirect:', error);
      // In case of error, stop redirecting to prevent infinite loops
      setIsRedirecting(false);
    }
  }, [navigate, location.pathname]);
  
  // Don't render anything if we're not redirecting
  if (!isRedirecting) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting...</h1>
        <p>Taking you to the correct page.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default AccountingRedirect;
