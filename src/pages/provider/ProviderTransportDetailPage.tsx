import { useEffect, useState } from 'react';
import { ArrowLeft, Edit3, Trash2, MapPin } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card } from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/common/StateBlocks';
import { getProviderOfferingById, deleteProviderOffering } from '../../services/provider/providerMarketplaceService';
import type { ProviderOffering } from '../../types/provider';
import { formatIndianCurrency } from '../../lib/utils';
import { DEFAULT_DESTINATION_IMAGE } from '../../constants/destinations';

export function ProviderTransportDetailPage() {
  const { offeringId } = useParams<{ offeringId: string }>();
  const navigate = useNavigate();
  const [transport, setTransport] = useState<ProviderOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!offeringId) return;

    const loadTransport = async () => {
      try {
        setLoading(true);
        const data = await getProviderOfferingById(offeringId);
        setTransport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transport details.');
      } finally {
        setLoading(false);
      }
    };

    void loadTransport();
  }, [offeringId]);

  const handleDelete = async () => {
    if (!transport) return;
    const ok = window.confirm(`Are you sure you want to delete "${transport.name}"?`);
    if (!ok) return;

    try {
      setDeleting(true);
      await deleteProviderOffering(transport.id);
      navigate('/provider/transport');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete transport service.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading vehicle details..." />;
  }

  if (error || !transport) {
    return (
      <ErrorState
        title="Vehicle Not Found"
        message={error || "We couldn't find the requested transport service."}
      />
    );
  }

  const meta = transport.metadata || {};
  const vehicleType = (meta.vehicle_type as string) || transport.category || 'SUV';
  const registrationNumber = (meta.registration_number as string) || 'Registered Vehicle';
  const seatingCapacity = meta.seating_capacity ? String(meta.seating_capacity) : '6';
  const serviceRoutes = (meta.service_routes as string) || transport.address || 'Statewide Coverage';
  const driverIncluded = (meta.driver_included as string) || 'yes';
  const acType = (meta.ac_type as string) || 'AC';
  const pricingModel = (meta.pricing_model as string) || 'Standard Day Rate';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/provider/transport">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Transport
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link to={`/provider/transport/${transport.id}/edit`}>
              <Edit3 className="mr-1.5 h-4 w-4" />
              Edit Vehicle
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

      {/* Main Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm">
        <div className="h-64 sm:h-80 w-full overflow-hidden bg-sand">
          <img
            src={transport.cover_image || DEFAULT_DESTINATION_IMAGE}
            alt={transport.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="accent">{vehicleType}</Badge>
              <Badge variant={transport.status === 'published' ? 'success' : 'neutral'}>
                {transport.status.toUpperCase()}
              </Badge>
            </div>
            {transport.price != null && (
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-ink-500">{pricingModel}</span>
                <p className="font-display text-2xl font-bold text-clay-700">
                  {formatIndianCurrency(transport.price)}
                </p>
              </div>
            )}
          </div>

          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            {transport.name}
          </h1>

          {transport.district && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink-600">
              <MapPin className="h-4 w-4 text-clay-700" />
              Base: {transport.district}, Jharkhand
            </p>
          )}

          {transport.short_description && (
            <p className="text-base text-ink-700 leading-relaxed font-medium">
              {transport.short_description}
            </p>
          )}

          {transport.description && (
            <div className="pt-3 border-t border-ink-100 text-sm leading-relaxed text-ink-600 whitespace-pre-line">
              {transport.description}
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-2">
            Vehicle Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-500">Vehicle Type</span>
              <span className="font-medium text-ink-900">{vehicleType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-500">Seating Capacity</span>
              <span className="font-medium text-ink-900">{seatingCapacity} Passengers</span>
            </div>
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-500">Air Conditioning</span>
              <span className="font-medium text-ink-900">{acType}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-500">Registration ID</span>
              <span className="font-medium text-ink-900">{registrationNumber}</span>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-2">
            Service & Driver Policies
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-500">Driver Status</span>
              <span className="font-medium text-ink-900">
                {driverIncluded === 'yes' ? 'Included' : driverIncluded === 'no' ? 'Self-Drive' : 'Optional'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-500">Pricing Basis</span>
              <span className="font-medium text-ink-900">{pricingModel}</span>
            </div>
            <div className="py-1">
              <span className="text-ink-500 block mb-1">Service Routes / Coverage</span>
              <span className="font-medium text-ink-900">{serviceRoutes}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
