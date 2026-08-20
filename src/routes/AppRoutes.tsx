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
} from '../pages/public/PublicPages';
import { ExplorePage } from '../pages/public/ExplorePage';
import { FeedbackPage } from '../pages/public/FeedbackPage';
import { MarketplacePage } from '../pages/public/MarketplacePage';
import { DestinationDetailPage } from '../pages/public/DestinationDetailPage';
import { GalleryPage } from '../pages/public/GalleryPage';
import { MapDiscoveryPage } from '../pages/public/MapDiscoveryPage';
import { ExperiencesPage } from '../pages/public/ExperiencesPage';
import { AccommodationsPage } from '../pages/public/AccommodationsPage';
import { BlogsPage } from '../pages/public/BlogsPage';
import { EventsPage } from '../pages/public/EventsPage';
import { DashboardRedirectPage } from '../pages/auth/DashboardRedirectPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import {
  TouristAudioGuidePage,
  TouristEcoPassportPage,
  TouristExplorePage,
  TouristARPage,
} from '../pages/tourist/TouristPages';
import { TouristDashboardPage } from '../pages/tourist/TouristDashboardPage';
import { TouristProfilePage } from '../pages/tourist/TouristProfilePage';
import { TouristTripDetailPage } from '../pages/tourist/TouristTripDetailPage';
import { TouristTripFormPage } from '../pages/tourist/TouristTripFormPage';
import { TouristTripsPage } from '../pages/tourist/TouristTripsPage';
import {
  ProviderAnalyticsPage,
  ProviderDashboardPage,
  ProviderPaymentsPage,
  ProviderProfilePage,
  ProviderVerificationPage,
  ProviderReviewsPage,
} from '../pages/provider/ProviderPages';
import { ProviderListingsPage } from '../pages/provider/ProviderListingsPage';
import { ProviderListingFormPage } from '../pages/provider/ProviderListingFormPage';
import { ProviderListingDetailPage } from '../pages/provider/ProviderListingDetailPage';
import {
  ProviderProductsPage,
  ProviderExperiencesPage,
  ProviderStaysPage,
  ProviderProductFormPage,
  ProviderExperienceFormPage,
  ProviderStayFormPage,
  ProviderProductDetailPage,
  ProviderExperienceDetailPage,
  ProviderStayDetailPage,
  ProviderRequestsPage,
} from '../pages/provider/ProviderMarketplacePages';
import {
  PublicProviderProfilePage,
  PublicProductPage,
  PublicExperiencePage,
  PublicStayPage,
} from '../pages/public/ProviderPortalPages';
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
        {/* Main Tourist Discovery Routes */}
        <Route index element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/map" element={<MapDiscoveryPage />} />
        <Route path="/experiences" element={<ExperiencesPage />} />
        <Route path="/accommodations" element={<AccommodationsPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        {/* Destination Detail Routes */}
        <Route path="/destinations" element={<Navigate to="/explore" replace />} />
        <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
        <Route path="/vendors" element={<Navigate to="/marketplace" replace />} />

        {/* Public Provider & Offering Showcase */}
        <Route path="/providers/:providerId" element={<PublicProviderProfilePage />} />
        <Route path="/products/:offeringId" element={<PublicProductPage />} />
        <Route path="/experiences/:offeringId" element={<PublicExperiencePage />} />
        <Route path="/stays/:offeringId" element={<PublicStayPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/sign-in" element={<Navigate to="/login" replace />} />
        <Route path="/sign-up" element={<Navigate to="/register" replace />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/access-denied" element={<UnauthorizedPage />} />
      </Route>

      {/* Authenticated Tourist Routes */}
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
        <Route path="itinerary" element={<TouristTripsPage />} />
        <Route path="itinerary/new" element={<TouristTripFormPage />} />
        <Route path="itinerary/:tripId" element={<TouristTripDetailPage />} />
        <Route path="profile" element={<TouristProfilePage />} />
        <Route path="audio-guide" element={<TouristAudioGuidePage />} />
        <Route path="eco-passport" element={<TouristEcoPassportPage />} />
        <Route path="ar" element={<TouristARPage />} />
      </Route>

      {/* Generic Dashboard Redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirectPage />
          </ProtectedRoute>
        }
      />

      {/* Authenticated Service Provider Routes */}
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
        <Route path="dashboard" element={<ProviderDashboardPage />} />
        <Route path="profile" element={<ProviderProfilePage />} />
        <Route path="verification" element={<ProviderVerificationPage />} />
        <Route path="listings" element={<ProviderListingsPage />} />
        <Route path="listings/new" element={<ProviderListingFormPage />} />
        <Route path="listings/:listingId" element={<ProviderListingDetailPage />} />
        <Route path="listings/:listingId/edit" element={<ProviderListingFormPage />} />
        <Route path="products" element={<ProviderProductsPage />} />
        <Route path="products/new" element={<ProviderProductFormPage />} />
        <Route path="products/:offeringId" element={<ProviderProductDetailPage />} />
        <Route path="products/:offeringId/edit" element={<ProviderProductFormPage />} />
        <Route path="experiences" element={<ProviderExperiencesPage />} />
        <Route path="experiences/new" element={<ProviderExperienceFormPage />} />
        <Route path="experiences/:offeringId" element={<ProviderExperienceDetailPage />} />
        <Route path="experiences/:offeringId/edit" element={<ProviderExperienceFormPage />} />
        <Route path="stays" element={<ProviderStaysPage />} />
        <Route path="stays/new" element={<ProviderStayFormPage />} />
        <Route path="stays/:offeringId" element={<ProviderStayDetailPage />} />
        <Route path="stays/:offeringId/edit" element={<ProviderStayFormPage />} />
        <Route path="requests" element={<ProviderRequestsPage />} />
        <Route path="reviews" element={<ProviderReviewsPage />} />
        <Route path="payments" element={<ProviderPaymentsPage />} />
        <Route path="analytics" element={<ProviderAnalyticsPage />} />
      </Route>

      <Route path="/vendor" element={<Navigate to="/provider" replace />} />

      {/* Authenticated Government / Admin Routes */}
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
