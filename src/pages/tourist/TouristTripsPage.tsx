import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Coins, MapPin, Plus, Route, Sparkles, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { deleteTrip, getUserTrips } from '../../services/trips/tripService';
import type { TripRecord } from '../../types/tourist';
import { formatIndianCurrency } from '../../lib/utils';

export function TouristTripsPage() {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const records = await getUserTrips();
      setTrips(records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTrips();
  }, []);

  const handleDelete = async (tripId: string) => {
    const confirmed = window.confirm('Delete this trip? This will remove all trip destinations too.');

    if (!confirmed) {
      return;
    }

    setDeletingTripId(tripId);

    try {
      await deleteTrip(tripId);
      await loadTrips();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete trip.');
    } finally {
      setDeletingTripId(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading your trips..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load trips" message={error} />;
  }

  const totalDestinations = trips.reduce((count, trip) => count + (trip.trip_destinations?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My trips"
        title="Plan your Jharkhand journeys"
        description="Create itineraries, add destinations, and keep your travel notes organized in one place."
        actions={
          <Button asChild>
            <Link to="/tourist/itinerary/new" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Trip
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Trips</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">{trips.length}</p>
          <p className="mt-1 text-sm text-ink-600">Saved itineraries</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Destinations</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">{totalDestinations}</p>
          <p className="mt-1 text-sm text-ink-600">Planned stops across all trips</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Ready to go</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">{trips.filter((trip) => trip.trip_destinations && trip.trip_destinations.length > 0).length}</p>
          <p className="mt-1 text-sm text-ink-600">Trips with at least one stop</p>
        </Card>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          message="Create your first trip to start building a day-by-day journey through Jharkhand."
          actionLabel="Create Trip"
          actionHref="/tourist/itinerary/new"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {trips.map((trip) => {
            const destinationCount = trip.trip_destinations?.length ?? 0;
            return (
              <Card key={trip.id} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge variant="accent">Trip</Badge>
                    <h2 className="text-xl font-semibold text-ink-900">{trip.title}</h2>
                    <div className="flex flex-wrap gap-3 text-sm text-ink-600">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-IN') : 'Flexible start'}
                        {trip.end_date ? ` - ${new Date(trip.end_date).toLocaleDateString('en-IN')}` : ''}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {destinationCount} stops
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Coins className="h-4 w-4" />
                        {formatIndianCurrency(trip.budget)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-sand p-3 text-clay-700">
                    <Route className="h-5 w-5" />
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
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link to={`/tourist/itinerary/${trip.id}`} className="inline-flex items-center gap-2">
                      Edit
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void handleDelete(trip.id)}
                    disabled={deletingTripId === trip.id}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingTripId === trip.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>

                {destinationCount > 0 ? (
                  <div className="rounded-2xl bg-white/80 p-4 text-sm text-ink-700">
                    <div className="flex items-center gap-2 font-semibold text-ink-900">
                      <Sparkles className="h-4 w-4 text-clay-700" />
                      {destinationCount} destinations already planned
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const TouristItineraryPage = TouristTripsPage;
