
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FinancialDataProvider } from "./contexts/FinancialDataContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { useState } from "react";

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
import AccountingIntegrations from "./pages/accounting/Integrations";
import ChartOfAccounts from "./pages/accounting/ChartOfAccounts";
import JournalEntries from "./pages/accounting/JournalEntries";
import BankReconciliation from "./pages/accounting/BankReconciliation";
import Receivables from "./pages/accounting/Receivables";
import Payables from "./pages/accounting/Payables";
import Tax from "./pages/Tax";
import VatReturns from "./pages/tax/VatReturns";
import IncomeTax from "./pages/tax/IncomeTax";
import Paye from "./pages/tax/Paye";
import TaxCalendar from "./pages/tax/TaxCalendar";
import TaxDocuments from "./pages/tax/TaxDocuments";
import TaxSettings from "./pages/tax/TaxSettings";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Layout components
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  // Move the QueryClient creation inside the component function
  // and use useState to ensure it's stable across renders
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route element={<DashboardLayout />}>
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
                        <Route path="/accounting/integrations" element={<AccountingIntegrations />} />
                        <Route path="/accounting/transactions" element={<AccountingTransactions />} />
                        <Route path="/tax" element={<Tax />} />
                        <Route path="/tax/vat-returns" element={<VatReturns />} />
                        <Route path="/tax/income-tax" element={<IncomeTax />} />
                        <Route path="/tax/paye" element={<Paye />} />
                        <Route path="/tax/calendar" element={<TaxCalendar />} />
                        <Route path="/tax/documents" element={<TaxDocuments />} />
                        <Route path="/tax/settings" element={<TaxSettings />} />
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
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
