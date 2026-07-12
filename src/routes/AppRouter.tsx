import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage';
import { AppShell } from '@/components/layout';

import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { BatchesPage } from '@/pages/batches/BatchesPage';
import { AlertsPage } from '@/pages/alerts/AlertsPage';
import { SuppliersPage } from '@/pages/suppliers/SuppliersPage';
import { LocationsPage } from '@/pages/locations/LocationsPage';
import { ReordersPage } from '@/pages/reorders/ReordersPage';
import { QRCodesPage } from '@/pages/qrcodes/QRCodesPage';
import { StaffPage } from '@/pages/users/StaffPage';
import { RolePage } from '@/pages/users/RolePage';

import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { RequireModule } from './RequireModule';

// No placeholders remaining

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
        
        <Route element={<AppShell><RequireModule moduleName="Dashboard"><DashboardPage /></RequireModule></AppShell>} path="/dashboard" />
        <Route element={<AppShell><RequireModule moduleName="Products"><ProductsPage /></RequireModule></AppShell>} path="/products" />
        <Route element={<AppShell><RequireModule moduleName="Suppliers"><SuppliersPage /></RequireModule></AppShell>} path="/suppliers" />
        <Route element={<AppShell><RequireModule moduleName="Locations"><LocationsPage /></RequireModule></AppShell>} path="/locations" />
        <Route element={<AppShell><RequireModule moduleName="Batches"><BatchesPage /></RequireModule></AppShell>} path="/batches" />
        <Route element={<AppShell><RequireModule moduleName="Alerts"><AlertsPage /></RequireModule></AppShell>} path="/alerts" />
        <Route element={<AppShell><RequireModule moduleName="Reorders"><ReordersPage /></RequireModule></AppShell>} path="/reorders" />
        <Route element={<AppShell><RequireModule moduleName="QR Codes"><QRCodesPage /></RequireModule></AppShell>} path="/qrcodes" />
        <Route element={<AppShell><RequireModule moduleName="User Management"><StaffPage /></RequireModule></AppShell>} path="/users/staff" />
        {/* <Route element={<AppShell><RolePage /></AppShell>} path="/users/roles" /> */}

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback: redirect unknown routes to login — ProtectedRoute will forward authenticated users to dashboard */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
