
import React, { Suspense, useState, useEffect, useRef } from 'react';
import robustStorageMigrator from '@/utils/robustStorageMigrator';
// Import persistence test for data retention verification
import '@/utils/runPersistenceTest';
// Import storage status manager and initialize it as early as possible
import storageStatusManager from '@/utils/storageStatusManager';
// Initialize storage status manager as early as possible
const storageStatusPromise = storageStatusManager.initialize();
// Initialize data recovery as early as possible
const dataRecoveryPromise = robustStorageMigrator.ensureInitialized();
import { SyncProvider } from '@/contexts/SyncContext';
import SyncIndicator from '@/components/shared/SyncIndicator';
import { SyncStatus } from '@/components/shared/SyncIndicator';
import { initializeApp, debugHelpers } from '@/utils/initApp';
import { initializeSupabaseForAllPages } from '@/utils/setupSupabaseForAllPages';
import { GlobalAppProvider } from '@/contexts/GlobalAppContext';
import { lazyWithRetry as lazy } from '@/utils/lazyWithRetry.tsx';
import SuspenseFallback from '@/components/SuspenseFallback';
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { FinancialDataProvider } from "@/contexts/FinancialDataContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { Toaster } from "@/components/ui/toaster";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import { AIAssistant } from "@/components/AIAssistant";
import { UserBehaviorProvider } from "@/contexts/UserBehaviorContext";
import ErrorBoundary from '@/components/ErrorBoundary';
import { PersistenceProvider } from "@/contexts/PersistenceContext";
// Import test utilities for development mode
import { testPersistence } from '@/utils/testPersistence';

function App() {
  const [renderError, setRenderError] = useState(false);

  // Track mounted state to prevent updates after unmount
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeApplication = async () => {
      try {
        // First check storage status and show notifications if needed
        await storageStatusPromise;
        console.log('App: Storage status check completed');
        
        // Then wait for data recovery system
        await dataRecoveryPromise;
        if (isMounted) console.log('App: Data recovery system initialized successfully');
        
        // Initialize the entire application with our enhanced persistence system
        if (isMounted) {
          await initializeApp();
          console.log('App: Application initialized successfully');
        }
        
        // Initialize Supabase integration for all pages
        if (isMounted) {
          await initializeSupabaseForAllPages();
          console.log('App: Supabase integration initialized successfully for all pages');
        }
      } catch (error) {
        if (isMounted) {
          console.error('App: Initialization failed:', error);
          
          // Even if initialization fails, we want to continue with the app
          // but we'll show a warning in the console
          console.warn('App: Continuing despite initialization errors');
        }
      }
    };
    
    initializeApplication();
    
    // Enhanced error handler for global errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        try {
          setRenderError(true);
          
          // Force clear problematic localStorage items that might be causing issues
          try {
            localStorage.removeItem('COMPANY_DATA_CACHE');
            localStorage.removeItem('COMPANY_DATA_FORCE_UPDATE_NOW');
            // Clear session storage as well
            sessionStorage.removeItem('COMPANY_DISPLAY_STATE');
          } catch (e) {
            console.error('Failed to clear problematic storage items:', e);
          }
        } catch (e) {
          console.error('Error in error handler:', e);
        }
      }
      
      // Prevent the error from bubbling further and crashing the app completely
      event.preventDefault();
      event.stopPropagation();
      return true;
    };
    
    // Attach multiple listeners to ensure we catch all errors
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      if (isMountedRef.current) setRenderError(true);
    });
    
    // Setup cleanup
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', () => {});
    };
  }, []);

  // Check if we're in a degraded storage mode based on the status manager
  const [degradedMode] = useState(
    typeof window !== 'undefined' && (window as any).__STORAGE_STATUS__?.degradedMode
  );

  if (renderError) {
    return (
      <div className="bg-red-50 p-10 text-center min-h-screen flex items-center justify-center">
        <div className="max-w-md">
          <h1 className="text-3xl text-red-600 mb-4">Application Rendering Failed</h1>
          <p className="text-lg text-red-500 mb-6">
            We encountered a critical error while loading the application.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
            >
              Refresh Page
            </button>
            <p className="text-sm text-gray-600">
              If the problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SupabaseAuthProvider>
          <I18nProvider>
            <SyncProvider>
              <PersistenceProvider>
                <GlobalAppProvider>
                  <FinancialDataProvider>
                    <NotificationsProvider>
                      <UserBehaviorProvider>
                        <CompanyProvider>
                          <AIAssistantProvider>
                            <Suspense 
                              fallback={<SuspenseFallback message="Loading application..." />}>
                              <RouterProvider router={router} />
                            </Suspense>
                            <AIAssistant />
                            <Toaster />
                            <SyncIndicator status={SyncStatus.IDLE} />
                          </AIAssistantProvider>
                        </CompanyProvider>
                      </UserBehaviorProvider>
                    </NotificationsProvider>
                  </FinancialDataProvider>
                </GlobalAppProvider>
              </PersistenceProvider>
            </SyncProvider>
          </I18nProvider>
        </SupabaseAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// For debug purposes, expose these methods to the window object if needed
if (process.env.NODE_ENV === 'development') {
  (window as any).debugHelpers = debugHelpers;
}

export default App;
