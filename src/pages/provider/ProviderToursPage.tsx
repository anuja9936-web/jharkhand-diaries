import { useEffect, useMemo, useState } from 'react';
import { Plus, Compass, Clock, CheckCircle2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/StateBlocks';
import { ProviderOfferingCard } from '../../components/provider/ProviderOfferingCard';
import { getMyProviderOfferings, deleteProviderOffering } from '../../services/provider/providerMarketplaceService';
import type { ProviderOffering } from '../../types/provider';
import { useAuth } from '../../hooks/useAuth';

export function ProviderToursPage() {
  const { profile } = useAuth();
  const [tours, setTours] = useState<ProviderOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTours = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProviderOfferings('tour');
      setTours(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load your tours & guiding services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTours();
  }, []);

  const handleDelete = async (tour: ProviderOffering) => {
    const ok = window.confirm(`Delete tour "${tour.name}"? This action cannot be undone.`);
    if (!ok) return;

    try {
      setDeletingId(tour.id);
      await deleteProviderOffering(tour.id);
      await loadTours();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete tour.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTours = useMemo(() => {
    return tours.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.district && t.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [tours, searchTerm]);

  const publishedCount = tours.filter((t) => t.status === 'published').length;
  const draftCount = tours.filter((t) => t.status === 'draft').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Guide & Tour Operator"
          title="Tours & Guiding Services"
          description="Manage guided trails, tribal culture walks, wildlife excursions, and heritage tours."
        />
        <LoadingState label="Loading tour services..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Guide & Tour Operator"
          title="Tours & Guiding Services"
          description="Manage guided trails, tribal culture walks, wildlife excursions, and heritage tours."
        />
        <ErrorState title="Error loading tours" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="accent">Guide & Tour Operator</Badge>
          <h1 className="mt-1.5 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            My Tours & Guiding Services
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Publish and manage guided itineraries, local treks, and cultural storytelling tours across Jharkhand.
          </p>
        </div>
        <Button asChild>
          <Link to="/provider/tours/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add New Tour
          </Link>
        </Button>
      </div>

      {/* Guide Identity Badge */}
      <Card className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-clay-700 bg-sand/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-700 text-white shadow-sm">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-ink-900">{profile?.full_name || 'Registered Guide'}</h3>
              <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-clay-800 border border-ink-200">
                Local Tour Guide
              </span>
            </div>
            <p className="text-xs text-ink-600">
              {profile?.district ? `${profile.district}, Jharkhand` : 'Jharkhand Tourism Network'} • Direct Tourist Inquiries Enabled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to="/provider/requests">View Tour Bookings</Link>
          </Button>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Tours"
          value={String(tours.length)}
          detail="Active guiding itineraries"
          icon={Compass}
        />
        <StatCard
          label="Published Tours"
          value={String(publishedCount)}
          detail="Bookable by tourists online"
          icon={CheckCircle2}
        />
        <StatCard
          label="Drafts"
          value={String(draftCount)}
          detail="Unpublished itineraries"
          icon={Clock}
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search tours by title, district or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-xs font-medium text-ink-500">
          Showing {filteredTours.length} of {tours.length} tours
        </span>
      </div>

      {/* Tour List */}
      {filteredTours.length === 0 ? (
        <EmptyState
          title={tours.length === 0 ? 'No tours added yet' : 'No tours match your filter'}
          message={
            tours.length === 0
              ? 'Create your first guided tour package to connect with travellers exploring Jharkhand.'
              : 'Try clearing your search query to see all your tours.'
          }
          actionLabel="Add Tour Service"
          actionHref="/provider/tours/new"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTours.map((tour) => (
            <ProviderOfferingCard
              key={tour.id}
              offering={tour}
              onDelete={handleDelete}
              deleting={deletingId === tour.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
