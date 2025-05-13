
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
import SyncIndicator, { SyncStatus } from '@/components/shared/SyncIndicator';
import { initializeApp, debugHelpers } from '@/utils/initApp';
import { initializeSupabaseForAllPages } from '@/utils/setupSupabaseForAllPages';
import { GlobalAppProvider } from '@/contexts/GlobalAppContext';
import { lazyWithRetry as lazy } from '@/utils/lazyWithRetry.tsx';
import SuspenseFallback from '@/components/SuspenseFallback';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AccountingRedirect from "./pages/AccountingRedirect";
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
import PersistenceProvider from "@/contexts/PersistenceContext";
// Import test utilities for development mode
import { testPersistence } from '@/utils/testPersistence';

// Import DashboardLayout after fixing it
import DashboardLayout from "@/layouts/DashboardLayout";
import PublicLayout from "@/layouts/PublicLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Index = lazy(() => import("@/pages/Index"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const Reports = lazy(() => import("@/pages/Reports"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const HR = lazy(() => import("@/pages/HR"));
const Clients = lazy(() => import("@/pages/Clients"));
const Accounting = lazy(() => import("@/pages/Accounting"));
const Payment = lazy(() => import("@/pages/Payment"));
const Settings = lazy(() => import("@/pages/Settings"));
const DataManagement = lazy(() => import("@/pages/DataManagement"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SelectTemplate = lazy(() => import("@/pages/invoices/SelectTemplate"));
const SelectQuoteTemplate = lazy(() => import("@/pages/invoices/SelectQuoteTemplate"));
const NewInvoice = lazy(() => import("@/pages/invoices/NewInvoice"));
const NewQuote = lazy(() => import("@/pages/invoices/NewQuote"));
const Quotes = lazy(() => import("@/pages/invoices/Quotes"));
const MyCompany = lazy(() => import('@/pages/MyCompany'));
const ChartOfAccounts = lazy(() => import('@/pages/accounting/SimpleChartOfAccounts'));
const InvoiceQuoteManager = lazy(() => import("@/pages/invoices/InvoiceQuoteManager"));
const EmailTest = lazy(() => import("@/pages/EmailTest"));
const TemporaryDisplayDemo = lazy(() => import("@/pages/TemporaryDisplayDemo"));

// Accounting sub-routes
const BankReconciliation = lazy(() => import("@/pages/accounting/BankReconciliation"));
const JournalEntries = lazy(() => import("@/pages/accounting/JournalEntries"));
const Payables = lazy(() => import("@/pages/accounting/Payables"));
const Receivables = lazy(() => import("@/pages/accounting/Receivables"));
const AccountingReports = lazy(() => import("@/pages/accounting/Reports"));
const Transactions = lazy(() => import("@/pages/accounting/Transactions"));
const DocumentManager = lazy(() => import("@/pages/accounting/DocumentManager"));
const TestPage = lazy(() => import("@/pages/accounting/TestPage"));

// HR sub-routes
const Attendance = lazy(() => import("@/pages/hr/Attendance"));
const BenefitPlanDetail = lazy(() => import("@/pages/hr/BenefitPlanDetail"));
const BenefitPlanDetails = lazy(() => import("@/pages/hr/BenefitPlanDetails"));
const BenefitSettings = lazy(() => import("@/pages/hr/BenefitSettings"));
const Benefits = lazy(() => import("@/pages/hr/Benefits"));
const EmployeeBenefits = lazy(() => import("@/pages/hr/EmployeeBenefits"));
const EmployeeBenefitsView = lazy(() => import("@/pages/hr/EmployeeBenefitsView"));
const EmployeeDetail = lazy(() => import("@/pages/hr/EmployeeDetail"));
const Employees = lazy(() => import("@/pages/hr/Employees"));
const GeneratePayslip = lazy(() => import("@/pages/hr/GeneratePayslip"));
const Leaves = lazy(() => import("@/pages/hr/Leaves"));
const NewBenefitPlan = lazy(() => import("@/pages/hr/NewBenefitPlan"));
const NewEmployee = lazy(() => import("@/pages/hr/NewEmployee"));
const NewLeaveRequest = lazy(() => import("@/pages/hr/NewLeaveRequest"));
const Payroll = lazy(() => import("@/pages/hr/Payroll"));
const RunPayroll = lazy(() => import("@/pages/hr/RunPayroll"));

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
        <Router>
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
                                <Routes>
                                  <Route path="/" element={<Index />} />
                                  <Route path="/signin" element={<SignIn />} />
                                  <Route path="/signup" element={<SignUp />} />
                                  <Route path="/onboarding" element={<Onboarding />} />
                                  <Route path="/payment" element={<Payment />} />
                                  
                                  {/* Dashboard routes */}
                                  <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                      <DashboardLayout />
                                    </ProtectedRoute>
                                  }>
                                    <Route index element={<Dashboard />} />
                                    <Route path="invoices" element={<Invoices />} />
                                    <Route path="invoices/quotes" element={<Quotes />} />
                                    <Route path="invoices/select-template" element={<SelectTemplate />} />
                                    <Route path="invoices/select-quote-template" element={<SelectQuoteTemplate />} />
                                    <Route path="invoices/new" element={<NewInvoice />} />
                                    <Route path="invoices/new-quote" element={<NewQuote />} />
                                    <Route path="invoices/manager" element={<InvoiceQuoteManager />} />
                                    <Route path="reports" element={<Reports />} />
                                    <Route path="inventory" element={<Inventory />} />
                                    <Route path="clients" element={<Clients />} />
                                    <Route path="settings" element={<Settings />} />
                                    <Route path="data-management" element={<DataManagement />} />
                                    <Route path="my-company" element={<MyCompany />} />
                                    <Route path="email-test" element={<EmailTest />} />
                                    <Route path="temporary-display-demo" element={<TemporaryDisplayDemo />} />
                                    
                                    {/* HR sub-routes */}
                                    <Route path="hr" element={<HR />} />
                                    <Route path="hr/benefits" element={<Benefits />} />
                                    <Route path="hr/leaves" element={<Leaves />} />
                                    <Route path="hr/attendance" element={<Attendance />} />
                                    <Route path="hr/payroll" element={<Payroll />} />
                                    <Route path="hr/payroll/generate-payslip" element={<GeneratePayslip />} />
                                    <Route path="hr/payroll/run-payroll" element={<RunPayroll />} />
                                    <Route path="hr/employees" element={<Employees />} />
                                    <Route path="hr/employees/new" element={<NewEmployee />} />
                                    <Route path="hr/employees/:id" element={<EmployeeDetail />} />
                                    <Route path="hr/leaves/new-request" element={<NewLeaveRequest />} />
                                    <Route path="hr/benefits/employee-benefits" element={<EmployeeBenefits />} />
                                    <Route path="hr/benefits/employee-benefits/:id" element={<EmployeeBenefitsView />} />
                                    <Route path="hr/benefits/settings" element={<BenefitSettings />} />
                                    <Route path="hr/benefits/plans/new" element={<NewBenefitPlan />} />
                                    <Route path="hr/benefits/plans/:id" element={<BenefitPlanDetail />} />
                                    <Route path="hr/benefits/plans" element={<BenefitPlanDetails />} />
                                    
                                    {/* Accounting sub-routes */}
                                    <Route path="accounting" element={<Accounting />} />
                                    <Route path="accounting/bank-reconciliation" element={<BankReconciliation />} />
                                    <Route path="accounting/journal-entries" element={<JournalEntries />} />
                                    <Route path="accounting/payables" element={<Payables />} />
                                    <Route path="accounting/receivables" element={<Receivables />} />
                                    <Route path="accounting/reports" element={<AccountingReports />} />
                                    <Route path="accounting/transactions" element={<Transactions />} />
                                    <Route path="accounting/documents" element={<DocumentManager />} />
                                    <Route path="accounting/chart-of-accounts" element={<ChartOfAccounts />} />
                                    <Route path="accounting/test" element={<TestPage />} />
                                  </Route>
                                  
                                  {/* Redirects */}
                                  <Route path="/accounting" element={<AccountingRedirect />} />
                                  <Route path="accounting/journal-entries" element={<Navigate to="/dashboard/accounting/journal-entries" replace />} />
                                  <Route path="accounting/bank-reconciliation" element={<Navigate to="/dashboard/accounting/bank-reconciliation" replace />} />
                                  <Route path="accounting/payables" element={<Navigate to="/dashboard/accounting/payables" replace />} />
                                  <Route path="accounting/receivables" element={<Navigate to="/dashboard/accounting/receivables" replace />} />
                                  <Route path="accounting/reports" element={<Navigate to="/dashboard/accounting/reports" replace />} />
                                  <Route path="accounting/transactions" element={<Navigate to="/dashboard/accounting/transactions" replace />} />
                                  <Route path="accounting/documents" element={<Navigate to="/dashboard/accounting/documents" replace />} />
                                  <Route path="accounting/chart-of-accounts" element={<Navigate to="/dashboard/accounting/chart-of-accounts" replace />} />
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
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
          </Router>
        </ThemeProvider>
      </ErrorBoundary>
  );
};

// For debug purposes, expose these methods to the window object if needed
if (process.env.NODE_ENV === 'development') {
  (window as any).debugHelpers = debugHelpers;
}

export default App;
