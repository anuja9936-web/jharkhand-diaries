import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { TouristLayout } from '../layouts/TouristLayout';
import { VendorLayout } from '../layouts/VendorLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import {
  AboutPage,
  DestinationsPage,
  ExplorePage,
  HomePage,
  NotFoundPage,
  SignInPage,
  SignUpPage,
  UnauthorizedPage,
  VendorsPage,
} from '../pages/public/PublicPages';
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
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      <Route
        path="/tourist"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['tourist', 'vendor', 'admin']}>
              <TouristLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<TouristDashboardPage />} />
        <Route path="explore" element={<TouristExplorePage />} />
        <Route path="itinerary" element={<TouristItineraryPage />} />
        <Route path="audio-guide" element={<TouristAudioGuidePage />} />
        <Route path="eco-passport" element={<TouristEcoPassportPage />} />
        <Route path="ar" element={<TouristARPage />} />
      </Route>

      <Route
        path="/vendor"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['vendor', 'admin']}>
              <VendorLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<VendorDashboardPage />} />
        <Route path="profile" element={<VendorProfilePage />} />
        <Route path="verification" element={<VendorVerificationPage />} />
        <Route path="listings" element={<VendorListingsPage />} />
        <Route path="payments" element={<VendorPaymentsPage />} />
        <Route path="analytics" element={<VendorAnalyticsPage />} />
      </Route>

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
        <Route index element={<AdminDashboardPage />} />
        <Route path="vendors" element={<AdminVendorsPage />} />
        <Route path="destinations" element={<AdminDestinationsPage />} />
        <Route path="alerts" element={<AdminAlertsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

