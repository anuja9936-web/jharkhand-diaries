import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Heart, MapPin, PencilLine, Plus, Star, Trash2 } from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/StateBlocks';
import { DEFAULT_DESTINATION_IMAGE, getDestinationCategoryLabel } from '../../constants/destinations';
import { useAuth } from '../../hooks/useAuth';
import { useTouristFavourites } from '../../hooks/useTouristFavourites';
import { formatIndianCurrency } from '../../lib/utils';
import { getUserReviews, type UserReviewWithDestination } from '../../services/reviews/reviewService';
import { deleteTrip, getUserTrips } from '../../services/trips/tripService';
import type { Destination } from '../../types/destination';
import type { TripRecord } from '../../types/tourist';

function renderStars(rating: number) {
  return '★★★★★'.slice(0, rating).padEnd(5, '☆');
}

function formatTripDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) {
    return 'Dates not set';
  }

  if (startDate && endDate) {
    return `${new Date(startDate).toLocaleDateString('en-IN')} - ${new Date(endDate).toLocaleDateString('en-IN')}`;
  }

  return startDate ? new Date(startDate).toLocaleDateString('en-IN') : new Date(endDate ?? '').toLocaleDateString('en-IN');
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function SavedDestinationCard({
  destination,
  onRemove,
  removing,
}: {
  destination: Destination;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="aspect-[4/3] bg-sand">
        <img
          src={destination.cover_image || DEFAULT_DESTINATION_IMAGE}
          alt={destination.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-ink-900">{destination.name}</h3>
              <p className="text-sm text-ink-600">{destination.district}</p>
            </div>
            <Badge variant="accent">{getDestinationCategoryLabel(destination.category)}</Badge>
          </div>
          <p className="text-sm leading-6 text-ink-600">
            {destination.short_description || destination.description || 'Destination details available in the public explorer.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to={`/destinations/${destination.slug}`} className="inline-flex items-center gap-2">
              View Destination
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button type="button" variant="danger" onClick={onRemove} disabled={removing}>
            <Trash2 className="h-4 w-4" />
            {removing ? 'Removing...' : 'Remove Favourite'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TripCard({
  trip,
  onDelete,
  deleting,
}: {
  trip: TripRecord;
  onDelete: () => void;
  deleting: boolean;
}) {
  const destinationCount = trip.trip_destinations?.length ?? 0;
  const now = new Date();
  const isCompleted = trip.end_date ? new Date(trip.end_date) < now : false;
  const isUpcoming = trip.start_date ? new Date(trip.start_date) > now : false;
  const tripStatus = isCompleted ? 'Completed' : isUpcoming ? 'Upcoming' : 'Planning';
  const statusVariant = isCompleted ? 'neutral' : isUpcoming ? 'success' : 'accent';

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge variant="accent">Trip</Badge>
          <h3 className="text-lg font-semibold text-ink-900">{trip.title}</h3>
          <Badge variant={statusVariant as 'neutral' | 'success' | 'warning' | 'accent'}>{tripStatus}</Badge>
          <div className="flex flex-wrap gap-3 text-sm text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatTripDateRange(trip.start_date, trip.end_date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {destinationCount} stops
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-sand p-3 text-clay-700">
          <Heart className="h-5 w-5" />
        </div>
      </div>

      <p className="text-sm leading-6 text-ink-600">
        {trip.start_location || 'Start location not set yet.'}
        {trip.notes ? ` ${trip.notes}` : ''}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <Link to={`/tourist/itinerary/${trip.id}`} className="inline-flex items-center gap-2">
            View Trip
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to={`/tourist/itinerary/${trip.id}`} className="inline-flex items-center gap-2">
            <PencilLine className="h-4 w-4" />
            Edit
          </Link>
        </Button>
        <Button type="button" variant="danger" onClick={onDelete} disabled={deleting}>
          <Trash2 className="h-4 w-4" />
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      <div className="rounded-2xl bg-white/80 p-4 text-sm text-ink-700">
        <div className="flex items-center gap-2 font-semibold text-ink-900">
          <Plus className="h-4 w-4 text-clay-700" />
          Budget: {formatIndianCurrency(trip.budget)}
        </div>
      </div>
    </Card>
  );
}

function ReviewCard({
  review,
}: {
  review: UserReviewWithDestination;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{review.destination?.name ?? 'Destination review'}</h3>
          <p className="text-sm text-ink-600">{review.destination?.district ?? 'Destination details unavailable'}</p>
        </div>
        <Badge variant="accent">{renderStars(review.rating)}</Badge>
      </div>

      <p className="text-sm leading-6 text-ink-700">{review.review_text || 'No review text added yet.'}</p>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">
        <span>Reviewed {formatReviewDate(review.created_at)}</span>
        {review.destination?.slug ? (
          <Button asChild variant="secondary">
            <Link to={`/destinations/${review.destination.slug}`}>View Destination</Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

export function TouristDashboardPage() {
  const { profile } = useAuth();
  const {
    favourites,
    loading: favouritesLoading,
    error: favouritesError,
    pendingDestinationId,
    removeFavourite: removeSavedFavourite,
    refresh: refreshFavourites,
  } = useTouristFavourites();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<UserReviewWithDestination[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [savedError, setSavedError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadTrips() {
      try {
        setTripsLoading(true);
        setTripsError(null);
        const records = await getUserTrips();
        if (alive) {
          setTrips(records);
        }
      } catch (error) {
        if (alive) {
          setTripsError(error instanceof Error ? error.message : 'Unable to load your trips.');
        }
      } finally {
        if (alive) {
          setTripsLoading(false);
        }
      }
    }

    async function loadReviews() {
      try {
        setReviewsLoading(true);
        setReviewsError(null);
        const records = await getUserReviews();
        if (alive) {
          setReviews(records);
        }
      } catch (error) {
        if (alive) {
          setReviewsError(error instanceof Error ? error.message : 'Unable to load your reviews.');
        }
      } finally {
        if (alive) {
          setReviewsLoading(false);
        }
      }
    }

    void loadTrips();
    void loadReviews();

    return () => {
      alive = false;
    };
  }, []);

  const savedDestinations = useMemo(
    () => favourites.map((favourite) => favourite.destination).filter(Boolean) as Destination[],
    [favourites]
  );

  const startOfToday = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const upcomingTrips = trips.filter((trip) => {
    if (!trip.start_date) {
      return false;
    }

    return new Date(trip.start_date) >= startOfToday;
  });

  const handleRemoveFavourite = async (destinationId: string) => {
    try {
      setSavedError(null);
      await removeSavedFavourite(destinationId);
      await refreshFavourites();
    } catch (error) {
      setSavedError(error instanceof Error ? error.message : 'Unable to update your saved destinations.');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    const confirmed = window.confirm('Delete this trip?');
    if (!confirmed) {
      return;
    }

    setDeletingTripId(tripId);

    try {
      await deleteTrip(tripId);
      const refreshed = await getUserTrips();
      setTrips(refreshed);
    } catch (error) {
      setTripsError(error instanceof Error ? error.message : 'Unable to delete trip.');
    } finally {
      setDeletingTripId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tourist dashboard"
        title={`Welcome back, ${profile?.full_name ?? profile?.email ?? 'Traveller'} 👋`}
        description="Your saved places, trips, reviews, and profile shortcuts all live here."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/explore">Explore Destinations</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/tourist/itinerary/new">Create Trip</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Saved Destinations"
          value={String(savedDestinations.length)}
          detail="Your favourite Jharkhand places"
          icon={Heart}
        />
        <StatCard label="My Trips" value={String(trips.length)} detail="Planned itineraries" icon={MapPin} />
        <StatCard label="Upcoming Trips" value={String(upcomingTrips.length)} detail="Journeys on the calendar" icon={CalendarDays} />
        <StatCard label="My Reviews" value={String(reviews.length)} detail="Stories you have shared" icon={Star} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card id="saved-destinations" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink-900">Saved Destinations</h2>
              <p className="mt-1 text-sm text-ink-600">Your real favourites are loaded from Supabase.</p>
            </div>
            <Badge variant="accent">{savedDestinations.length} saved</Badge>
          </div>

          {savedError ? <ErrorState title="Saved destinations update failed" message={savedError} /> : null}

          {favouritesLoading ? (
            <LoadingState label="Loading saved destinations..." />
          ) : favouritesError ? (
            <ErrorState title="Unable to load saved destinations" message={favouritesError} />
          ) : savedDestinations.length === 0 ? (
            <EmptyState
              title="You haven't saved any destinations yet."
              message="Explore Jharkhand destinations and tap the heart to save places for later."
              actionLabel="Explore Destinations"
              actionHref="/explore"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedDestinations.map((destination) => (
                <SavedDestinationCard
                  key={destination.id}
                  destination={destination}
                  removing={pendingDestinationId === destination.id}
                  onRemove={() => void handleRemoveFavourite(destination.id)}
                />
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink-900">Profile</h2>
              <p className="mt-1 text-sm text-ink-600">Your account details are shared across the tourist dashboard.</p>
            </div>
            <Badge variant="accent">{profile?.role ?? 'tourist'}</Badge>
          </div>

          <div className="grid gap-4">
            <Card className="bg-sand">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">Name</p>
              <p className="mt-2 text-lg font-semibold text-ink-900">{profile?.full_name ?? 'Not set'}</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">Email</p>
              <p className="mt-2 text-lg font-semibold text-ink-900">{profile?.email ?? 'Not set'}</p>
            </Card>
            <Card className="bg-sand/80">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">Joined</p>
              <p className="mt-2 text-lg font-semibold text-ink-900">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN') : 'Unavailable'}
              </p>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/tourist/profile">My Profile</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/tourist/itinerary">My Trips</Link>
            </Button>
          </div>
        </Card>
      </div>

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink-900">My Trips</h2>
            <p className="mt-1 text-sm text-ink-600">Your actual saved itineraries from Supabase.</p>
          </div>
          <Badge variant="accent">{trips.length} trips</Badge>
        </div>

        {tripsLoading ? (
          <LoadingState label="Loading your trips..." />
        ) : tripsError ? (
          <ErrorState title="Unable to load trips" message={tripsError} />
        ) : trips.length === 0 ? (
          <EmptyState
            title="No trips yet"
            message="Create your first itinerary and start collecting destinations."
            actionLabel="Create Trip"
            actionHref="/tourist/itinerary/new"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                deleting={deletingTripId === trip.id}
                onDelete={() => void handleDeleteTrip(trip.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink-900">Recent Reviews</h2>
            <p className="mt-1 text-sm text-ink-600">Reviews you have written on destination pages.</p>
          </div>
          <Badge variant="accent">{reviews.length} reviews</Badge>
        </div>

        {reviewsLoading ? (
          <LoadingState label="Loading your reviews..." />
        ) : reviewsError ? (
          <ErrorState title="Unable to load reviews" message={reviewsError} />
        ) : reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            message="Open a destination page and share your experience with other travellers."
            actionLabel="Explore Destinations"
            actionHref="/explore"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-ink-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/explore">Explore Destinations</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/tourist/itinerary/new">Create Trip</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="#saved-destinations">View Saved Places</a>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/tourist/profile">My Profile</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
