import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { TouristLayout } from '../layouts/TouristLayout';
import { VendorLayout } from '../layouts/VendorLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import {
  AboutPage,
  HomePage,
  NotFoundPage,
  UnauthorizedPage,
  VendorsPage,
} from '../pages/public/PublicPages';
import { ExplorePage } from '../pages/public/ExplorePage';
import { DestinationDetailPage } from '../pages/public/DestinationDetailPage';
import { DashboardRedirectPage } from '../pages/auth/DashboardRedirectPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import {
  TouristAudioGuidePage,
  TouristDashboardPage,
  TouristEcoPassportPage,
  TouristExplorePage,
  TouristItineraryPage,
  TouristARPage,
} from '../pages/tourist/TouristPages';
import {
  VendorAnalyticsPage,
  VendorDashboardPage,
  VendorListingsPage,
  VendorPaymentsPage,
  VendorProfilePage,
  VendorVerificationPage,
} from '../pages/vendor/VendorPages';
import {
  AdminAlertsPage,
  AdminAnalyticsPage,
  AdminDashboardPage,
  AdminDestinationsPage,
  AdminVendorsPage,
} from '../pages/admin/AdminPages';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/destinations" element={<Navigate to="/explore" replace />} />
        <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/sign-in" element={<Navigate to="/login" replace />} />
        <Route path="/sign-up" element={<Navigate to="/register" replace />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/access-denied" element={<UnauthorizedPage />} />
      </Route>

      <Route
        path="/tourist"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['tourist']}>
              <TouristLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TouristDashboardPage />} />
        <Route path="explore" element={<TouristExplorePage />} />
        <Route path="itinerary" element={<TouristItineraryPage />} />
        <Route path="audio-guide" element={<TouristAudioGuidePage />} />
        <Route path="eco-passport" element={<TouristEcoPassportPage />} />
        <Route path="ar" element={<TouristARPage />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirectPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/provider"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['provider']}>
              <VendorLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboardPage />} />
        <Route path="profile" element={<VendorProfilePage />} />
        <Route path="verification" element={<VendorVerificationPage />} />
        <Route path="listings" element={<VendorListingsPage />} />
        <Route path="payments" element={<VendorPaymentsPage />} />
        <Route path="analytics" element={<VendorAnalyticsPage />} />
      </Route>

      <Route path="/vendor" element={<Navigate to="/provider" replace />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="vendors" element={<AdminVendorsPage />} />
        <Route path="destinations" element={<AdminDestinationsPage />} />
        <Route path="alerts" element={<AdminAlertsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
