import { useEffect, useMemo, useState } from 'react';
import { Plus, Car, Clock, CheckCircle2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/StateBlocks';
import { ProviderOfferingCard } from '../../components/provider/ProviderOfferingCard';
import { getMyProviderOfferings, deleteProviderOffering } from '../../services/provider/providerMarketplaceService';
import type { ProviderOffering } from '../../types/provider';
import { useAuth } from '../../hooks/useAuth';

export function ProviderTransportPage() {
  const { profile } = useAuth();
  const [transports, setTransports] = useState<ProviderOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTransports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProviderOfferings('transport');
      setTransports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load transport services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransports();
  }, []);

  const handleDelete = async (transport: ProviderOffering) => {
    const ok = window.confirm(`Delete vehicle/service "${transport.name}"? This cannot be undone.`);
    if (!ok) return;

    try {
      setDeletingId(transport.id);
      await deleteProviderOffering(transport.id);
      await loadTransports();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete transport service.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTransports = useMemo(() => {
    return transports.filter((t) => {
      const match =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.district && t.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return match;
    });
  }, [transports, searchTerm]);

  const publishedCount = transports.filter((t) => t.status === 'published').length;
  const draftCount = transports.filter((t) => t.status === 'draft').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Transport & Travel Provider"
          title="Transport & Travel Services"
          description="Manage vehicle rentals, airport transfers, tourist cabs, and safari travel."
        />
        <LoadingState label="Loading transport fleet..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Transport & Travel Provider"
          title="Transport & Travel Services"
          description="Manage vehicle rentals, airport transfers, tourist cabs, and safari travel."
        />
        <ErrorState title="Error loading transport" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="accent">Transport & Travel Provider</Badge>
          <h1 className="mt-1.5 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            Transport & Fleet Services
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Offer reliable travel, airport transfers, tempo travellers, and tourist vehicle rentals across Jharkhand.
          </p>
        </div>
        <Button asChild>
          <Link to="/provider/transport/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Vehicle / Service
          </Link>
        </Button>
      </div>

      {/* Identity Card */}
      <Card className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-clay-700 bg-sand/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-700 text-white shadow-sm">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-ink-900">{profile?.business_name || profile?.full_name || 'Travel Operator'}</h3>
              <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-clay-800 border border-ink-200">
                Verified Transport Operator
              </span>
            </div>
            <p className="text-xs text-ink-600">
              {profile?.district ? `Operating from ${profile.district}` : 'Statewide Coverage'} • Tourist Booking Requests Active
            </p>
          </div>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link to="/provider/requests">View Travel Requests</Link>
        </Button>
      </Card>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Vehicles & Services"
          value={String(transports.length)}
          detail="Total transport listings"
          icon={Car}
        />
        <StatCard
          label="Available Online"
          value={String(publishedCount)}
          detail="Active for traveller bookings"
          icon={CheckCircle2}
        />
        <StatCard
          label="Drafts"
          value={String(draftCount)}
          detail="Unpublished fleet records"
          icon={Clock}
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search by vehicle type, route or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-xs font-medium text-ink-500">
          Showing {filteredTransports.length} of {transports.length} services
        </span>
      </div>

      {/* List */}
      {filteredTransports.length === 0 ? (
        <EmptyState
          title={transports.length === 0 ? 'No transport services listed yet' : 'No transport matches filter'}
          message={
            transports.length === 0
              ? 'List your first tourist vehicle, cab route, or rental service to start receiving travel inquiries.'
              : 'Try clearing your search query to see all your vehicles.'
          }
          actionLabel="Add Vehicle Service"
          actionHref="/provider/transport/new"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTransports.map((item) => (
            <ProviderOfferingCard
              key={item.id}
              offering={item}
              onDelete={handleDelete}
              deleting={deletingId === item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
