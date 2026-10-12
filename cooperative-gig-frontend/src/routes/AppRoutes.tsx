import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { WorkerLayout } from '../layouts/WorkerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Customer Pages
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';
import { ServicesPage } from '../pages/customer/ServicesPage';
import { NewBookingPage } from '../pages/customer/NewBookingPage';
import { CustomerBookingsPage } from '../pages/customer/CustomerBookingsPage';
import { BookingDetailsPage } from '../pages/customer/BookingDetailsPage';
import { PaymentPage } from '../pages/customer/PaymentPage';
import { RatingPage } from '../pages/customer/RatingPage';

// Worker Pages
import { WorkerDashboard } from '../pages/worker/WorkerDashboard';
import { WorkerJobsPage } from '../pages/worker/WorkerJobsPage';
import { WorkerAvailabilityPage } from '../pages/worker/WorkerAvailabilityPage';
import { WorkerSkillsPage } from '../pages/worker/WorkerSkillsPage';
import { WorkerEarningsPage } from '../pages/worker/WorkerEarningsPage';
import { WorkerProfilePage } from '../pages/worker/WorkerProfilePage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminWorkersPage } from '../pages/admin/AdminWorkersPage';
import { AdminWorkerDetailsPage } from '../pages/admin/AdminWorkerDetailsPage';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { AdminDemandPage } from '../pages/admin/AdminDemandPage';
import { AdminWelfarePage } from '../pages/admin/AdminWelfarePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes with Root Layout */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Customer Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['CUSTOMER']} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/services" element={<ServicesPage />} />
            <Route path="/customer/bookings" element={<CustomerBookingsPage />} />
            <Route path="/customer/bookings/new" element={<NewBookingPage />} />
            <Route path="/customer/bookings/:id" element={<BookingDetailsPage />} />
            <Route path="/customer/payment/:id" element={<PaymentPage />} />
            <Route path="/customer/payments" element={<CustomerBookingsPage />} />
            <Route path="/customer/rating/:id" element={<RatingPage />} />
          </Route>
        </Route>
      </Route>

      {/* Worker Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['WORKER']} />}>
          <Route element={<WorkerLayout />}>
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
            <Route path="/worker/jobs" element={<WorkerJobsPage />} />
            <Route path="/worker/availability" element={<WorkerAvailabilityPage />} />
            <Route path="/worker/skills" element={<WorkerSkillsPage />} />
            <Route path="/worker/earnings" element={<WorkerEarningsPage />} />
            <Route path="/worker/profile" element={<WorkerProfilePage />} />
          </Route>
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/workers" element={<AdminWorkersPage />} />
            <Route path="/admin/workers/:id" element={<AdminWorkerDetailsPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/demand" element={<AdminDemandPage />} />
            <Route path="/admin/welfare" element={<AdminWelfarePage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
