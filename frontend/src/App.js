import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLE_DASHBOARD_MAP } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@/App.css';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import DashboardLayout from '@/pages/DashboardLayout';
import DashboardPage from '@/pages/dashboards/DashboardPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function DashboardIndex() {
  const { user } = useAuth();
  const target = ROLE_DASHBOARD_MAP[user?.role] || '/dashboard/ceo';
  return <Navigate to={target} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardIndex />} />
              <Route path="ceo" element={<DashboardPage dashboardType="ceo" />} />
              <Route path="ai" element={<DashboardPage dashboardType="ai" />} />
              <Route path="officer" element={<DashboardPage dashboardType="officer" />} />
              <Route path="pmo" element={<DashboardPage dashboardType="pmo" />} />
              <Route path="institute" element={<DashboardPage dashboardType="institute" />} />
              <Route path="employer" element={<DashboardPage dashboardType="employer" />} />
              <Route path="helpdesk" element={<DashboardPage dashboardType="helpdesk" />} />
              <Route path="student" element={<DashboardPage dashboardType="student" />} />
              <Route path="bi" element={<DashboardPage dashboardType="bi" />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
