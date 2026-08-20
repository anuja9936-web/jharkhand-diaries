import { useEffect, useMemo, useState, type ComponentType, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Coins,
  Heart,
  Leaf,
  Map,
  MapPin,
  MessageSquareText,
  Mountain,
  Sparkles,
  Trash2,
  Waves,
} from 'lucide-react';
import { Badge, Button, Card, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/StateBlocks';
import { FavouriteButton } from '../../components/destinations/FavouriteButton';
import { DestinationCard } from '../../components/destinations/DestinationCard';
import { AddToTripModal } from '../../components/destinations/AddToTripModal';
import {
  DEFAULT_DESTINATION_IMAGE,
  getDestinationCategoryLabel,
  getDestinationStatusLabel,
} from '../../constants/destinations';
import { useAuth } from '../../hooks/useAuth';
import { useTouristFavourites } from '../../hooks/useTouristFavourites';
import { formatIndianCurrency } from '../../lib/utils';
import { getDestinationBySlug, getRelatedDestinations } from '../../services/destinations/destinationService';
import {
  deleteReview,
  getDestinationReviewSummary,
  saveDestinationReview,
  type DestinationReviewSummary,
} from '../../services/reviews/reviewService';
import { getPublishedOfferingsByDistrict } from '../../services/provider/publicOfferingService';
import { getActivePublicAlerts } from '../../services/admin/adminGovernanceService';
import type { TourismAlert } from '../../types/admin';
import type { Destination } from '../../types/destination';
import type { ProviderOffering } from '../../types/provider';

// ─── Helper functions ─────────────────────────────────────────────────────────

function renderStars(rating: number) {
  return '★★★★★'.slice(0, rating).padEnd(5, '☆');
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const width = total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-10 font-medium text-ink-700">{rating}★</span>
      <div className="h-2 flex-1 rounded-full bg-ink-100">
        <div className="h-2 rounded-full bg-clay-500" style={{ width }} />
      </div>
      <span className="w-10 text-right text-ink-500">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: DestinationReviewSummary['reviews'][number] }) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{review.reviewer_name}</h3>
          <p className="text-sm text-ink-600">{formatReviewDate(review.created_at)}</p>
        </div>
        <Badge variant="accent">{renderStars(review.rating)}</Badge>
      </div>
      <p className="text-sm leading-6 text-ink-700">{review.review_text || 'No review text added yet.'}</p>
      {review.reviewer_avatar_url ? (
        <div className="flex items-center gap-3 rounded-2xl bg-sand/70 px-3 py-2 text-xs text-ink-600">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-700">
            <Heart className="h-4 w-4" />
          </span>
          Verified traveller profile available
        </div>
      ) : null}
    </Card>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="bg-white/90 py-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-sand p-3 text-ink-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">{label}</p>
          <p className="mt-1 text-sm font-medium text-ink-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function OfferingCard({ offering, kind }: { offering: ProviderOffering; kind: 'experience' | 'stay' }) {
  const href = kind === 'experience' ? `/experiences/${offering.id}` : `/stays/${offering.id}`;
  return (
    <Card className="group overflow-hidden p-0 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg">
      {offering.cover_image ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          <img
            src={offering.cover_image}
            alt={offering.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
        </div>
      ) : null}
      <div className="space-y-2 p-4">
        <h4 className="font-semibold text-ink-900">{offering.name}</h4>
        {offering.district && (
          <p className="text-xs text-ink-500 inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {offering.district}
          </p>
        )}
        <p className="text-sm text-ink-600 line-clamp-2">{offering.short_description}</p>
        {offering.price && (
          <p className="text-sm font-semibold text-clay-800">
            {formatIndianCurrency(offering.price)}
          </p>
        )}
        <Button asChild variant="secondary" className="w-full mt-2">
          <Link to={href} className="inline-flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            {kind === 'experience' ? 'View Experience' : 'View Stay'}
          </Link>
        </Button>
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { role } = useAuth();
  const { isAuthenticated, isTourist, isFavourite, pendingDestinationId, toggleFavourite } =
    useTouristFavourites();

  // Destination
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reviews
  const [summary, setSummary] = useState<DestinationReviewSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewDeleting, setReviewDeleting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Related destinations
  const [related, setRelated] = useState<Destination[]>([]);

  // Nearby offerings
  const [nearbyExperiences, setNearbyExperiences] = useState<ProviderOffering[]>([]);
  const [nearbyStays, setNearbyStays] = useState<ProviderOffering[]>([]);

  // Active Government Tourism Advisories
  const [activeAlerts, setActiveAlerts] = useState<TourismAlert[]>([]);

  // Add-to-trip modal
  const [showAddToTrip, setShowAddToTrip] = useState(false);

  const destinationId = destination?.id ?? null;
  const myReview = summary?.myReview ?? null;

  // ── Load destination ───────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;

    async function load() {
      if (!slug) {
        if (alive) { setError('Missing destination slug.'); setIsLoading(false); }
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const result = await getDestinationBySlug(slug);
        if (alive) setDestination(result);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load destination.');
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    void load();
    return () => { alive = false; };
  }, [slug]);

  // ── Load active government travel advisories ─────────────────────────────
  useEffect(() => {
    if (!destination) return;
    let alive = true;

    async function loadAlerts() {
      try {
        const alertsData = await getActivePublicAlerts({
          district: destination!.district,
          destinationId: destination!.id,
        });
        if (alive) setActiveAlerts(alertsData);
      } catch {
        /* gracefully ignore alert loading error */
      }
    }

    void loadAlerts();
    return () => { alive = false; };
  }, [destination]);

  // ── Load reviews ───────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;

    async function loadReviews() {
      if (!destinationId) { setSummary(null); setSummaryLoading(false); return; }
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const result = await getDestinationReviewSummary(destinationId);
        if (alive) setSummary(result);
      } catch (e) {
        if (alive) setSummaryError(e instanceof Error ? e.message : 'Unable to load reviews.');
      } finally {
        if (alive) setSummaryLoading(false);
      }
    }

    void loadReviews();
    return () => { alive = false; };
  }, [destinationId]);

  // ── Load related & nearby once destination is known ────────────────────────
  useEffect(() => {
    if (!destination) return;
    let alive = true;

    async function loadRelated() {
      try {
        const data = await getRelatedDestinations(destination!.id, destination!.category, destination!.district);
        if (alive) setRelated(data);
      } catch { /* silently skip */ }
    }

    async function loadNearby() {
      try {
        const [exps, stays] = await Promise.all([
          getPublishedOfferingsByDistrict(destination!.district, 'experience', 4),
          getPublishedOfferingsByDistrict(destination!.district, 'stay', 4),
        ]);
        if (alive) {
          setNearbyExperiences(exps);
          setNearbyStays(stays);
        }
      } catch { /* gracefully hide if unavailable */ }
    }

    void loadRelated();
    void loadNearby();
    return () => { alive = false; };
  }, [destination]);

  // ── Sync review form with existing review ─────────────────────────────────
  useEffect(() => {
    if (myReview) {
      setReviewRating(myReview.rating);
      setReviewText(myReview.review_text ?? '');
    } else {
      setReviewRating(5);
      setReviewText('');
    }
  }, [myReview]);

  // ── Rating breakdown ───────────────────────────────────────────────────────
  const ratingBreakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: summary?.reviews.filter((r) => r.rating === rating).length ?? 0,
      })),
    [summary?.reviews]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggleFavourite = async () => {
    if (!destination) return;
    try {
      await toggleFavourite(destination.id);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Unable to update favourites.');
    }
  };

  const handleSaveReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!destination) return;
    if (!isAuthenticated) { setReviewMessage('Please sign in to write a review.'); return; }
    if (!isTourist) { setReviewMessage('Only tourist accounts can write reviews.'); return; }
    const trimmed = reviewText.trim();
    if (!trimmed) { setReviewMessage('Please write a short review before submitting.'); return; }
    try {
      setReviewSaving(true);
      setReviewMessage(null);
      await saveDestinationReview({ destinationId: destination.id, rating: reviewRating, reviewText: trimmed });
      setReviewMessage('Your review has been saved.');
      const refreshed = await getDestinationReviewSummary(destination.id);
      setSummary(refreshed);
    } catch (e) {
      setReviewMessage(e instanceof Error ? e.message : 'Unable to save your review.');
    } finally {
      setReviewSaving(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!summary?.myReview) return;
    if (!window.confirm('Delete your review?')) return;
    try {
      setReviewDeleting(true);
      setReviewMessage(null);
      await deleteReview(summary.myReview.id);
      setReviewMessage('Your review has been deleted.');
      const refreshed = await getDestinationReviewSummary(destination?.id ?? summary.myReview.destination_id);
      setSummary(refreshed);
    } catch (e) {
      setReviewMessage(e instanceof Error ? e.message : 'Unable to delete your review.');
    } finally {
      setReviewDeleting(false);
    }
  };

  // ── Loading / error guards ─────────────────────────────────────────────────
  if (isLoading) return <LoadingState label="Loading destination details…" />;
  if (error) return <ErrorState title="Unable to load destination" message={error} />;
  if (!destination) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-dashed border-ink-300 bg-white/80 text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-ink-900">Destination not found</h1>
            <p className="text-sm leading-6 text-ink-600">
              This destination may not exist yet or may still be in draft status.
            </p>
            <Button asChild variant="secondary">
              <Link to="/explore">Back to Explore</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const coverImage = destination.cover_image || DEFAULT_DESTINATION_IMAGE;
  const totalReviews = summary?.reviews.length ?? 0;
  const averageRating = summary?.averageRating ?? null;

  return (
    <>
      {/* Add-to-Trip Modal */}
      {showAddToTrip && (
        <AddToTripModal
          destinationId={destination.id}
          destinationName={destination.name}
          onClose={() => setShowAddToTrip(false)}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary">
            <Link to="/explore" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Link>
          </Button>
          <Badge variant="accent">{getDestinationCategoryLabel(destination.category)}</Badge>
          {destination.eco_zone && (
            <Badge variant="success" className="inline-flex items-center gap-1">
              <Leaf className="h-3.5 w-3.5" />
              Eco zone
            </Badge>
          )}
          <Badge variant="warning">{getDestinationStatusLabel(destination.status)}</Badge>
        </div>

        {/* ── Active Government Tourism Advisories ─────────────────────────── */}
        {activeAlerts.length > 0 && (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl border p-4 sm:p-5 flex items-start gap-3.5 shadow-xs ${
                  alert.severity === 'critical'
                    ? 'border-red-300 bg-red-50 text-red-950'
                    : alert.severity === 'warning'
                      ? 'border-amber-300 bg-amber-50 text-amber-950'
                      : 'border-blue-200 bg-blue-50 text-blue-950'
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 shrink-0 mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                  }`}
                />
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm">{alert.title}</span>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {alert.severity} Advisory
                    </span>
                  </div>
                  <p className="leading-relaxed opacity-90">{alert.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] opacity-75 pt-1">
                    <span>
                      Issued by: <strong>Jharkhand Tourism Administration</strong>
                    </span>
                    {alert.end_date && <span>Valid until: {alert.end_date}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          <img
            src={coverImage}
            alt={destination.name}
            className="h-72 sm:h-[26rem] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />

          {/* Favourite */}
          <div className="absolute right-5 top-5">
            <FavouriteButton
              isFavourite={isFavourite(destination.id)}
              loading={pendingDestinationId === destination.id}
              canSave={isAuthenticated ? isTourist : true}
              onToggle={isAuthenticated && isTourist ? () => void handleToggleFavourite() : undefined}
              compact
              loginHref="/login"
              saveLabel="Save"
              savedLabel="Saved"
              loginLabel="Login to save"
              touristOnlyLabel="Tourist only"
            />
          </div>

          {/* Bottom hero content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white">
              {destination.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-clay-300" />
                {destination.district}, Jharkhand
              </span>
              {destination.best_time && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-clay-300" />
                  Best: {destination.best_time}
                </span>
              )}
              {destination.entry_fee != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-clay-300" />
                  {formatIndianCurrency(destination.entry_fee)}
                </span>
              )}
            </div>

            {/* Action buttons on hero */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="primary"
                className="bg-amber-400 text-ink-950 hover:bg-amber-300"
                onClick={() => setShowAddToTrip(true)}
              >
                + Add to My Trip
              </Button>
              <Button asChild variant="secondary" className="border-white/30 text-white hover:bg-white/10 bg-white/10 backdrop-blur-sm">
                <Link to={`/map?destination=${destination.slug}`} className="inline-flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  View on Map
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Quick info + Description ────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Description */}
          <Card className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">About</p>
              <p className="mt-3 text-sm leading-7 text-ink-700">
                {destination.description || destination.short_description || 'Full destination description will be added from the database.'}
              </p>
            </div>

            {/* Gallery */}
            {destination.gallery && destination.gallery.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">Gallery</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {destination.gallery.slice(0, 4).map((item, index) => (
                    <img
                      key={`${destination.slug}-gallery-${index}`}
                      src={item}
                      alt={`${destination.name} gallery ${index + 1}`}
                      className="h-36 w-full rounded-2xl object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </Card>

          {/* Info rows */}
          <div className="space-y-3">
            <InfoRow icon={MapPin} label="District" value={destination.district} />
            <InfoRow icon={CalendarDays} label="Best time to visit" value={destination.best_time || 'Check locally'} />
            <InfoRow icon={Coins} label="Entry fee" value={formatIndianCurrency(destination.entry_fee)} />
            <InfoRow
              icon={Waves}
              label="Eco zone"
              value={destination.eco_zone ? 'Yes — protected eco zone' : 'Standard zone'}
            />
            <InfoRow
              icon={Mountain}
              label="GPS Coordinates"
              value={
                destination.latitude != null && destination.longitude != null
                  ? `${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`
                  : 'Location data unavailable'
              }
            />
            <Card className="bg-gradient-to-br from-clay-50 to-sand border-clay-200">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-clay-700 shrink-0" />
                <div>
                  <p className="font-semibold text-ink-900 text-sm">Plan your visit</p>
                  <p className="mt-1 text-xs text-ink-600 leading-relaxed">
                    Add this destination to your trip planner or find a local guide for a curated experience.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="primary" onClick={() => setShowAddToTrip(true)} className="flex-1">
                  + Add to Trip
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/experiences">Find Guide</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Experiences Nearby ──────────────────────────────────────────── */}
        {nearbyExperiences.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">Experiences Nearby</p>
                <h2 className="mt-1 text-2xl font-bold text-ink-900">Things to Do</h2>
              </div>
              <Button asChild variant="secondary">
                <Link to="/experiences" className="inline-flex items-center gap-2">
                  All Experiences <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {nearbyExperiences.map((o) => (
                <OfferingCard key={o.id} offering={o} kind="experience" />
              ))}
            </div>
          </div>
        )}

        {/* ── Stay Nearby ─────────────────────────────────────────────────── */}
        {nearbyStays.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">Stay Nearby</p>
                <h2 className="mt-1 text-2xl font-bold text-ink-900">Where to Sleep</h2>
              </div>
              <Button asChild variant="secondary">
                <Link to="/accommodations" className="inline-flex items-center gap-2">
                  All Stays <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {nearbyStays.map((o) => (
                <OfferingCard key={o.id} offering={o} kind="stay" />
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews ─────────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">Ratings & Reviews</h2>
                <p className="mt-1 text-sm text-ink-600">
                  What travellers are saying about this destination.
                </p>
              </div>
              <Badge variant="accent">{totalReviews} reviews</Badge>
            </div>

            {summaryLoading ? (
              <LoadingState label="Loading reviews…" />
            ) : summaryError ? (
              <ErrorState title="Unable to load reviews" message={summaryError} />
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="bg-sand">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Average rating</p>
                    <div className="mt-3 flex items-end gap-3">
                      <span className="text-4xl font-bold text-ink-900">
                        {averageRating ? averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="pb-1 text-sm text-ink-600">/ 5</span>
                    </div>
                    <p className="mt-2 text-sm text-ink-600">
                      {averageRating ? renderStars(Math.round(averageRating)) : 'No ratings yet'}
                    </p>
                  </Card>
                  <Card>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Total reviews</p>
                    <p className="mt-3 text-4xl font-bold text-ink-900">{totalReviews}</p>
                    <p className="mt-2 text-sm text-ink-600">Feedback from fellow travellers</p>
                  </Card>
                </div>

                {summary && summary.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {ratingBreakdown.map((item) => (
                      <RatingBar key={item.rating} rating={item.rating} count={item.count} total={summary.reviews.length} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No reviews yet"
                    message="Be the first traveller to share your experience at this destination."
                  />
                )}
              </div>
            )}
          </Card>

          <Card className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">Write a Review</h2>
                <p className="mt-1 text-sm text-ink-600">Share your own experience.</p>
              </div>
              {role ? <Badge variant="accent">{role}</Badge> : null}
            </div>

            {reviewMessage ? (
              <div className="rounded-2xl border border-clay-200 bg-sand px-4 py-3 text-sm text-ink-700">
                {reviewMessage}
              </div>
            ) : null}

            {!isAuthenticated ? (
              <Card className="border-dashed border-ink-300 bg-white/80">
                <div className="space-y-4">
                  <p className="text-sm leading-6 text-ink-600">Login to write a review and save your travel notes.</p>
                  <Button asChild>
                    <Link to="/login">Login to write a review</Link>
                  </Button>
                </div>
              </Card>
            ) : !isTourist ? (
              <Card className="border-dashed border-ink-300 bg-white/80">
                <p className="text-sm leading-6 text-ink-600">Only tourist accounts can write destination reviews.</p>
              </Card>
            ) : (
              <form className="space-y-4" onSubmit={handleSaveReview}>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink-700">Rating</span>
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        className={[
                          'rounded-2xl border px-3 py-3 text-sm font-semibold transition',
                          reviewRating === rating
                            ? 'border-clay-400 bg-clay-100 text-ink-900'
                            : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
                        ].join(' ')}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink-700">Review text</span>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell other travellers what stood out to you…"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={reviewSaving}>
                    <MessageSquareText className="h-4 w-4" />
                    {reviewSaving ? 'Saving…' : summary?.myReview ? 'Update Review' : 'Submit Review'}
                  </Button>
                  {myReview ? (
                    <Button type="button" variant="danger" onClick={() => void handleDeleteReview()} disabled={reviewDeleting}>
                      <Trash2 className="h-4 w-4" />
                      {reviewDeleting ? 'Deleting…' : 'Delete Review'}
                    </Button>
                  ) : null}
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* ── All reviews list ───────────────────────────────────────────── */}
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink-900">Traveller Reviews</h2>
              <p className="mt-1 text-sm text-ink-600">Recent feedback from the community.</p>
            </div>
            <Badge variant="accent">{totalReviews} total</Badge>
          </div>
          {summary?.reviews.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {summary.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Be the first to share"
              message="No reviews yet — once travellers start sharing experiences, the latest comments will appear here."
            />
          )}
        </Card>

        {/* ── Related destinations ───────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">You May Also Like</p>
              <h2 className="mt-1 text-2xl font-bold text-ink-900">Similar Destinations</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((d) => (
                <DestinationCard
                  key={d.id}
                  destination={d}
                />
              ))}
            </div>
            <div className="text-center">
              <Button asChild variant="secondary">
                <Link to="/explore" className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Explore All Destinations
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
