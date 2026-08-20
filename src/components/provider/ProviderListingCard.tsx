import { ArrowRight, Coins, ImageOff, MapPin, PencilLine, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../ui';
import { DEFAULT_DESTINATION_IMAGE, getDestinationCategoryLabel, getDestinationStatusLabel } from '../../constants/destinations';
import { formatIndianCurrency } from '../../lib/utils';
import type { Destination } from '../../types/destination';

export interface ProviderListingCardProps {
  listing: Destination;
  reviewCount?: number;
  averageRating?: number | null;
  onDelete?: (listing: Destination) => void;
  deleting?: boolean;
}

function renderRating(value?: number | null) {
  if (value == null) {
    return 'No ratings yet';
  }

  return `${value.toFixed(1)} / 5`;
}

export function ProviderListingCard({ listing, reviewCount = 0, averageRating = null, onDelete, deleting = false }: ProviderListingCardProps) {
  const image = listing.cover_image || DEFAULT_DESTINATION_IMAGE;

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
        <div className="relative min-h-52 bg-ink-100">
          <img src={image} alt={listing.name} className="h-full w-full object-cover" />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge variant={listing.status === 'published' ? 'success' : 'warning'}>{getDestinationStatusLabel(listing.status)}</Badge>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/70 to-transparent px-4 py-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              {getDestinationCategoryLabel(listing.category)}
            </p>
            <p className="mt-1 text-sm">{listing.eco_zone ? 'Eco-focused destination' : 'Tourism listing'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{getDestinationCategoryLabel(listing.category)}</Badge>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">{listing.district}</span>
              </div>
              <h3 className="text-2xl font-semibold text-ink-900">{listing.name}</h3>
              <p className="max-w-2xl text-sm leading-6 text-ink-600">
                {listing.short_description || listing.description || 'No short description has been added yet.'}
              </p>
            </div>
            <div className="rounded-2xl bg-sand p-3 text-ink-700">
              <ImageOff className="h-5 w-5" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Location</p>
              <p className="mt-2 text-sm font-medium text-ink-900">{listing.district}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Rating</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-ink-900">
                <Star className="h-4 w-4 text-clay-700" />
                {renderRating(averageRating)}
              </div>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Entry fee</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-ink-900">
                <Coins className="h-4 w-4 text-clay-700" />
                {formatIndianCurrency(listing.entry_fee)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 text-sm text-ink-600">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1">
                <MapPin className="h-4 w-4" />
                {reviewCount} reviews
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link to={`/provider/listings/${listing.id}`} className="inline-flex items-center gap-2">
                  View
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to={`/provider/listings/${listing.id}/edit`} className="inline-flex items-center gap-2">
                  <PencilLine className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
              {onDelete ? (
                <Button type="button" variant="danger" onClick={() => onDelete(listing)} disabled={deleting}>
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
