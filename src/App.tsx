
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { Toaster } from "@/components/ui/toaster";

import DashboardLayout from "@/layouts/DashboardLayout";
import PublicLayout from "@/layouts/PublicLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

import Dashboard from "@/pages/Dashboard";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Onboarding from "@/pages/Onboarding";
import Invoices from "@/pages/Invoices";
import Reports from "@/pages/Reports";
import Inventory from "@/pages/Inventory";
import HR from "@/pages/HR";
import Clients from "@/pages/Clients";
import Accounting from "@/pages/Accounting";
import Payment from "@/pages/Payment";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import SelectTemplate from "@/pages/invoices/SelectTemplate";
import SelectQuoteTemplate from "@/pages/invoices/SelectQuoteTemplate";
import NewInvoice from "@/pages/invoices/NewInvoice";
import NewQuote from "@/pages/invoices/NewQuote";
import Quotes from "@/pages/invoices/Quotes";

// Accounting sub-routes
import BankReconciliation from "@/pages/accounting/BankReconciliation";
import ChartOfAccounts from "@/pages/accounting/ChartOfAccounts";
import JournalEntries from "@/pages/accounting/JournalEntries";
import Payables from "@/pages/accounting/Payables";
import Receivables from "@/pages/accounting/Receivables";
import AccountingReports from "@/pages/accounting/Reports";
import Transactions from "@/pages/accounting/Transactions";

// HR sub-routes
import Attendance from "@/pages/hr/Attendance";
import BenefitPlanDetail from "@/pages/hr/BenefitPlanDetail";
import BenefitSettings from "@/pages/hr/BenefitSettings";
import Benefits from "@/pages/hr/Benefits";
import EmployeeBenefits from "@/pages/hr/EmployeeBenefits";
import EmployeeDetail from "@/pages/hr/EmployeeDetail";
import Employees from "@/pages/hr/Employees";
import GeneratePayslip from "@/pages/hr/GeneratePayslip";
import Leaves from "@/pages/hr/Leaves";
import NewBenefitPlan from "@/pages/hr/NewBenefitPlan";
import NewEmployee from "@/pages/hr/NewEmployee";
import NewLeaveRequest from "@/pages/hr/NewLeaveRequest";
import Payroll from "@/pages/hr/Payroll";
import RunPayroll from "@/pages/hr/RunPayroll";

import "./App.css";
import InvoiceQuoteManager from "./pages/invoices/InvoiceQuoteManager";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <NotificationsProvider>
            <Router>
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
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
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
                  <Route path="hr/employee-benefits/:id" element={<EmployeeBenefits />} />
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
                  <Route path="accounting" element={<Accounting />} />
                  <Route path="accounting/bank-reconciliation" element={<BankReconciliation />} />
                  <Route path="accounting/chart-of-accounts" element={<ChartOfAccounts />} />
                  <Route path="accounting/journal-entries" element={<JournalEntries />} />
                  <Route path="accounting/payables" element={<Payables />} />
                  <Route path="accounting/receivables" element={<Receivables />} />
                  <Route path="accounting/reports" element={<AccountingReports />} />
                  <Route path="accounting/transactions" element={<Transactions />} />
                  <Route path="payments" element={<Payment />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </NotificationsProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
