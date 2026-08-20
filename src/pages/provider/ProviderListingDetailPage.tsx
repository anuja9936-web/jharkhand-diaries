import { useEffect, useState } from 'react';
import { ArrowLeft, Edit3, MapPin, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Card } from '../../components/ui';
import { ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { DEFAULT_DESTINATION_IMAGE, getDestinationCategoryLabel, getDestinationStatusLabel } from '../../constants/destinations';
import { getProviderListingById } from '../../services/provider/providerService';
import type { Destination } from '../../types/destination';

export function ProviderListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const [listing, setListing] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadListing() {
      if (!listingId) {
        setError('Missing listing id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const record = await getProviderListingById(listingId);

        if (!alive) {
          return;
        }

        if (!record) {
          setError('Listing not found or you do not have access to it.');
          setListing(null);
          return;
        }

        setListing(record);
      } catch (loadError) {
        if (alive) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load listing.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadListing();

    return () => {
      alive = false;
    };
  }, [listingId]);

  if (loading) {
    return <LoadingState label="Loading listing preview..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load listing" message={error} />;
  }

  if (!listing) {
    return <ErrorState title="Listing unavailable" message="We could not find that provider listing." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Listing preview"
        title={listing.name}
        description="A provider-owned preview of how this listing is managed in the portal."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/provider/listings" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Listings
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/provider/listings/${listing.id}/edit`} className="inline-flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Listing
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden p-0">
          <img src={listing.cover_image || DEFAULT_DESTINATION_IMAGE} alt={listing.name} className="h-80 w-full object-cover" />
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{getDestinationCategoryLabel(listing.category)}</Badge>
              <Badge variant={listing.status === 'published' ? 'success' : 'warning'}>{getDestinationStatusLabel(listing.status)}</Badge>
              {listing.eco_zone ? <Badge variant="neutral">Eco-zone</Badge> : null}
            </div>
            <p className="text-sm leading-6 text-ink-700">{listing.description || listing.short_description || 'No description available.'}</p>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Destination details</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink-900">{listing.name}</h2>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">District</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{listing.district}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Slug</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{listing.slug}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Location</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-ink-900">
                <MapPin className="h-4 w-4" />
                {listing.latitude ?? 'n/a'}, {listing.longitude ?? 'n/a'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to={`/destinations/${listing.slug}`} className="inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Public Page
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/provider/listings/${listing.id}/edit`} className="inline-flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
