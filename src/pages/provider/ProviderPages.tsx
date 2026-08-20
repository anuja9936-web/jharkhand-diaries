import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Building2,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  Package,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/StateBlocks';
import { ProviderReviewCard } from '../../components/provider/ProviderReviewCard';
import { ProviderRequestCard } from '../../components/provider/ProviderRequestCard';
import { ProviderOnboardingCard } from '../../components/provider/ProviderOnboardingCard';
import { ProviderCapabilitySelector } from '../../components/provider/ProviderCapabilitySelector';
import {
  getProviderCategoryLabel,
  VERIFICATION_STATUS_LABELS,
} from '../../constants/provider';
import { useAuth } from '../../hooks/useAuth';
import {
  getMyProviderOfferings,
  getMyProviderRequests,
  type ProviderRequestWithOffering,
} from '../../services/provider/providerMarketplaceService';
import { getMyProviderListings } from '../../services/provider/providerService';
import { getReviewsForDestinationIds } from '../../services/reviews/reviewService';
import { updateProfile } from '../../services/users/profileService';
import type { Destination } from '../../types/destination';
import type { ProviderCapability, ProviderOffering, ProviderOfferingKind } from '../../types/provider';
import type { ReviewWithDestination } from '../../services/reviews/reviewService';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getAverageRating(reviews: ReviewWithDestination[]): number | null {
  if (reviews.length === 0) return null;
  return Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1));
}

function getProfileCompletion(profile: ReturnType<typeof useAuth>['profile']): {
  percentage: number;
  missingFields: string[];
} {
  const checkList: { label: string; filled: boolean }[] = [
    { label: 'Business / Display Name', filled: Boolean(profile?.business_name || profile?.full_name) },
    { label: 'Owner / Contact Name', filled: Boolean(profile?.owner_name) },
    { label: 'Business Description', filled: Boolean(profile?.description) },
    { label: 'Contact Phone', filled: Boolean(profile?.phone) },
    { label: 'District / Region', filled: Boolean(profile?.district) },
    { label: 'Operating Address', filled: Boolean(profile?.address) },
    { label: 'Profile / Avatar Image', filled: Boolean(profile?.avatar_url) },
    { label: 'Service Capabilities', filled: Boolean(profile?.provider_categories && profile.provider_categories.length > 0) },
    { label: 'Identity Verification', filled: Boolean(profile?.verification_status && profile.verification_status !== 'unverified') },
  ];

  const filledCount = checkList.filter((item) => item.filled).length;
  const percentage = Math.round((filledCount / checkList.length) * 100);
  const missingFields = checkList.filter((item) => !item.filled).map((item) => item.label);

  return { percentage, missingFields };
}

// ---------------------------------------------------------------------------
// Provider Dashboard Home
// ---------------------------------------------------------------------------

export function ProviderDashboardPage() {
  const { profile, user } = useAuth();
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [requests, setRequests] = useState<ProviderRequestWithOffering[]>([]);
  const [reviews, setReviews] = useState<ReviewWithDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCapabilityPicker, setShowCapabilityPicker] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [listingsRes, offeringsRes, requestsRes] = await Promise.allSettled([
        getMyProviderListings(),
        getMyProviderOfferings(),
        getMyProviderRequests(),
      ]);

      const loadedListings = listingsRes.status === 'fulfilled' ? listingsRes.value : [];
      const loadedOfferings = offeringsRes.status === 'fulfilled' ? offeringsRes.value : [];
      const loadedRequests = requestsRes.status === 'fulfilled' ? requestsRes.value : [];

      setOfferings(loadedOfferings);
      setRequests(loadedRequests);

      if (loadedListings.length > 0) {
        try {
          const reviewRows = await getReviewsForDestinationIds(loadedListings.map((l) => l.id));
          setReviews(reviewRows);
        } catch {
          setReviews([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const rawCategories = profile?.provider_categories ?? [];
  const capabilities = useMemo(
    () => rawCategories.map((c) => c.toLowerCase()) as ProviderCapability[],
    [rawCategories]
  );
  const hasCapability = (cap: ProviderCapability) => capabilities.includes(cap);

  // Group offerings by capability kind
  const totalsByKind = useMemo(() => {
    const counts: Record<ProviderOfferingKind, number> = {
      stay: 0,
      product: 0,
      tour: 0,
      experience: 0,
      transport: 0,
    };
    offerings.forEach((o) => {
      if (counts[o.kind] !== undefined) {
        counts[o.kind]++;
      }
    });
    return counts;
  }, [offerings]);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');
  const averageRating = getAverageRating(reviews);
  const { percentage: profileCompletion, missingFields } = getProfileCompletion(profile);

  const verificationStatus = profile?.verification_status ?? 'unverified';
  const verificationConfig = VERIFICATION_STATUS_LABELS[verificationStatus] ?? VERIFICATION_STATUS_LABELS.unverified;

  const providerName =
    profile?.business_name || profile?.full_name || user?.email?.split('@')[0] || 'Partner';

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Jharkhand Diaries"
          title="Loading your provider dashboard"
          description="Pulling your listings, requests, orders, and traveller feedback together..."
        />
        <LoadingState label="Preparing your workspace..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Jharkhand Diaries"
          title="Provider Workspace"
          description="Manage your tourism services, crafts, stays, and guided experiences."
        />
        <ErrorState title="Unable to load dashboard" message={error} />
      </div>
    );
  }

  // If newly registered or existing provider with no categories, display dedicated onboarding screen
  if (capabilities.length === 0) {
    return (
      <div className="space-y-6 py-4">
        <ProviderOnboardingCard onComplete={loadDashboard} canDismiss={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Header / Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-ink-200 bg-white/95 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">
                Local Provider Ecosystem
              </span>
              {verificationStatus === 'verified' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Provider
                </span>
              ) : verificationStatus === 'under_review' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  <Clock className="h-3.5 w-3.5" />
                  Verification Pending
                </span>
              ) : (
                <Link
                  to="/provider/verification"
                  className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-ink-700 hover:bg-clay-100 hover:text-clay-800 transition-colors"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-clay-700" />
                  Verification Required
                </Link>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
              {getGreeting()}, {providerName}
            </h1>
            <p className="text-sm leading-relaxed text-ink-600 sm:text-base">
              Manage your services and connect with travellers across Jharkhand.
            </p>

            {/* Active Capabilities Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {capabilities.map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center gap-1 rounded-xl bg-sand/80 px-2.5 py-1 text-xs font-semibold text-clay-800"
                >
                  {getProviderCategoryLabel(cap)}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setShowCapabilityPicker(!showCapabilityPicker)}
                className="text-xs text-clay-700 underline font-medium hover:text-clay-900 ml-1.5"
              >
                {showCapabilityPicker ? 'Hide services setup' : 'Edit services'}
              </button>
            </div>
          </div>

          {/* Direct Public Link */}
          {user?.id && (
            <div className="flex flex-col items-end gap-2">
              <Button variant="secondary" size="sm" asChild>
                <Link to={`/providers/${user.id}`} target="_blank">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-clay-700" />
                  View Public Profile
                </Link>
              </Button>
              <span className="text-[11px] text-ink-400">Public traveller storefront</span>
            </div>
          )}
        </div>

        {/* Collapsible Capability Customizer */}
        {showCapabilityPicker && (
          <div className="mt-6 pt-6 border-t border-ink-100">
            <ProviderOnboardingCard
              onComplete={() => {
                setShowCapabilityPicker(false);
                void loadDashboard();
              }}
              canDismiss={true}
            />
          </div>
        )}
      </div>

      {/* Dynamic Type-Specific Quick Actions (Strictly for active capabilities) */}
      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
              Quick Actions
            </span>
            <h2 className="font-display text-lg font-bold text-ink-900">
              What would you like to do today?
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Accommodation actions */}
          {hasCapability('accommodation') && (
            <>
              <Button asChild size="sm">
                <Link to="/provider/stays/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Accommodation
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to="/provider/stays">Manage Stays</Link>
              </Button>
            </>
          )}

          {/* Artisan actions */}
          {hasCapability('artisan') && (
            <>
              <Button asChild size="sm">
                <Link to="/provider/products/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Product
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to="/provider/products">Manage Inventory</Link>
              </Button>
            </>
          )}

          {/* Guide actions */}
          {hasCapability('guide') && (
            <>
              <Button asChild size="sm">
                <Link to="/provider/tours/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Tour Service
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to="/provider/tours">Manage Tours</Link>
              </Button>
            </>
          )}

          {/* Adventure actions */}
          {hasCapability('adventure') && (
            <>
              <Button asChild size="sm">
                <Link to="/provider/experiences/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Experience
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to="/provider/experiences">Manage Experiences</Link>
              </Button>
            </>
          )}

          {/* Transport actions */}
          {hasCapability('transport') && (
            <>
              <Button asChild size="sm">
                <Link to="/provider/transport/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Vehicle
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to="/provider/transport">Manage Fleet</Link>
              </Button>
            </>
          )}

          <Button asChild variant="secondary" size="sm">
            <Link to="/provider/requests">View All Requests</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to="/provider/reviews">Traveller Reviews</Link>
          </Button>
        </div>
      </Card>

      {/* Dynamic Type-Specific Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Capability Specific Metric 1 */}
        {hasCapability('accommodation') && (
          <StatCard
            label="Active Accommodations"
            value={String(totalsByKind.stay)}
            detail="Homestays, lodges, and campsites"
            icon={Building2}
          />
        )}

        {hasCapability('artisan') && (
          <StatCard
            label="Handicraft Products"
            value={String(totalsByKind.product)}
            detail="Crafts, art, and silk products"
            icon={Package}
          />
        )}

        {hasCapability('guide') && (
          <StatCard
            label="Guided Tour Itineraries"
            value={String(totalsByKind.tour)}
            detail="Heritage and cultural walks"
            icon={Compass}
          />
        )}

        {hasCapability('adventure') && (
          <StatCard
            label="Adventure Experiences"
            value={String(totalsByKind.experience)}
            detail="Treks, workshops, and sports"
            icon={Sparkles}
          />
        )}

        {hasCapability('transport') && (
          <StatCard
            label="Active Vehicles"
            value={String(totalsByKind.transport)}
            detail="Cabs, SUVs, and rentals"
            icon={Car}
          />
        )}

        {/* Global Operational Metrics */}
        <StatCard
          label="Pending Requests"
          value={String(pendingRequests.length)}
          detail={pendingRequests.length > 0 ? 'Awaiting your confirmation' : 'No pending requests'}
          icon={CalendarCheck}
        />

        <StatCard
          label="Upcoming Bookings"
          value={String(acceptedRequests.length)}
          detail="Confirmed tourist itineraries"
          icon={CheckCircle2}
        />

        <StatCard
          label="Average Rating"
          value={averageRating ? `${averageRating} ★` : '—'}
          detail={reviews.length > 0 ? `From ${reviews.length} traveller reviews` : 'No reviews yet'}
          icon={Star}
        />
      </div>

      {/* Main Content Grid: Recent Requests & Profile Health */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Recent Requests Section */}
        <Card className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                Inquiries & Bookings
              </span>
              <h2 className="font-display text-lg font-bold text-ink-900">
                Recent Tourist Requests
              </h2>
            </div>
            {requests.length > 0 && (
              <Button asChild variant="secondary" size="sm">
                <Link to="/provider/requests">View all ({requests.length})</Link>
              </Button>
            )}
          </div>

          {requests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              message="When tourists discover your offerings and book stays, tours, or craft orders, they will appear here."
              actionLabel="View all services"
              actionHref="/provider/stays"
            />
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 4).map((req) => (
                <ProviderRequestCard key={req.id} request={req} />
              ))}
            </div>
          )}
        </Card>

        {/* Profile Completion & Verification Checklist */}
        <div className="space-y-6">
          <Card className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                  Trust & Profile Health
                </span>
                <h2 className="font-display text-lg font-bold text-ink-900">
                  Profile Completion
                </h2>
              </div>
              <span className="font-display text-2xl font-bold text-clay-700">
                {profileCompletion}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-clay-700 transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>

            {missingFields.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-ink-100">
                <span className="text-xs font-semibold text-ink-700 block">
                  Recommended items to complete:
                </span>
                <ul className="space-y-1 text-xs text-ink-600">
                  {missingFields.slice(0, 3).map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild size="sm" variant="secondary" className="w-full mt-2">
                  <Link to="/provider/profile">Complete Profile Details</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Your provider profile is 100% complete and ready for travellers!
              </div>
            )}
          </Card>

          {/* Verification Status Card */}
          <Card className="space-y-3 p-5 sm:p-6 bg-gradient-to-b from-white to-[#FDFBF7]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                Trust Status
              </span>
              <Badge variant={verificationConfig.badgeVariant}>
                {verificationConfig.label}
              </Badge>
            </div>
            <h3 className="font-display font-bold text-ink-900 text-sm">
              {verificationStatus === 'verified'
                ? 'Government-Verified Provider'
                : 'Become a Verified Partner'}
            </h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              {verificationConfig.description}
            </p>
            {verificationStatus !== 'verified' && (
              <Button asChild size="sm" variant="secondary" className="w-full">
                <Link to="/provider/verification">
                  {verificationStatus === 'under_review' ? 'View Submission' : 'Start Verification'}
                </Link>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider Profile Page & Capability Manager
// ---------------------------------------------------------------------------

export function ProviderProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [businessName, setBusinessName] = useState(profile?.business_name ?? profile?.full_name ?? '');
  const [ownerName, setOwnerName] = useState(profile?.owner_name ?? '');
  const [description, setDescription] = useState(profile?.description ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [district, setDistrict] = useState(profile?.district ?? '');
  const [stateName, setStateName] = useState(profile?.state ?? 'Jharkhand');
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(profile?.cover_image_url ?? '');
  const [selectedCapabilities, setSelectedCapabilities] = useState<ProviderCapability[]>(
    (profile?.provider_categories ?? []) as ProviderCapability[]
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setBusinessName(profile?.business_name ?? profile?.full_name ?? '');
    setOwnerName(profile?.owner_name ?? '');
    setDescription(profile?.description ?? '');
    setPhone(profile?.phone ?? '');
    setAddress(profile?.address ?? '');
    setDistrict(profile?.district ?? '');
    setStateName(profile?.state ?? 'Jharkhand');
    setWebsiteUrl(profile?.website_url ?? '');
    setAvatarUrl(profile?.avatar_url ?? '');
    setCoverImageUrl(profile?.cover_image_url ?? '');
    setSelectedCapabilities((profile?.provider_categories ?? []) as ProviderCapability[]);
  }, [profile]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setMessage('Please sign in again to update your profile.');
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await updateProfile(user.id, {
        full_name: businessName.trim(),
        business_name: businessName.trim() || null,
        owner_name: ownerName.trim() || null,
        description: description.trim() || null,
        phone: phone.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        address: address.trim() || null,
        district: district.trim() || null,
        state: stateName.trim() || null,
        website_url: websiteUrl.trim() || null,
        provider_categories: selectedCapabilities,
      });

      await refreshProfile();
      setMessage('Profile updated successfully.');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Identity & Offerings"
        title="Provider Profile & Capabilities"
        description="Configure your business details, contact information, and active service capabilities."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="border-b border-ink-100 pb-3">
            <h2 className="font-display text-lg font-bold text-ink-900">
              1. Business Details
            </h2>
          </div>

          {message && (
            <div className="rounded-2xl border border-ink-200 bg-sand p-3.5 text-sm text-ink-800 font-medium">
              {message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Business / Organization Name *
              </span>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Netarhat Eco Retreat / Santhal Handloom Collective"
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Owner / Representative Name
              </span>
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Anuja Kumari"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                About Your Business & Tourism Mission
              </span>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell travellers what makes your offerings special, your cultural roots, and your local community impact."
                rows={4}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Contact Phone
                </span>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9XXXXXXXXX"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Email
                </span>
                <Input value={profile?.email ?? user?.email ?? ''} readOnly className="bg-sand/40" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                  District
                </span>
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Latehar / Ranchi / Khunti"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                  State
                </span>
                <Input value={stateName} onChange={(e) => setStateName(e.target.value)} />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Operating Address
              </span>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Village / Town, Landmark"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Website / Social URL
              </span>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Profile / Logo URL
                </span>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Cover Photo URL
                </span>
                <Input
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>

            {/* Capability Selector embedded */}
            <div className="pt-4 border-t border-ink-100 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                2. Active Service Capabilities (Multi-select)
              </span>
              <ProviderCapabilitySelector
                selected={selectedCapabilities}
                onChange={setSelectedCapabilities}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving Profile...' : 'Save All Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Live Public Profile Preview Snapshot */}
        <div className="space-y-6">
          <Card className="space-y-4 p-5 sm:p-6 bg-white shadow-sm border border-ink-200">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
              Public Preview Card
            </span>
            <div className="rounded-2xl border border-ink-200 overflow-hidden bg-sand/30">
              <div className="h-32 bg-sand w-full overflow-hidden">
                {coverImageUrl ? (
                  <img src={coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-clay-700 to-ink-900" />
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-ink-900 text-lg">
                    {businessName || 'Business Name'}
                  </h3>
                  <Badge variant="accent">
                    {selectedCapabilities.length > 0
                      ? `${selectedCapabilities.length} Services`
                      : 'Unassigned'}
                  </Badge>
                </div>
                <p className="text-xs text-ink-600 line-clamp-2">
                  {description || 'No description provided yet.'}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-clay-800 pt-1 font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  {district ? `${district}, Jharkhand` : 'Jharkhand'}
                </div>
              </div>
            </div>

            {user?.id && (
              <Button asChild variant="secondary" size="sm" className="w-full">
                <Link to={`/providers/${user.id}`} target="_blank">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Open Live Storefront
                </Link>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider Reviews Page
// ---------------------------------------------------------------------------

export function ProviderReviewsPage() {
  const [listings, setListings] = useState<Destination[]>([]);
  const [reviews, setReviews] = useState<ReviewWithDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const providerListings = await getMyProviderListings();
        const reviewRows = await getReviewsForDestinationIds(providerListings.map((l) => l.id));

        setListings(providerListings);
        setReviews(reviewRows);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    void loadReviews();
  }, []);

  const averageRating = getAverageRating(reviews);

  if (loading) {
    return <LoadingState label="Loading traveller reviews..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load reviews" message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Traveller Feedback"
        title="Customer Reviews & Ratings"
        description="Authentic feedback and ratings left by verified travellers across your listings and services."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Reviews"
          value={String(reviews.length)}
          detail="Feedback across all offerings"
          icon={Users}
        />
        <StatCard
          label="Average Rating"
          value={averageRating ? `${averageRating} ★` : '—'}
          detail="Calculated from real reviews"
          icon={Star}
        />
        <StatCard
          label="Managed Destinations"
          value={String(listings.length)}
          detail="Locations linked to your account"
          icon={Store}
        />
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          message="Traveller reviews will appear here once visitors explore your destinations and complete bookings."
          actionLabel="View Dashboard"
          actionHref="/provider/dashboard"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ProviderReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

// Re-exports of modular pages for backward compatibility
export { ProviderVerificationPage } from './ProviderVerificationPage';
export { ProviderAnalyticsPage } from './ProviderAnalyticsPage';
