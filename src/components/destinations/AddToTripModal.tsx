import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Loader2, MapPin, Plus, X } from 'lucide-react';
import { Button, Card } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import {
  addDestinationToTrip,
  createTrip,
  getUserTrips,
  type TripFormInput,
} from '../../services/trips/tripService';
import type { TripRecord } from '../../types/tourist';

interface AddToTripModalProps {
  destinationId: string;
  destinationName: string;
  onClose: () => void;
}

type ModalStep = 'list' | 'new-trip' | 'success' | 'error';

export function AddToTripModal({
  destinationId,
  destinationName,
  onClose,
}: AddToTripModalProps) {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const isTourist = role === 'tourist';
  const isAuthenticated = Boolean(user);

  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [step, setStep] = useState<ModalStep>('list');
  const [saving, setSaving] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isTourist) return;

    let mounted = true;
    setTripsLoading(true);

    getUserTrips()
      .then((data) => {
        if (mounted) setTrips(data);
      })
      .catch(() => {
        if (mounted) setTrips([]);
      })
      .finally(() => {
        if (mounted) setTripsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isTourist]);

  async function handleAddToExisting(trip: TripRecord) {
    setSaving(true);
    try {
      await addDestinationToTrip({ trip_id: trip.id, destination_id: destinationId });
      setMessage(`Added to "${trip.title}"!`);
      setStep('success');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to add destination to trip.');
      setStep('error');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateAndAdd() {
    const title = newTripTitle.trim();
    if (!title) {
      setMessage('Please enter a trip title.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const input: TripFormInput = { title };
      const newTrip = await createTrip(input);
      await addDestinationToTrip({ trip_id: newTrip.id, destination_id: destinationId });
      setMessage(`Added to new trip "${newTrip.title}"!`);
      setStep('success');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to create trip.');
      setStep('error');
    } finally {
      setSaving(false);
    }
  }

  // Backdrop click handler
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 px-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <Card className="relative w-full max-w-md shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink-500 hover:bg-sand hover:text-ink-900 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 space-y-1 pr-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">Add to trip</p>
          <h2 className="text-xl font-bold text-ink-900">{destinationName}</h2>
        </div>

        {/* Not authenticated */}
        {!isAuthenticated && (
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              Sign in with a tourist account to save destinations to your trip planner.
            </p>
            <Button asChild>
              <Link to="/login">Sign in to continue</Link>
            </Button>
          </div>
        )}

        {/* Not a tourist */}
        {isAuthenticated && !isTourist && (
          <p className="text-sm text-ink-600">
            Only tourist accounts can add destinations to trip planners.
          </p>
        )}

        {/* Success */}
        {isAuthenticated && isTourist && step === 'success' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-700">
              <Check className="h-6 w-6" />
            </div>
            <p className="font-semibold text-ink-900">{message}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="secondary" onClick={() => navigate('/tourist/itinerary')}>
                View My Trips
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {isAuthenticated && isTourist && step === 'error' && (
          <div className="space-y-4">
            <p className="text-sm text-red-700">{message}</p>
            <Button variant="secondary" onClick={() => setStep('list')}>
              Try Again
            </Button>
          </div>
        )}

        {/* Trip list */}
        {isAuthenticated && isTourist && step === 'list' && (
          <div className="space-y-4">
            {tripsLoading ? (
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your trips…
              </div>
            ) : trips.length > 0 ? (
              <>
                <p className="text-sm text-ink-600">Choose an existing trip to add this destination to:</p>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {trips.map((trip) => (
                    <button
                      key={trip.id}
                      type="button"
                      disabled={saving}
                      onClick={() => void handleAddToExisting(trip)}
                      className="group w-full flex items-center gap-3 rounded-2xl border border-ink-200 bg-white/80 px-4 py-3 text-left text-sm font-medium text-ink-900 hover:border-clay-400 hover:bg-sand transition disabled:opacity-50"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-clay-700" />
                      <span className="flex-1 truncate">{trip.title}</span>
                      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-400" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-ink-100 pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full inline-flex items-center gap-2"
                    onClick={() => setStep('new-trip')}
                  >
                    <Plus className="h-4 w-4" />
                    Create New Trip
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-ink-600">
                  You don't have any trips yet. Create one to start planning.
                </p>
                <Button
                  type="button"
                  className="inline-flex items-center gap-2"
                  onClick={() => setStep('new-trip')}
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Trip
                </Button>
              </div>
            )}
          </div>
        )}

        {/* New trip form */}
        {isAuthenticated && isTourist && step === 'new-trip' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-trip-title" className="text-sm font-medium text-ink-700">
                Trip name
              </label>
              <input
                id="new-trip-title"
                type="text"
                value={newTripTitle}
                onChange={(e) => setNewTripTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleCreateAndAdd()}
                placeholder="e.g. Jharkhand Adventure 2025"
                className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-clay-400 focus:outline-none focus:ring-2 focus:ring-clay-200"
                autoFocus
              />
              {message && <p className="text-xs text-red-700">{message}</p>}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                disabled={saving}
                onClick={() => void handleCreateAndAdd()}
                className="flex-1 inline-flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {saving ? 'Creating…' : 'Create & Add'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setStep('list'); setMessage(''); }}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
