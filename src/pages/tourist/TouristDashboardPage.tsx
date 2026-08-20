import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Heart, MapPin, PencilLine, Plus, Star, Trash2 } from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/StateBlocks';
import { DEFAULT_DESTINATION_IMAGE, getDestinationCategoryLabel } from '../../constants/destinations';
import { useAuth } from '../../hooks/useAuth';
import { useTouristFavourites } from '../../hooks/useTouristFavourites';
import { formatIndianCurrency } from '../../lib/utils';
import { getUserReviews, type UserReviewWithDestination } from '../../services/reviews/reviewService';
import { deleteTrip, getUserTrips } from '../../services/trips/tripService';
import { getMyTouristBookings, type TouristBookingWithDetails } from '../../services/tourist/touristBookingService';
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
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_-48px_rgba(55,41,28,0.7)]">
      <div className="relative aspect-[16/11] bg-sand">
        <img
          src={destination.cover_image || DEFAULT_DESTINATION_IMAGE}
          alt={destination.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="accent" className="bg-white/95 text-ink-900 shadow-sm">
            Saved
          </Badge>
          <Badge variant="neutral" className="bg-ink-900/75 text-white backdrop-blur">
            {getDestinationCategoryLabel(destination.category)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-ink-900">{destination.name}</h3>
              <p className="text-sm text-ink-600">{destination.district}</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-ink-600">
            {destination.short_description || destination.description || 'Destination details available in the public explorer.'}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
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
  const previewStops = (trip.trip_destinations ?? []).slice(0, 2).map((item) => item.destination?.name).filter(Boolean);

  return (
    <Card className="group flex h-full flex-col space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_-48px_rgba(55,41,28,0.7)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Trip</Badge>
            <Badge variant={statusVariant as 'neutral' | 'success' | 'warning' | 'accent'}>{tripStatus}</Badge>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-ink-900">{trip.title}</h3>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-ink-600">
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
        </div>
      <div className="rounded-2xl bg-gradient-to-br from-sand to-clay-100 p-3 text-clay-700 shadow-sm">
          <Heart className="h-5 w-5" />
        </div>
      </div>

      <p className="text-sm leading-6 text-ink-600">
        {trip.start_location || 'Start location not set yet.'}
        {trip.notes ? ` ${trip.notes}` : ''}
      </p>

      {previewStops.length ? (
        <div className="flex flex-wrap gap-2">
          {previewStops.map((stop) => (
            <span key={stop} className="inline-flex rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink-700">
              {stop}
            </span>
          ))}
          {destinationCount > previewStops.length ? (
            <span className="inline-flex rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-700">
              +{destinationCount - previewStops.length} more
            </span>
          ) : null}
        </div>
      ) : null}

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

      <div className="mt-auto rounded-2xl border border-ink-200/80 bg-white/85 p-4 text-sm text-ink-700">
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
    <Card className="group space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-40px_rgba(55,41,28,0.65)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-ink-900">{review.destination?.name ?? 'Destination review'}</h3>
            <Badge variant="neutral">{renderStars(review.rating)}</Badge>
          </div>
          <p className="text-sm text-ink-600">{review.destination?.district ?? 'Destination details unavailable'}</p>
        </div>
        {review.destination?.cover_image ? (
          <img
            src={review.destination.cover_image}
            alt={review.destination?.name ?? 'Destination'}
            className="h-14 w-20 rounded-2xl object-cover shadow-sm"
            loading="lazy"
          />
        ) : null}
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
  const [bookings, setBookings] = useState<TouristBookingWithDetails[]>([]);
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

    async function loadBookingsData() {
      try {
        const records = await getMyTouristBookings();
        if (alive) {
          setBookings(records);
        }
      } catch {
        // Ignore background load error
      }
    }

    void loadTrips();
    void loadReviews();
    void loadBookingsData();

    return () => {
      alive = false;
    };
  }, []);

  const savedDestinations = useMemo(
    () => favourites.map((favourite) => favourite.destination).filter(Boolean) as Destination[],
    [favourites]
  );

  const firstName = useMemo(() => {
    const name = profile?.full_name?.trim();
    if (name) {
      return name.split(/\s+/)[0];
    }

    const email = profile?.email?.trim();
    if (email) {
      return email.split('@')[0];
    }

    return 'Traveller';
  }, [profile?.email, profile?.full_name]);

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-7">
      <Card className="relative overflow-hidden border-ink-200 bg-gradient-to-br from-sand/65 via-white to-forest-50/70 p-0 shadow-[0_24px_70px_-50px_rgba(55,41,28,0.45)]">
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_top_right,_rgba(181,127,79,0.12),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(84,112,86,0.1),_transparent_28%)]" />
        <div className="relative grid gap-5 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:items-center lg:p-9">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Tourist dashboard</p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
                Welcome back, {firstName} 👋
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-ink-600 md:text-base">
                Plan your next Jharkhand adventure, revisit the places you love, and keep your trips, notes, and
                reviews in one calm travel space.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/tourist/requests">My Bookings</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/tourist/itinerary/new">Plan a Trip</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/explore">Explore Destinations</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { label: 'My Bookings', value: bookings.length, icon: CalendarDays },
              { label: 'Saved Destinations', value: savedDestinations.length, icon: Heart },
              { label: 'My Trips', value: trips.length, icon: MapPin },
              { label: 'My Reviews', value: reviews.length, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-3xl border border-ink-200 bg-white/90 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-clay-700">{label}</p>
                    <p className="mt-3 text-3xl font-bold text-ink-900">{value}</p>
                  </div>
                  <div className="rounded-2xl bg-sand p-3 text-ink-700">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <Card id="saved-destinations" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">Saved Destinations</h2>
                <p className="mt-1 text-sm text-ink-600">A personal shortlist of places to return to.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="accent">{savedDestinations.length} saved</Badge>
                {savedDestinations.length > 4 ? (
                  <Button asChild variant="secondary">
                    <a href="#saved-destinations">View all saved destinations</a>
                  </Button>
                ) : null}
              </div>
            </div>

            {savedError ? <ErrorState title="Saved destinations update failed" message={savedError} /> : null}

            {favouritesLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <LoadingState label="Loading saved destinations..." />
                <LoadingState label="Loading saved destinations..." />
              </div>
            ) : favouritesError ? (
              <ErrorState title="Unable to load saved destinations" message={favouritesError} />
            ) : savedDestinations.length === 0 ? (
              <EmptyState
                title="No saved adventures yet"
                message="Save destinations you love while exploring Jharkhand, and they’ll appear here for quick access."
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

          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">My Trips</h2>
                <p className="mt-1 text-sm text-ink-600">Your itineraries, organised for the next adventure.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">{trips.length} trips</Badge>
                <Button asChild variant="secondary">
                  <Link to="/tourist/itinerary/new">Plan a Trip</Link>
                </Button>
              </div>
            </div>

            {tripsLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <LoadingState label="Loading your trips..." />
                <LoadingState label="Loading your trips..." />
              </div>
            ) : tripsError ? (
              <ErrorState title="Unable to load trips" message={tripsError} />
            ) : trips.length === 0 ? (
              <EmptyState
                title="No trips planned yet"
                message="Start shaping your next Jharkhand journey with a simple itinerary."
                actionLabel="Plan a Trip"
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
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">Profile</h2>
                <p className="mt-1 text-sm text-ink-600">Your account details are shared across the tourist dashboard.</p>
              </div>
              <Badge variant="accent">{profile?.role ?? 'tourist'}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-ink-200 bg-sand/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">Name</p>
                <p className="mt-2 text-base font-semibold text-ink-900">{profile?.full_name ?? 'Not set'}</p>
              </div>
              <div className="rounded-2xl border border-ink-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">Email</p>
                <p className="mt-2 text-base font-semibold text-ink-900">{profile?.email ?? 'Not set'}</p>
              </div>
              <div className="rounded-2xl border border-ink-200 bg-sand/60 p-4 sm:col-span-2 xl:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">Joined</p>
                <p className="mt-2 text-base font-semibold text-ink-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN') : 'Unavailable'}
                </p>
              </div>
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

          <Card id="recent-reviews" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">Recent Reviews</h2>
                <p className="mt-1 text-sm text-ink-600">Stories you have shared while exploring Jharkhand.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">{reviews.length} reviews</Badge>
                <Button asChild variant="secondary">
                  <a href="#recent-reviews">View all reviews</a>
                </Button>
              </div>
            </div>

            {reviewsLoading ? (
              <LoadingState label="Loading your reviews..." />
            ) : reviewsError ? (
              <ErrorState title="Unable to load reviews" message={reviewsError} />
            ) : reviews.length === 0 ? (
              <EmptyState
                title="Share your experience"
                message="Write destination reviews to help other travellers plan better trips."
                actionLabel="Explore Destinations"
                actionHref="/explore"
              />
            ) : (
              <div className="grid gap-4">
                {reviews.slice(0, 2).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-ink-900">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild className="justify-start">
                <Link to="/explore">Explore Destinations</Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <Link to="/tourist/itinerary/new">Plan a Trip</Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <Link to="/tourist/itinerary">View My Trips</Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <a href="#saved-destinations">Saved Destinations</a>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Card className="border-dashed border-ink-300 bg-gradient-to-br from-sand via-white to-forest-50/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay-700">Travel companion</p>
            <h2 className="text-xl font-semibold text-ink-900">Discover your next destination with the same calm space.</h2>
            <p className="text-sm leading-6 text-ink-600">
              Your saved places, trips, and reviews are already here when you need to continue planning.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link to="/marketplace">Explore Jharkhand</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
