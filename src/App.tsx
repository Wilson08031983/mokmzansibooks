
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ensureInitialized } from '@/utils/robustStorageMigrator';
import DashboardLayout from '@/layouts/DashboardLayout';
import Accounting from '@/pages/Accounting';
import Settings from '@/pages/Settings';
import MyCompany from '@/pages/MyCompany';
import HR from '@/pages/HR';
import Inventory from '@/pages/Inventory';
import { useLoadingState } from '@/contexts/LoadingStateContext';
import SuspenseFallback from '@/components/SuspenseFallback';
import { Suspense } from 'react';

// Use lazy loading for non-critical components
const Clients = React.lazy(() => import('@/pages/Clients'));
const Invoices = React.lazy(() => import('@/pages/Invoices'));
const Quotes = React.lazy(() => import('@/pages/Quotes'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
const RequireAuth = React.lazy(() => import('@/components/auth/RequireAuth'));
const PublicRoute = React.lazy(() => import('@/components/auth/PublicRoute'));
const InvoiceDetails = React.lazy(() => import('@/pages/InvoiceDetails'));
const QuoteDetails = React.lazy(() => import('@/pages/QuoteDetails'));

const App = () => {
  useEffect(() => {
    // Initialize storage on app startup
    ensureInitialized('MokMzansi Books', '1.0.0')
      .then((success) => {
        console.log(success ? 'Storage initialized successfully' : 'Storage initialization failed');
      })
      .catch((error) => {
        console.error('Error initializing storage:', error);
      });
  }, []);

  const { loadingState } = useLoadingState();

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Dashboard Routes - Requires Authentication */}
        <Route path="/" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route index element={<RequireAuth><Accounting /></RequireAuth>} />
          <Route path="dashboard" element={<RequireAuth><Accounting /></RequireAuth>} />
          <Route path="clients" element={<RequireAuth><Clients /></RequireAuth>} />
          <Route path="invoices" element={<RequireAuth><Invoices /></RequireAuth>} />
          <Route path="invoices/:id" element={<RequireAuth><InvoiceDetails /></RequireAuth>} />
          <Route path="quotes" element={<RequireAuth><Quotes /></RequireAuth>} />
          <Route path="quotes/:id" element={<RequireAuth><QuoteDetails /></RequireAuth>} />
          <Route path="accounting" element={<RequireAuth><Accounting /></RequireAuth>} />
          <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="my-company" element={<RequireAuth><MyCompany /></RequireAuth>} />
          <Route path="hr" element={<RequireAuth><HR /></RequireAuth>} />
          <Route path="inventory" element={<RequireAuth><Inventory /></RequireAuth>} />
        </Route>

        {/* Catch-all route for handling unknown paths */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Suspense>
  );
};

export default App;
