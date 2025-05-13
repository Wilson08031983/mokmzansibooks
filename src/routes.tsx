
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { Suspense, lazy } from "react";
import SuspenseFallback from "@/components/SuspenseFallback";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

// Lazy load pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const Reports = lazy(() => import("@/pages/Reports"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const HR = lazy(() => import("@/pages/HR"));
const Clients = lazy(() => import("@/pages/Clients"));
const Accounting = lazy(() => import("@/pages/Accounting"));
const Payment = lazy(() => import("@/pages/Payment"));
const Settings = lazy(() => import("@/pages/Settings"));
const DataManagement = lazy(() => import("@/pages/DataManagement"));
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
const AccountingRedirect = lazy(() => import("@/pages/AccountingRedirect"));

// Create and export the router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/signin", 
    element: <Suspense fallback={<SuspenseFallback />}><SignIn /></Suspense>
  },
  {
    path: "/signup",
    element: <Suspense fallback={<SuspenseFallback />}><SignUp /></Suspense>
  },
  {
    path: "/onboarding",
    element: <Suspense fallback={<SuspenseFallback />}><Onboarding /></Suspense>
  },
  {
    path: "/payment",
    element: <Suspense fallback={<SuspenseFallback />}><Payment /></Suspense>
  },
  
  // Dashboard routes
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Suspense fallback={<SuspenseFallback />}><Dashboard /></Suspense> },
      { path: "invoices", element: <Suspense fallback={<SuspenseFallback />}><Invoices /></Suspense> },
      { path: "invoices/quotes", element: <Suspense fallback={<SuspenseFallback />}><Quotes /></Suspense> },
      { path: "invoices/select-template", element: <Suspense fallback={<SuspenseFallback />}><SelectTemplate /></Suspense> },
      { path: "invoices/select-quote-template", element: <Suspense fallback={<SuspenseFallback />}><SelectQuoteTemplate /></Suspense> },
      { path: "invoices/new", element: <Suspense fallback={<SuspenseFallback />}><NewInvoice /></Suspense> },
      { path: "invoices/new-quote", element: <Suspense fallback={<SuspenseFallback />}><NewQuote /></Suspense> },
      { path: "invoices/manager", element: <Suspense fallback={<SuspenseFallback />}><InvoiceQuoteManager /></Suspense> },
      { path: "reports", element: <Suspense fallback={<SuspenseFallback />}><Reports /></Suspense> },
      { path: "inventory", element: <Suspense fallback={<SuspenseFallback />}><Inventory /></Suspense> },
      { path: "clients", element: <Suspense fallback={<SuspenseFallback />}><Clients /></Suspense> },
      { path: "settings", element: <Suspense fallback={<SuspenseFallback />}><Settings /></Suspense> },
      { path: "data-management", element: <Suspense fallback={<SuspenseFallback />}><DataManagement /></Suspense> },
      { path: "my-company", element: <Suspense fallback={<SuspenseFallback />}><MyCompany /></Suspense> },
      { path: "email-test", element: <Suspense fallback={<SuspenseFallback />}><EmailTest /></Suspense> },
      { path: "temporary-display-demo", element: <Suspense fallback={<SuspenseFallback />}><TemporaryDisplayDemo /></Suspense> },
      
      // HR sub-routes
      { path: "hr", element: <Suspense fallback={<SuspenseFallback />}><HR /></Suspense> },
      { path: "hr/benefits", element: <Suspense fallback={<SuspenseFallback />}><Benefits /></Suspense> },
      { path: "hr/leaves", element: <Suspense fallback={<SuspenseFallback />}><Leaves /></Suspense> },
      { path: "hr/attendance", element: <Suspense fallback={<SuspenseFallback />}><Attendance /></Suspense> },
      { path: "hr/payroll", element: <Suspense fallback={<SuspenseFallback />}><Payroll /></Suspense> },
      { path: "hr/payroll/generate-payslip", element: <Suspense fallback={<SuspenseFallback />}><GeneratePayslip /></Suspense> },
      { path: "hr/payroll/run-payroll", element: <Suspense fallback={<SuspenseFallback />}><RunPayroll /></Suspense> },
      { path: "hr/employees", element: <Suspense fallback={<SuspenseFallback />}><Employees /></Suspense> },
      { path: "hr/employees/new", element: <Suspense fallback={<SuspenseFallback />}><NewEmployee /></Suspense> },
      { path: "hr/employees/:id", element: <Suspense fallback={<SuspenseFallback />}><EmployeeDetail /></Suspense> },
      { path: "hr/leaves/new-request", element: <Suspense fallback={<SuspenseFallback />}><NewLeaveRequest /></Suspense> },
      { path: "hr/benefits/employee-benefits", element: <Suspense fallback={<SuspenseFallback />}><EmployeeBenefits /></Suspense> },
      { path: "hr/benefits/employee-benefits/:id", element: <Suspense fallback={<SuspenseFallback />}><EmployeeBenefitsView /></Suspense> },
      { path: "hr/benefits/settings", element: <Suspense fallback={<SuspenseFallback />}><BenefitSettings /></Suspense> },
      { path: "hr/benefits/plans/new", element: <Suspense fallback={<SuspenseFallback />}><NewBenefitPlan /></Suspense> },
      { path: "hr/benefits/plans/:id", element: <Suspense fallback={<SuspenseFallback />}><BenefitPlanDetail /></Suspense> },
      { path: "hr/benefits/plans", element: <Suspense fallback={<SuspenseFallback />}><BenefitPlanDetails /></Suspense> },
      
      // Accounting sub-routes
      { path: "accounting", element: <Suspense fallback={<SuspenseFallback />}><Accounting /></Suspense> },
      { path: "accounting/bank-reconciliation", element: <Suspense fallback={<SuspenseFallback />}><BankReconciliation /></Suspense> },
      { path: "accounting/journal-entries", element: <Suspense fallback={<SuspenseFallback />}><JournalEntries /></Suspense> },
      { path: "accounting/payables", element: <Suspense fallback={<SuspenseFallback />}><Payables /></Suspense> },
      { path: "accounting/receivables", element: <Suspense fallback={<SuspenseFallback />}><Receivables /></Suspense> },
      { path: "accounting/reports", element: <Suspense fallback={<SuspenseFallback />}><AccountingReports /></Suspense> },
      { path: "accounting/transactions", element: <Suspense fallback={<SuspenseFallback />}><Transactions /></Suspense> },
      { path: "accounting/documents", element: <Suspense fallback={<SuspenseFallback />}><DocumentManager /></Suspense> },
      { path: "accounting/chart-of-accounts", element: <Suspense fallback={<SuspenseFallback />}><ChartOfAccounts /></Suspense> },
      { path: "accounting/test", element: <Suspense fallback={<SuspenseFallback />}><TestPage /></Suspense> },
    ]
  },
  
  // Redirects
  {
    path: "/accounting",
    element: <AccountingRedirect />
  },
  { 
    path: "accounting/journal-entries", 
    element: <Navigate to="/dashboard/accounting/journal-entries" replace /> 
  },
  { 
    path: "accounting/bank-reconciliation", 
    element: <Navigate to="/dashboard/accounting/bank-reconciliation" replace /> 
  },
  { 
    path: "accounting/payables", 
    element: <Navigate to="/dashboard/accounting/payables" replace /> 
  },
  { 
    path: "accounting/receivables", 
    element: <Navigate to="/dashboard/accounting/receivables" replace /> 
  },
  { 
    path: "accounting/reports", 
    element: <Navigate to="/dashboard/accounting/reports" replace /> 
  },
  { 
    path: "accounting/transactions", 
    element: <Navigate to="/dashboard/accounting/transactions" replace /> 
  },
  { 
    path: "accounting/documents", 
    element: <Navigate to="/dashboard/accounting/documents" replace /> 
  },
  { 
    path: "accounting/chart-of-accounts", 
    element: <Navigate to="/dashboard/accounting/chart-of-accounts" replace /> 
  },
  {
    path: "*",
    element: <NotFound />
  }
]);
