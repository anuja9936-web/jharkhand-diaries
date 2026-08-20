import { useEffect, useState } from 'react';
import { ArrowLeft, Edit3, Trash2, MapPin } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card } from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/common/StateBlocks';
import { getProviderOfferingById, deleteProviderOffering } from '../../services/provider/providerMarketplaceService';
import type { ProviderOffering } from '../../types/provider';
import { formatIndianCurrency } from '../../lib/utils';
import { DEFAULT_DESTINATION_IMAGE } from '../../constants/destinations';

export function ProviderTourDetailPage() {
  const { offeringId } = useParams<{ offeringId: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<ProviderOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!offeringId) return;

    const loadTour = async () => {
      try {
        setLoading(true);
        const data = await getProviderOfferingById(offeringId);
        setTour(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tour details.');
      } finally {
        setLoading(false);
      }
    };

    void loadTour();
  }, [offeringId]);

  const handleDelete = async () => {
    if (!tour) return;
    const ok = window.confirm(`Are you sure you want to delete "${tour.name}"?`);
    if (!ok) return;

    try {
      setDeleting(true);
      await deleteProviderOffering(tour.id);
      navigate('/provider/tours');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete tour.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading tour details..." />;
  }

  if (error || !tour) {
    return (
      <ErrorState
        title="Tour Not Found"
        message={error || "We couldn't find the requested tour."}
      />
    );
  }

  const meta = tour.metadata || {};
  const guideName = (meta.guide_name as string) || 'Local Guide';
  const languages = Array.isArray(meta.languages) ? (meta.languages as string[]) : ['Hindi'];
  const destinationsCovered = (meta.destinations_covered as string) || '';
  const meetingPoint = (meta.meeting_point as string) || tour.address || '';
  const duration = (meta.duration as string) || 'Full Day';
  const maxCapacity = meta.max_capacity ? String(meta.max_capacity) : '10';
  const timing = (meta.timing as string) || 'Standard Day Tour';
  const includedServices = (meta.included_services as string) || '';
  const requirements = (meta.requirements as string) || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/provider/tours">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Tours
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link to={`/provider/tours/${tour.id}/edit`}>
              <Edit3 className="mr-1.5 h-4 w-4" />
              Edit Tour
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-700 hover:bg-red-50"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Main Tour Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm">
        <div className="h-64 sm:h-80 w-full overflow-hidden bg-sand">
          <img
            src={tour.cover_image || DEFAULT_DESTINATION_IMAGE}
            alt={tour.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="accent">{tour.category || 'Guided Tour'}</Badge>
              <Badge variant={tour.status === 'published' ? 'success' : 'neutral'}>
                {tour.status.toUpperCase()}
              </Badge>
            </div>
            {tour.price != null && (
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-ink-500">Rate</span>
                <p className="font-display text-2xl font-bold text-clay-700">
                  {formatIndianCurrency(tour.price)}
                </p>
              </div>
            )}
          </div>

          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            {tour.name}
          </h1>

          {tour.district && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink-600">
              <MapPin className="h-4 w-4 text-clay-700" />
              {tour.district}, Jharkhand
            </p>
          )}

          {tour.short_description && (
            <p className="text-base text-ink-700 leading-relaxed font-medium">
              {tour.short_description}
            </p>
          )}

          {tour.description && (
            <div className="pt-3 border-t border-ink-100 text-sm leading-relaxed text-ink-600 whitespace-pre-line">
              {tour.description}
            </div>
          )}
        </div>
      </div>

      {/* Guide Credentials & Tour Highlights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-2">
            Guide & Languages
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-500">Lead Guide</span>
              <span className="font-medium text-ink-900">{guideName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-500">Meeting Point</span>
              <span className="font-medium text-ink-900 text-right max-w-xs">{meetingPoint || 'Specified on booking'}</span>
            </div>
            <div className="py-1">
              <span className="text-ink-500 block mb-1.5">Languages Spoken</span>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((l) => (
                  <span key={l} className="rounded-lg bg-sand px-2.5 py-1 text-xs font-semibold text-clay-800">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-2">
            Schedule & Logistics
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-500">Duration</span>
              <span className="font-medium text-ink-900">{duration}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-500">Max Capacity</span>
              <span className="font-medium text-ink-900">{maxCapacity} participants</span>
            </div>
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-500">Daily Timing</span>
              <span className="font-medium text-ink-900 text-right max-w-xs">{timing}</span>
            </div>
            {destinationsCovered && (
              <div className="py-1">
                <span className="text-ink-500 block mb-1">Destinations Covered</span>
                <span className="font-medium text-ink-900">{destinationsCovered}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {(includedServices || requirements) && (
        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-2">
            Inclusions & Guest Guidelines
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 text-sm">
            {includedServices && (
              <div>
                <span className="font-semibold text-clay-700 block mb-1">What's Included:</span>
                <p className="text-ink-700 leading-relaxed">{includedServices}</p>
              </div>
            )}
            {requirements && (
              <div>
                <span className="font-semibold text-clay-700 block mb-1">What Guests Should Bring:</span>
                <p className="text-ink-700 leading-relaxed">{requirements}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
