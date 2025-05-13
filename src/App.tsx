import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ensureInitialized, migrateData } from '@/utils/robustStorageMigrator';
import DashboardLayout from '@/layouts/DashboardLayout';
import Clients from '@/pages/Clients';
import Invoices from '@/pages/Invoices';
import Quotes from '@/pages/Quotes';
import Accounting from '@/pages/Accounting';
import Settings from '@/pages/Settings';
import MyCompany from '@/pages/MyCompany';
import HR from '@/pages/HR';
import Inventory from '@/pages/Inventory';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import PublicRoute from '@/components/auth/PublicRoute';
import InvoiceDetails from '@/pages/InvoiceDetails';
import QuoteDetails from '@/pages/QuoteDetails';
import { useLoadingState } from '@/contexts/LoadingStateContext';
import SuspenseFallback from '@/components/SuspenseFallback';
import { lazy, Suspense } from 'react';

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

  const { isLoggedIn } = useAuth();
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
