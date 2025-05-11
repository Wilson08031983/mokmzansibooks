import React from 'react';

const FallbackErrorUI = () => {
  const resetApp = () => {
    // Clear all potentially problematic storage
    try {
      localStorage.removeItem('COMPANY_DATA_CACHE');
      localStorage.removeItem('COMPANY_DATA_FORCE_UPDATE_NOW');
      localStorage.removeItem('COMPANY_DISPLAY_STATE');
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    
    // Reload the page
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-5">
      <div className="mx-auto p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 text-red-500 mx-auto" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Application Error
          </h2>
          
          <p className="text-gray-600 mt-2">
            We've encountered an error while rendering the application. This could be due to corrupted data or a technical issue.
          </p>
          
          <div className="mt-6">
            <button
              onClick={resetApp}
              className="px-5 py-3 bg-blue-600 text-white rounded-md font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Reset Application
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            This will clear temporary application data and reload.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FallbackErrorUI;
