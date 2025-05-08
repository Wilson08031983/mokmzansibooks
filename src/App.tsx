import React, { Suspense, useState, useEffect, useRef } from 'react';
import { initializeApp } from '@/utils/initApp';
import { initializeCompanyDataPersistence } from '@/utils/companyDataPersistence';
import { lazyWithRetry as lazy } from '@/utils/lazyWithRetry.tsx';
import SuspenseFallback from '@/components/SuspenseFallback';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AccountingRedirect from "./pages/AccountingRedirect";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { FinancialDataProvider } from "@/contexts/FinancialDataContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { Toaster } from "@/components/ui/toaster";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import { AIAssistant } from "@/components/AIAssistant";
import { UserBehaviorProvider } from "@/contexts/UserBehaviorContext";
import ErrorBoundary from '@/components/ErrorBoundary';
import { testPersistence } from './utils/testPersistence';

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

  useEffect(() => {
    // Initialize global error handlers
    initializeApp();
    
    // Initialize company data persistence to ensure data isn't lost after restart
    initializeCompanyDataPersistence();
    
    // Make test function available in development mode
    if (process.env.NODE_ENV === 'development') {
      (window as any).testCompanyDataPersistence = testPersistence;
      console.log('Company data persistence test function available!', 
                'Run window.testCompanyDataPersistence() to test');
    }
    
    const handleRenderError = (event: Event) => {
      console.error('Global Render Error:', event);
      setRenderError(true);
    };

    window.addEventListener('error', handleRenderError);
    
    return () => {
      window.removeEventListener('error', handleRenderError);
    };
  }, []);

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
          <I18nProvider>
            <AuthProvider>
              <FinancialDataProvider>
                <NotificationsProvider>
                  <UserBehaviorProvider>
                    <CompanyProvider>
                      <AIAssistantProvider>
                        <Suspense 
                          fallback={<SuspenseFallback message="Loading application..." />}>
                        <Routes>
                          <Route path="/" element={<PublicLayout />}>
                            <Route index element={<Index />} />
                            <Route path="signin" element={<SignIn />} />
                            <Route path="signup" element={<SignUp />} />
                            <Route path="onboarding" element={<Onboarding />} />
                          </Route>

                          <Route
                            path="dashboard"
                            element={
                              <DashboardLayout />
                            }
                          >
                            <Route index element={<Dashboard />} />
                            <Route path="invoices" element={<Invoices />} />
                            <Route path="invoices/quotes" element={<Quotes />} />
                            <Route path="invoices/select-template" element={<SelectTemplate />} />
                            <Route path="invoices/select-quote-template" element={<SelectQuoteTemplate />} />
                            <Route path="invoices/new-invoice" element={<NewInvoice />} />
                            <Route path="invoices/new-quote" element={<NewQuote />} />
                            <Route path="invoices/manager" element={<InvoiceQuoteManager />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="inventory" element={<Inventory />} />
                            <Route path="hr" element={<HR />} />
                            <Route path="hr/attendance" element={<Attendance />} />
                            <Route path="hr/benefit-plan/:id" element={<BenefitPlanDetail />} />
                            <Route path="hr/benefit-settings" element={<BenefitSettings />} />
                            <Route path="hr/benefits" element={<Benefits />} />
                            <Route path="hr/benefits/:planName" element={<BenefitPlanDetails />} />
                            <Route path="hr/employee-benefits/:id" element={<EmployeeBenefits />} />
                            <Route path="hr/employee-benefits-view/:id" element={<EmployeeBenefitsView />} />
                            <Route path="hr/employee/:id" element={<EmployeeDetail />} />
                            <Route path="hr/employees" element={<Employees />} />
                            <Route path="hr/generate-payslip/:id" element={<GeneratePayslip />} />
                            <Route path="hr/leaves" element={<Leaves />} />
                            <Route path="hr/new-benefit-plan" element={<NewBenefitPlan />} />
                            <Route path="hr/new-employee" element={<NewEmployee />} />
                            <Route path="hr/new-leave-request" element={<NewLeaveRequest />} />
                            <Route path="hr/payroll" element={<Payroll />} />
                            <Route path="hr/run-payroll" element={<RunPayroll />} />
                            <Route path="clients" element={<Clients />} />
                            <Route path="accounting" element={<ErrorBoundary><Accounting /></ErrorBoundary>} />
                            <Route path="accounting/chart-of-accounts" element={<ErrorBoundary><ChartOfAccounts /></ErrorBoundary>} />
                            <Route path="accounting/bank-reconciliation" element={<ErrorBoundary><BankReconciliation /></ErrorBoundary>} />
                            <Route path="accounting/journal-entries" element={<ErrorBoundary><JournalEntries /></ErrorBoundary>} />
                            <Route path="accounting/payables" element={<ErrorBoundary><Payables /></ErrorBoundary>} />
                            <Route path="accounting/receivables" element={<ErrorBoundary><Receivables /></ErrorBoundary>} />
                            <Route path="accounting/reports" element={<ErrorBoundary><AccountingReports /></ErrorBoundary>} />
                            <Route path="accounting/transactions" element={<ErrorBoundary><Transactions /></ErrorBoundary>} />
                            <Route path="accounting/documents" element={<ErrorBoundary><DocumentManager /></ErrorBoundary>} />
                            <Route path="accounting/test" element={<ErrorBoundary><TestPage /></ErrorBoundary>} />
                            <Route path="payments" element={<Payment />} />
                            <Route path="email-test" element={<ErrorBoundary><EmailTest /></ErrorBoundary>} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="my-company" element={<MyCompany />} />
                            <Route path="temporary-display-demo" element={<TemporaryDisplayDemo />} />
                          </Route>

                          {/* Specific redirects for accounting routes */}
                          <Route path="accounting" element={<Navigate to="/dashboard/accounting" replace />} />
                          <Route path="accounting/transactions" element={<Navigate to="/dashboard/accounting/transactions" replace />} />
                          <Route path="accounting/reports" element={<Navigate to="/dashboard/accounting/reports" replace />} />
                          <Route path="accounting/chart-of-accounts" element={<Navigate to="/dashboard/accounting/chart-of-accounts" replace />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        </Suspense>
                        <Toaster />
                      </AIAssistantProvider>
                    </CompanyProvider>
                  </UserBehaviorProvider>
                </NotificationsProvider>
              </FinancialDataProvider>
            </AuthProvider>
          </I18nProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
