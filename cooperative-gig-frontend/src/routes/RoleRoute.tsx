import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { role, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Checking permissions..." />;
  }

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to their own dashboard
    if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />;
    if (role === 'WORKER') return <Navigate to="/worker/dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
