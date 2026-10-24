import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // 1. Not authenticated -> strictly block and redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} 
        replace 
        state={{ from: location.pathname, reason: 'authentication_required' }} 
      />
    );
  }

  // 2. Role not authorized -> redirect to appropriate role dashboard
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const roleDashboardMap: Record<UserRole, string> = {
      CLIENT: '/client/dashboard',
      EXPERT: '/expert/dashboard',
      ENGINEER: '/engineer/dashboard',
      ADMIN: '/admin/dashboard',
    };

    const targetDashboard = roleDashboardMap[role] || '/auth/login';
    return <Navigate to={targetDashboard} replace state={{ reason: 'unauthorized_role' }} />;
  }

  return children ? <>{children}</> : null;
};
