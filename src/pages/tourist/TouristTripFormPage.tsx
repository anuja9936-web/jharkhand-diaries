import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge, Button, Card, Input, Textarea } from '../../components/ui';
import { ErrorState, PageHeader } from '../../components/common/StateBlocks';
import { createTrip, type TripFormInput } from '../../services/trips/tripService';

const emptyForm: TripFormInput = {
  title: '',
  start_date: '',
  end_date: '',
  budget: null,
  start_location: '',
  notes: '',
};

export function TouristTripFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<TripFormInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const trip = await createTrip(form);
      navigate(`/tourist/itinerary/${trip.id}`, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create trip.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Create trip"
        title="Create a new itinerary"
        description="Plan a new journey, set a budget, and add destinations in the next step."
        actions={
          <Button asChild variant="secondary">
            <Link to="/tourist/itinerary" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Trips
            </Link>
          </Button>
        }
      />

      <Card className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="accent">Trip builder</Badge>
          <span className="text-sm text-ink-600">Create the itinerary shell first, then add destinations on the detail page.</span>
        </div>

        {error ? <ErrorState title="Could not create trip" message={error} /> : null}

        <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block space-y-2 lg:col-span-2">
            <span className="text-sm font-medium text-ink-700">Trip name</span>
            <Input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Jharkhand Weekend Explorer"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700">Start date</span>
            <Input
              type="date"
              value={form.start_date ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, start_date: event.target.value }))}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700">End date</span>
            <Input
              type="date"
              value={form.end_date ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, end_date: event.target.value }))}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700">Starting location</span>
            <Input
              value={form.start_location ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, start_location: event.target.value }))}
              placeholder="Ranchi"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700">Budget</span>
            <Input
              type="number"
              min="0"
              step="1"
              value={form.budget ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  budget: event.target.value ? Number(event.target.value) : null,
                }))
              }
              placeholder="5000"
            />
          </label>

          <label className="block space-y-2 lg:col-span-2">
            <span className="text-sm font-medium text-ink-700">Notes</span>
            <Textarea
              value={form.notes ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Add anything you want to remember for this trip."
            />
          </label>

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Trip'}
            </Button>
            <Button asChild variant="secondary">
              <Link to="/tourist/itinerary">Cancel</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

