import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataProvider } from './context/DataContext';

// Route Protection Component
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { PortalLayout } from './components/layout/PortalLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { Features } from './pages/public/Features';
import { HowItWorks } from './pages/public/HowItWorks';
import { Pricing } from './pages/public/Pricing';
import { Testimonials } from './pages/public/Testimonials';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { RaiseQuery } from './pages/client/RaiseQuery';
import { QueryDetails } from './pages/client/QueryDetails';
import { QueryHistory } from './pages/client/QueryHistory';
import { RecentActivity } from './pages/client/RecentActivity';
import { AlignExperts } from './pages/client/AlignExperts';
import { FieldEngineers } from './pages/client/FieldEngineers';
import { ClientMessages } from './pages/client/ClientMessages';
import { ClientPayments } from './pages/client/ClientPayments';
import { ClientProfile } from './pages/client/ClientProfile';

// Expert Pages
import { ExpertDashboard } from './pages/expert/ExpertDashboard';
import { ExpertJobs } from './pages/expert/ExpertJobs';
import { ExpertEarnings } from './pages/expert/ExpertEarnings';
import { ExpertProfile } from './pages/expert/ExpertProfile';

// Engineer Pages
import { EngineerDashboard } from './pages/engineer/EngineerDashboard';
import { EngineerJobs } from './pages/engineer/EngineerJobs';
import { EngineerMap } from './pages/engineer/EngineerMap';
import { EngineerEarnings } from './pages/engineer/EngineerEarnings';
import { EngineerProfile } from './pages/engineer/EngineerProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminQueries } from './pages/admin/AdminQueries';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <DataProvider>
            <Routes>
              {/* Public Website */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/features" element={<Features />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Portal Workspace (Strictly Protected by Role & Authentication) */}
              <Route element={<PortalLayout />}>
                {/* Client Workspace */}
                <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}><ClientDashboard /></ProtectedRoute>} />
                <Route path="/client/raise-query" element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}><RaiseQuery /></ProtectedRoute>} />
                <Route path="/client/query/:id" element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}><QueryDetails /></ProtectedRoute>} />
                <Route path="/client/history" element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}><QueryHistory /></ProtectedRoute>} />
                <Route path="/client/activity" element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}><RecentActivity /></ProtectedRoute>} />
                <Route path="/client/experts" element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}><AlignExperts /></ProtectedRoute>} />
                <Route path="/client/engineers" element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}><FieldEngineers /></ProtectedRoute>} />
                <Route path="/client/messages" element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}><ClientMessages /></ProtectedRoute>} />
                <Route path="/client/payments" element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}><ClientPayments /></ProtectedRoute>} />
                <Route path="/client/profile" element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}><ClientProfile /></ProtectedRoute>} />

                {/* Remote Expert Workspace */}
                <Route path="/expert/dashboard" element={<ProtectedRoute allowedRoles={['EXPERT', 'ADMIN']}><ExpertDashboard /></ProtectedRoute>} />
                <Route path="/expert/jobs" element={<ProtectedRoute allowedRoles={['EXPERT', 'ADMIN']}><ExpertJobs /></ProtectedRoute>} />
                <Route path="/expert/messages" element={<ProtectedRoute allowedRoles={['EXPERT', 'ADMIN']}><ClientMessages /></ProtectedRoute>} />
                <Route path="/expert/earnings" element={<ProtectedRoute allowedRoles={['EXPERT', 'ADMIN']}><ExpertEarnings /></ProtectedRoute>} />
                <Route path="/expert/profile" element={<ProtectedRoute allowedRoles={['EXPERT', 'ADMIN']}><ExpertProfile /></ProtectedRoute>} />

                {/* On-Site Field Engineer Workspace */}
                <Route path="/engineer/dashboard" element={<ProtectedRoute allowedRoles={['ENGINEER', 'ADMIN']}><EngineerDashboard /></ProtectedRoute>} />
                <Route path="/engineer/jobs" element={<ProtectedRoute allowedRoles={['ENGINEER', 'ADMIN']}><EngineerJobs /></ProtectedRoute>} />
                <Route path="/engineer/map" element={<ProtectedRoute allowedRoles={['ENGINEER', 'ADMIN']}><EngineerMap /></ProtectedRoute>} />
                <Route path="/engineer/messages" element={<ProtectedRoute allowedRoles={['ENGINEER', 'ADMIN']}><ClientMessages /></ProtectedRoute>} />
                <Route path="/engineer/earnings" element={<ProtectedRoute allowedRoles={['ENGINEER', 'ADMIN']}><EngineerEarnings /></ProtectedRoute>} />
                <Route path="/engineer/profile" element={<ProtectedRoute allowedRoles={['ENGINEER', 'ADMIN']}><EngineerProfile /></ProtectedRoute>} />

                {/* Admin Workspace (Strictly ADMIN only) */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/queries" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminQueries /></ProtectedRoute>} />
                <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPayments /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReports /></ProtectedRoute>} />
                <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAuditLogs /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSettings /></ProtectedRoute>} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DataProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
