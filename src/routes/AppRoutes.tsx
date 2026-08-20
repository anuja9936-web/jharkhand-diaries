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
import { ToursPage } from '../pages/public/ToursPage';
import { TransportPage } from '../pages/public/TransportPage';
import { BlogsPage } from '../pages/public/BlogsPage';
import { EventsPage } from '../pages/public/EventsPage';
import { AIPlannerPage } from '../pages/public/AIPlannerPage';
import { DashboardRedirectPage } from '../pages/auth/DashboardRedirectPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { GovernmentLoginPage } from '../pages/auth/GovernmentLoginPage';
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
import { ProviderToursPage } from '../pages/provider/ProviderToursPage';
import { ProviderTourFormPage } from '../pages/provider/ProviderTourFormPage';
import { ProviderTourDetailPage } from '../pages/provider/ProviderTourDetailPage';
import { ProviderTransportPage } from '../pages/provider/ProviderTransportPage';
import { ProviderTransportFormPage } from '../pages/provider/ProviderTransportFormPage';
import { ProviderTransportDetailPage } from '../pages/provider/ProviderTransportDetailPage';
import { ProviderEnquiriesPage } from '../pages/provider/ProviderEnquiriesPage';
import { ProviderNotificationsPage } from '../pages/provider/ProviderNotificationsPage';
import { ProviderSettingsPage } from '../pages/provider/ProviderSettingsPage';
import {
  PublicProviderProfilePage,
  PublicProductPage,
  PublicExperiencePage,
  PublicStayPage,
  PublicTourPage,
  PublicTransportPage,
} from '../pages/public/ProviderPortalPages';
import {
  AdminAlertsPage,
  AdminAnalyticsPage,
  AdminContentPage,
  AdminDashboardPage,
  AdminDestinationsPage,
  AdminDistrictsPage,
  AdminFeedbackPage,
  AdminProvidersPage,
  AdminSettingsPage,
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
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/transport" element={<TransportPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/plan-trip" element={<AIPlannerPage />} />
        <Route path="/ai-planner" element={<Navigate to="/plan-trip" replace />} />
        <Route path="/planner" element={<Navigate to="/plan-trip" replace />} />
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
        <Route path="/tours/:offeringId" element={<PublicTourPage />} />
        <Route path="/transport/:offeringId" element={<PublicTransportPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/government" element={<GovernmentLoginPage />} />
        <Route path="/government/login" element={<Navigate to="/auth/government" replace />} />
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
        <Route path="onboarding" element={<ProviderDashboardPage />} />
        <Route path="profile" element={<ProviderProfilePage />} />
        <Route path="verification" element={<ProviderVerificationPage />} />

        {/* Managed Destinations */}
        <Route path="listings" element={<ProviderListingsPage />} />
        <Route path="listings/new" element={<ProviderListingFormPage />} />
        <Route path="listings/:listingId" element={<ProviderListingDetailPage />} />
        <Route path="listings/:listingId/edit" element={<ProviderListingFormPage />} />

        {/* 1. Stays / Accommodations */}
        <Route path="stays" element={<ProviderStaysPage />} />
        <Route path="stays/new" element={<ProviderStayFormPage />} />
        <Route path="stays/:offeringId" element={<ProviderStayDetailPage />} />
        <Route path="stays/:offeringId/edit" element={<ProviderStayFormPage />} />

        {/* 2. Products / Artisan Crafts */}
        <Route path="products" element={<ProviderProductsPage />} />
        <Route path="products/new" element={<ProviderProductFormPage />} />
        <Route path="products/:offeringId" element={<ProviderProductDetailPage />} />
        <Route path="products/:offeringId/edit" element={<ProviderProductFormPage />} />

        {/* 3. Tours & Guides */}
        <Route path="tours" element={<ProviderToursPage />} />
        <Route path="tours/new" element={<ProviderTourFormPage />} />
        <Route path="tours/:offeringId" element={<ProviderTourDetailPage />} />
        <Route path="tours/:offeringId/edit" element={<ProviderTourFormPage />} />

        {/* 4. Experiences / Adventure */}
        <Route path="experiences" element={<ProviderExperiencesPage />} />
        <Route path="experiences/new" element={<ProviderExperienceFormPage />} />
        <Route path="experiences/:offeringId" element={<ProviderExperienceDetailPage />} />
        <Route path="experiences/:offeringId/edit" element={<ProviderExperienceFormPage />} />

        {/* 5. Transport Services */}
        <Route path="transport" element={<ProviderTransportPage />} />
        <Route path="transport/new" element={<ProviderTransportFormPage />} />
        <Route path="transport/:offeringId" element={<ProviderTransportDetailPage />} />
        <Route path="transport/:offeringId/edit" element={<ProviderTransportFormPage />} />

        {/* Requests, Inquiries, Reviews, Analytics, Notifications & Settings */}
        <Route path="requests" element={<ProviderRequestsPage />} />
        <Route path="enquiries" element={<ProviderEnquiriesPage />} />
        <Route path="reviews" element={<ProviderReviewsPage />} />
        <Route path="analytics" element={<ProviderAnalyticsPage />} />
        <Route path="notifications" element={<ProviderNotificationsPage />} />
        <Route path="settings" element={<ProviderSettingsPage />} />
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
        <Route path="providers" element={<AdminProvidersPage />} />
        <Route path="destinations" element={<AdminDestinationsPage />} />
        <Route path="districts" element={<AdminDistrictsPage />} />
        <Route path="alerts" element={<AdminAlertsPage />} />
        <Route path="feedback" element={<AdminFeedbackPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="content" element={<AdminContentPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
