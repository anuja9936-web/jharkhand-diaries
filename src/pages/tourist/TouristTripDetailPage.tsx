import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowDown, ArrowUp, PencilLine, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, Input, Select, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { getPublishedDestinations } from '../../services/destinations/destinationService';
import {
  addDestinationToTrip,
  deleteTrip,
  getTripById,
  removeTripDestination,
  updateTrip,
  updateTripDestination,
  type TripFormInput,
} from '../../services/trips/tripService';
import type { Destination } from '../../types/destination';
import type { TripDestinationRecord, TripRecord } from '../../types/tourist';
import { formatIndianCurrency } from '../../lib/utils';

type TripFormState = TripFormInput;

const initialTripForm: TripFormState = {
  title: '',
  start_date: '',
  end_date: '',
  budget: null,
  start_location: '',
  notes: '',
};

function sortTripDestinations(items: TripDestinationRecord[]) {
  return [...items].sort((a, b) => {
    if (a.day_number !== b.day_number) {
      return a.day_number - b.day_number;
    }

    if (a.visit_order !== b.visit_order) {
      return a.visit_order - b.visit_order;
    }

    return a.created_at.localeCompare(b.created_at);
  });
}

function groupTripDestinations(items: TripDestinationRecord[]) {
  const sorted = sortTripDestinations(items);
  const grouped = new Map<number, TripDestinationRecord[]>();

  for (const item of sorted) {
    const bucket = grouped.get(item.day_number) ?? [];
    bucket.push(item);
    grouped.set(item.day_number, bucket);
  }

  return [...grouped.entries()].sort(([a], [b]) => a - b);
}

async function persistTripOrder(items: TripDestinationRecord[]) {
  const ordered = sortTripDestinations(items);
  const updates = ordered.map((item) =>
    updateTripDestination(item.id, {
      day_number: item.day_number,
      visit_order: item.visit_order,
      visit_date: item.visit_date,
      notes: item.notes,
    })
  );

  await Promise.all(updates);
}

export function TouristTripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [tripForm, setTripForm] = useState<TripFormState>(initialTripForm);
  const [tripDestinationForm, setTripDestinationForm] = useState({
    destinationId: '',
    dayNumber: 1,
    visitDate: '',
    notes: '',
  });

  const sortedTripDestinations = useMemo(() => sortTripDestinations(trip?.trip_destinations ?? []), [trip?.trip_destinations]);
  const groupedDestinations = useMemo(() => groupTripDestinations(sortedTripDestinations), [sortedTripDestinations]);
  const availableDestinations = useMemo(
    () =>
      destinations.filter(
        (destination) => !sortedTripDestinations.some((tripDestination) => tripDestination.destination_id === destination.id)
      ),
    [destinations, sortedTripDestinations]
  );

  const loadTrip = useCallback(async () => {
    if (!tripId) {
      setLoading(false);
      setError('Missing trip id.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [tripRecord, destinationRecords] = await Promise.all([getTripById(tripId), getPublishedDestinations()]);
      setTrip(tripRecord);
      setDestinations(destinationRecords);

      if (tripRecord) {
        setTripForm({
          title: tripRecord.title,
          start_date: tripRecord.start_date ?? '',
          end_date: tripRecord.end_date ?? '',
          budget: tripRecord.budget ?? null,
          start_location: tripRecord.start_location ?? '',
          notes: tripRecord.notes ?? '',
        });
      }

      const firstAvailableDestination = destinationRecords.find(
        (destination) => !tripRecord?.trip_destinations?.some((tripDestination) => tripDestination.destination_id === destination.id)
      );
      setTripDestinationForm((current) => ({
        ...current,
        destinationId: current.destinationId || firstAvailableDestination?.id || '',
      }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load trip details.');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void loadTrip();
  }, [loadTrip]);

  const refreshTrip = async () => {
    const updatedTrip = await getTripById(tripId ?? '');
    setTrip(updatedTrip);
  };

  const handleUpdateTrip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tripId) {
      return;
    }

    setSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      const updated = await updateTrip(tripId, tripForm);
      setTrip(updated);
      await refreshTrip();
      setStatusMessage('Trip updated successfully.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update trip.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripId) {
      return;
    }

    const confirmed = window.confirm('Delete this trip and all of its destinations?');

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);
    setStatusMessage(null);

    try {
      await deleteTrip(tripId);
      navigate('/tourist/itinerary', { replace: true });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete trip.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddDestination = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tripId || !tripDestinationForm.destinationId) {
      return;
    }

    setAdding(true);
    setError(null);
    setStatusMessage(null);

    try {
      const existingForDay =
        trip?.trip_destinations?.filter((item) => item.day_number === tripDestinationForm.dayNumber).length ?? 0;

      await addDestinationToTrip({
        trip_id: tripId,
        destination_id: tripDestinationForm.destinationId,
        day_number: tripDestinationForm.dayNumber,
        visit_order: existingForDay + 1,
        visit_date: tripDestinationForm.visitDate || null,
        notes: tripDestinationForm.notes || null,
      });

      await loadTrip();
      setStatusMessage('Destination added to trip.');
      setTripDestinationForm((current) => ({
        ...current,
        destinationId: availableDestinations.find((destination) => destination.id !== current.destinationId)?.id ?? '',
        notes: '',
        visitDate: '',
      }));
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Unable to add destination to trip.');
    } finally {
      setAdding(false);
    }
  };

  const updateDestinationRow = async (tripDestinationId: string, patch: Partial<TripDestinationRecord>) => {
    const current = trip?.trip_destinations ?? [];
    const nextItems = current.map((item) => (item.id === tripDestinationId ? { ...item, ...patch } : item));
    await persistTripOrder(nextItems);
    await loadTrip();
  };

  const moveDestination = async (tripDestinationId: string, direction: 'up' | 'down') => {
    const current = sortTripDestinations(trip?.trip_destinations ?? []);
    const index = current.findIndex((item) => item.id === tripDestinationId);

    if (index === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const target = current[targetIndex];

    if (!target || target.day_number !== current[index].day_number) {
      return;
    }

    const currentItem = current[index];
    const swapped = current.map((item) => {
      if (item.id === currentItem.id) {
        return { ...item, visit_order: target.visit_order };
      }

      if (item.id === target.id) {
        return { ...item, visit_order: currentItem.visit_order };
      }

      return item;
    });

    await persistTripOrder(swapped);
    await loadTrip();
  };

  const handleRemoveDestination = async (tripDestinationId: string) => {
    const confirmed = window.confirm('Remove this destination from the trip?');

    if (!confirmed) {
      return;
    }

    setError(null);
    setStatusMessage(null);

    try {
      await removeTripDestination(tripDestinationId);
      await loadTrip();
      setStatusMessage('Destination removed from trip.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove destination.');
    }
  };

  if (loading) {
    return <LoadingState label="Loading your trip..." />;
  }

  if (error && !trip) {
    return <ErrorState title="Unable to load trip" message={error} />;
  }

  if (!trip) {
    return <ErrorState title="Trip not found" message="This trip may have been deleted or you may not have access to it." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trip details"
        title={trip.title}
        description="Edit your itinerary, add destinations, and arrange the route day by day."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/tourist/itinerary" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Trips
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/tourist/itinerary/new">Create New Trip</Link>
            </Button>
          </div>
        }
      />

      {error ? <ErrorState title="Trip action failed" message={error} /> : null}
      {statusMessage ? (
        <div className="rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink-900">Trip overview</h2>
              <p className="mt-1 text-sm text-ink-600">Update the planning basics for this journey.</p>
            </div>
            <Badge variant="accent">{sortedTripDestinations.length} stops</Badge>
          </div>

          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleUpdateTrip}>
            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-ink-700">Trip name</span>
              <Input
                value={tripForm.title}
                onChange={(event) => setTripForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Start date</span>
              <Input
                type="date"
                value={tripForm.start_date ?? ''}
                onChange={(event) => setTripForm((current) => ({ ...current, start_date: event.target.value }))}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">End date</span>
              <Input
                type="date"
                value={tripForm.end_date ?? ''}
                onChange={(event) => setTripForm((current) => ({ ...current, end_date: event.target.value }))}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Starting location</span>
              <Input
                value={tripForm.start_location ?? ''}
                onChange={(event) => setTripForm((current) => ({ ...current, start_location: event.target.value }))}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Budget</span>
              <Input
                type="number"
                min="0"
                step="1"
                value={tripForm.budget ?? ''}
                onChange={(event) =>
                  setTripForm((current) => ({ ...current, budget: event.target.value ? Number(event.target.value) : null }))
                }
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-ink-700">Trip notes</span>
              <Textarea
                value={tripForm.notes ?? ''}
                onChange={(event) => setTripForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button type="submit" disabled={saving}>
                <PencilLine className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save trip'}
              </Button>
              <Button type="button" variant="danger" onClick={() => void handleDeleteTrip()} disabled={deleting}>
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete trip'}
              </Button>
            </div>
          </form>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-sand">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Dates</p>
              <p className="mt-2 text-sm font-semibold text-ink-900">
                {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-IN') : 'Not set'}{' '}
                {trip.end_date ? `- ${new Date(trip.end_date).toLocaleDateString('en-IN')}` : ''}
              </p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Budget</p>
              <p className="mt-2 text-sm font-semibold text-ink-900">{formatIndianCurrency(trip.budget)}</p>
            </Card>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-ink-900">Add destination</h2>
            <p className="mt-1 text-sm text-ink-600">Choose from real published destinations in Supabase.</p>
          </div>

          {availableDestinations.length === 0 ? (
            <EmptyState
              title="No destinations left to add"
              message="This trip already includes every available published destination, or none are available right now."
              actionLabel="Back to trips"
              actionHref="/tourist/itinerary"
            />
          ) : (
            <form className="space-y-4" onSubmit={handleAddDestination}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink-700">Destination</span>
                <Select
                  value={tripDestinationForm.destinationId}
                  onChange={(event) => setTripDestinationForm((current) => ({ ...current, destinationId: event.target.value }))}
                >
                  {availableDestinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name} - {destination.district}
                    </option>
                  ))}
                </Select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink-700">Day number</span>
                  <Input
                    type="number"
                    min="1"
                    value={tripDestinationForm.dayNumber}
                    onChange={(event) =>
                      setTripDestinationForm((current) => ({ ...current, dayNumber: Number(event.target.value) || 1 }))
                    }
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink-700">Visit date</span>
                  <Input
                    type="date"
                    value={tripDestinationForm.visitDate}
                    onChange={(event) => setTripDestinationForm((current) => ({ ...current, visitDate: event.target.value }))}
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink-700">Notes</span>
                <Textarea
                  value={tripDestinationForm.notes}
                  onChange={(event) => setTripDestinationForm((current) => ({ ...current, notes: event.target.value }))}
                />
              </label>

              <Button type="submit" disabled={adding}>
                <Plus className="h-4 w-4" />
                {adding ? 'Adding...' : 'Add Destination'}
              </Button>
            </form>
          )}
        </Card>
      </div>

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink-900">Itinerary</h2>
            <p className="mt-1 text-sm text-ink-600">Arrange destinations by day and order.</p>
          </div>
          <Badge variant="accent">{sortedTripDestinations.length} destinations</Badge>
        </div>

        {sortedTripDestinations.length === 0 ? (
          <EmptyState
            title="No destinations added yet"
            message="Add a destination above to begin shaping the itinerary."
            actionLabel="Explore destinations"
            actionHref="/explore"
          />
        ) : (
          <div className="space-y-6">
            {groupedDestinations.map(([dayNumber, items]) => (
              <div key={dayNumber} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Day {dayNumber}</div>
                  <div className="h-px flex-1 bg-ink-200" />
                </div>

                <div className="grid gap-4">
                  {items.map((tripDestination) => {
                    const destination = tripDestination.destination;

                    return (
                      <Card key={tripDestination.id} className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-ink-900">{destination?.name ?? 'Destination'}</h3>
                            <p className="text-sm text-ink-600">{destination?.district ?? 'District not available'}</p>
                          </div>
                          <Badge variant="accent">Order {tripDestination.visit_order}</Badge>
                        </div>

                        <p className="text-sm leading-6 text-ink-600">
                          {destination?.short_description ?? destination?.description ?? 'Destination details not available.'}
                        </p>

                        <div className="grid gap-4 md:grid-cols-[0.7fr_0.7fr_1fr]">
                          <label className="block space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Day</span>
                            <Input
                              type="number"
                              min="1"
                              value={tripDestination.day_number}
                              onChange={(event) =>
                                void updateDestinationRow(tripDestination.id, {
                                  day_number: Number(event.target.value) || 1,
                                })
                              }
                            />
                          </label>

                          <label className="block space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Visit date</span>
                            <Input
                              type="date"
                              value={tripDestination.visit_date ?? ''}
                              onChange={(event) =>
                                void updateDestinationRow(tripDestination.id, {
                                  visit_date: event.target.value || null,
                                })
                              }
                            />
                          </label>

                          <label className="block space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Notes</span>
                            <Textarea
                              value={tripDestination.notes ?? ''}
                              onChange={(event) =>
                                void updateDestinationRow(tripDestination.id, {
                                  notes: event.target.value,
                                })
                              }
                            />
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => void moveDestination(tripDestination.id, 'up')}
                            disabled={items[0].id === tripDestination.id}
                          >
                            <ArrowUp className="h-4 w-4" />
                            Move up
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => void moveDestination(tripDestination.id, 'down')}
                            disabled={items[items.length - 1].id === tripDestination.id}
                          >
                            <ArrowDown className="h-4 w-4" />
                            Move down
                          </Button>
                          {destination ? (
                            <Button asChild variant="secondary">
                              <Link to={`/destinations/${destination.slug}`}>View destination</Link>
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => void handleRemoveDestination(tripDestination.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
