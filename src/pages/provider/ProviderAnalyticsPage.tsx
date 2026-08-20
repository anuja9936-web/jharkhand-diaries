import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  Info,
  Package,
  Sparkles,
  Star,
} from 'lucide-react';
import { Card } from '../../components/ui';
import { PageHeader, StatCard, LoadingState, ErrorState } from '../../components/common/StateBlocks';
import {
  getMyProviderOfferings,
  getMyProviderRequests,
  type ProviderRequestWithOffering,
} from '../../services/provider/providerMarketplaceService';
import { getMyProviderListings } from '../../services/provider/providerService';
import { getReviewsForDestinationIds } from '../../services/reviews/reviewService';
import type { Destination } from '../../types/destination';
import type { ProviderOffering, ProviderOfferingKind } from '../../types/provider';
import type { ReviewWithDestination } from '../../services/reviews/reviewService';

export function ProviderAnalyticsPage() {
  const [listings, setListings] = useState<Destination[]>([]);
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [requests, setRequests] = useState<ProviderRequestWithOffering[]>([]);
  const [reviews, setReviews] = useState<ReviewWithDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [listingsRes, offeringsRes, requestsRes] = await Promise.all([
          getMyProviderListings().catch(() => []),
          getMyProviderOfferings().catch(() => []),
          getMyProviderRequests().catch(() => []),
        ]);

        setListings(listingsRes);
        setOfferings(offeringsRes);
        setRequests(requestsRes);

        if (listingsRes.length > 0) {
          try {
            const reviewRows = await getReviewsForDestinationIds(listingsRes.map((l) => l.id));
            setReviews(reviewRows);
          } catch {
            setReviews([]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

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

  const requestsByStatus = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === 'pending').length,
      accepted: requests.filter((r) => r.status === 'accepted').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      completed: requests.filter((r) => r.status === 'completed').length,
      cancelled: requests.filter((r) => r.status === 'cancelled').length,
    };
  }, [requests]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const acceptanceRate = useMemo(() => {
    const decided = requestsByStatus.accepted + requestsByStatus.rejected;
    if (decided === 0) return '—';
    return `${Math.round((requestsByStatus.accepted / decided) * 100)}%`;
  }, [requestsByStatus]);

  if (loading) {
    return <LoadingState label="Calculating real operational metrics..." />;
  }

  if (error) {
    return <ErrorState title="Analytics Unavailable" message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Business Insights"
        title="Provider Analytics"
        description="Real-time performance metrics for your listings, tourist bookings, requests, and traveller ratings."
      />

      {/* Notice on transactions */}
      <Card className="flex items-start gap-3 border border-sand bg-sand/40 p-4 text-xs text-ink-700">
        <Info className="h-4 w-4 text-clay-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-ink-900">Live operational data only</p>
          <p className="mt-0.5 text-ink-600">
            Revenue and payment settlement analytics will be enabled when direct in-app transactions and payment processing are activated in a future phase.
          </p>
        </div>
      </Card>

      {/* Top High-level Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Offerings"
          value={String(offerings.length + listings.length)}
          detail={`${offerings.filter((o) => o.status === 'published').length} published active`}
          icon={Package}
        />
        <StatCard
          label="Tourist Requests"
          value={String(requests.length)}
          detail={`${requestsByStatus.pending} pending action`}
          icon={CalendarCheck}
        />
        <StatCard
          label="Acceptance Rate"
          value={acceptanceRate}
          detail="Accepted vs decided requests"
          icon={CheckCircle2}
        />
        <StatCard
          label="Average Rating"
          value={averageRating ? `${averageRating} ★` : '—'}
          detail={`Based on ${reviews.length} traveller reviews`}
          icon={Star}
        />
      </div>

      {/* Capability Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-ink-900 border-b border-ink-100 pb-2">
            Offerings by Service Category
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1.5 border-b border-ink-100 text-sm">
              <span className="flex items-center gap-2 text-ink-700">
                <Building2 className="h-4 w-4 text-clay-700" />
                Accommodations / Stays
              </span>
              <span className="font-bold text-ink-900">{totalsByKind.stay}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-ink-100 text-sm">
              <span className="flex items-center gap-2 text-ink-700">
                <Package className="h-4 w-4 text-clay-700" />
                Artisan Products & Crafts
              </span>
              <span className="font-bold text-ink-900">{totalsByKind.product}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-ink-100 text-sm">
              <span className="flex items-center gap-2 text-ink-700">
                <Compass className="h-4 w-4 text-clay-700" />
                Tours & Guiding Itineraries
              </span>
              <span className="font-bold text-ink-900">{totalsByKind.tour}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-ink-100 text-sm">
              <span className="flex items-center gap-2 text-ink-700">
                <Sparkles className="h-4 w-4 text-clay-700" />
                Adventure & Cultural Experiences
              </span>
              <span className="font-bold text-ink-900">{totalsByKind.experience}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 text-sm">
              <span className="flex items-center gap-2 text-ink-700">
                <Car className="h-4 w-4 text-clay-700" />
                Transport Services & Rentals
              </span>
              <span className="font-bold text-ink-900">{totalsByKind.transport}</span>
            </div>
          </div>
        </Card>

        {/* Requests Funnel */}
        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-ink-900 border-b border-ink-100 pb-2">
            Tourist Request Status Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1.5 border-b border-ink-100 text-sm">
              <span className="flex items-center gap-2 text-amber-700 font-medium">
                <Clock className="h-4 w-4" />
                Pending Review
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                {requestsByStatus.pending}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-ink-100 text-sm">
              <span className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Accepted Bookings
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {requestsByStatus.accepted}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-ink-100 text-sm">
              <span className="flex items-center gap-2 text-red-700 font-medium">
                Declined / Rejected
              </span>
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-800">
                {requestsByStatus.rejected}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 text-sm">
              <span className="flex items-center gap-2 text-ink-700 font-medium">
                Completed
              </span>
              <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-bold text-ink-800">
                {requestsByStatus.completed}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
