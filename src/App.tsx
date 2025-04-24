
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FinancialDataProvider } from "./contexts/FinancialDataContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { I18nProvider, useI18n } from "./contexts/I18nContext";
import { useEffect, useState } from "react";
import { setGlobalCurrency } from "./utils/formatters";

// Pages
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Payment from "./pages/Payment";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Quotes from "./pages/invoices/Quotes";
import NewInvoice from "./pages/invoices/NewInvoice";
import NewQuote from "./pages/invoices/NewQuote";
import SelectTemplate from "./pages/invoices/SelectTemplate";
import SelectQuoteTemplate from "./pages/invoices/SelectQuoteTemplate";
import Accounting from "./pages/Accounting";
import AccountingTransactions from "./pages/accounting/Transactions";
import AccountingReports from "./pages/accounting/Reports";
import ChartOfAccounts from "./pages/accounting/ChartOfAccounts";
import JournalEntries from "./pages/accounting/JournalEntries";
import BankReconciliation from "./pages/accounting/BankReconciliation";
import Receivables from "./pages/accounting/Receivables";
import Payables from "./pages/accounting/Payables";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// HR & Payroll Pages
import HR from "./pages/HR";
import Employees from "./pages/hr/Employees";
import EmployeeDetail from "./pages/hr/EmployeeDetail"; // Add import for the new component
import NewEmployee from "./pages/hr/NewEmployee";
import Payroll from "./pages/hr/Payroll";
import Attendance from "./pages/hr/Attendance";
import Leaves from "./pages/hr/Leaves";
import NewLeaveRequest from "./pages/hr/NewLeaveRequest";
import Benefits from "./pages/hr/Benefits";
import BenefitSettings from "./pages/hr/BenefitSettings";
import BenefitPlanDetail from "./pages/hr/BenefitPlanDetail";
import NewBenefitPlan from "./pages/hr/NewBenefitPlan";
import EmployeeBenefits from "./pages/hr/EmployeeBenefits";
import RunPayroll from "./pages/hr/RunPayroll";

// Layout components
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Component to update the global currency when the context currency changes
const CurrencySynchronizer = () => {
  const { currency } = useI18n();
  
  useEffect(() => {
    console.log("Currency changed to:", currency);
    setGlobalCurrency(currency);
  }, [currency]);
  
  return null;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <CurrencySynchronizer />
          <AuthProvider>
            <FinancialDataProvider>
              <NotificationsProvider>
                <TooltipProvider>
                  <BrowserRouter>
                    <Routes>
                      {/* Public Routes */}
                      <Route element={<PublicLayout />}>
                        <Route path="/" element={<Index />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/payment" element={<Payment />} />
                      </Route>
                      
                      {/* Protected Routes */}
                      <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                          {/* Use our new Dashboard component for the dashboard route */}
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/clients" element={<Clients />} />
                          <Route path="/invoices" element={<Invoices />} />
                          <Route path="/invoices/new" element={<NewInvoice />} />
                          <Route path="/invoices/select-template" element={<SelectTemplate />} />
                          <Route path="/invoices/quotes" element={<Quotes />} />
                          <Route path="/invoices/quotes/new" element={<NewQuote />} />
                          <Route path="/invoices/quotes/select-template" element={<SelectQuoteTemplate />} />
                          <Route path="/accounting" element={<Accounting />} />
                          <Route path="/accounting/chart-of-accounts" element={<ChartOfAccounts />} />
                          <Route path="/accounting/journal-entries" element={<JournalEntries />} />
                          <Route path="/accounting/bank-reconciliation" element={<BankReconciliation />} />
                          <Route path="/accounting/reports" element={<AccountingReports />} />
                          <Route path="/accounting/receivables" element={<Receivables />} />
                          <Route path="/accounting/payables" element={<Payables />} />
                          <Route path="/accounting/transactions" element={<AccountingTransactions />} />
                          
                          {/* HR & Payroll Routes */}
                          <Route path="/hr" element={<HR />} />
                          <Route path="/hr/employees" element={<Employees />} />
                          <Route path="/hr/employees/new" element={<NewEmployee />} />
                          <Route path="/hr/employees/:employeeId" element={<EmployeeDetail />} /> {/* New route for employee details */}
                          <Route path="/hr/payroll" element={<Payroll />} />
                          <Route path="/hr/payroll/run" element={<RunPayroll />} />
                          <Route path="/hr/attendance" element={<Attendance />} />
                          <Route path="/hr/leaves" element={<Leaves />} />
                          <Route path="/hr/leaves/new" element={<NewLeaveRequest />} />
                          <Route path="/hr/benefits" element={<Benefits />} />
                          <Route path="/hr/benefits/settings" element={<BenefitSettings />} />
                          <Route path="/hr/benefits/new" element={<NewBenefitPlan />} />
                          <Route path="/hr/benefits/:planId" element={<BenefitPlanDetail />} />
                          <Route path="/hr/benefits/employee" element={<EmployeeBenefits />} />
                          
                          <Route path="/inventory" element={<Inventory />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/settings" element={<Settings />} />
                        </Route>
                      </Route>
                      
                      {/* Catch-all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </NotificationsProvider>
            </FinancialDataProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
