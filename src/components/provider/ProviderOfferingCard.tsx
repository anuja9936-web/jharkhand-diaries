import { ArrowRight, Coins, MapPin, PencilLine, Sparkles, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../ui';
import { DEFAULT_DESTINATION_IMAGE } from '../../constants/destinations';
import { formatIndianCurrency } from '../../lib/utils';
import { getProviderOfferingKindLabel } from '../../constants/provider';
import type { ProviderOffering } from '../../types/provider';

export interface ProviderOfferingCardProps {
  offering: ProviderOffering;
  onDelete?: (offering: ProviderOffering) => void;
  deleting?: boolean;
}

function renderMeta(offering: ProviderOffering) {
  if (offering.kind === 'product') {
    const material = typeof offering.metadata?.material === 'string' ? offering.metadata.material : null;
    const stock = typeof offering.metadata?.stock_quantity === 'number' ? offering.metadata.stock_quantity : null;

    return [material, stock != null ? `${stock} in stock` : null].filter(Boolean);
  }

  if (offering.kind === 'experience') {
    const duration = typeof offering.metadata?.duration === 'string' ? offering.metadata.duration : null;
    const participants = typeof offering.metadata?.max_participants === 'number' ? offering.metadata.max_participants : null;

    return [duration, participants != null ? `${participants} max participants` : null].filter(Boolean);
  }

  const roomTypes = Array.isArray(offering.metadata?.room_types) ? offering.metadata.room_types : null;
  const rooms = typeof offering.metadata?.rooms === 'number' ? offering.metadata.rooms : null;

  return [rooms != null ? `${rooms} rooms` : null, roomTypes?.length ? `${roomTypes.length} room types` : null].filter(Boolean);
}

export function ProviderOfferingCard({ offering, onDelete, deleting = false }: ProviderOfferingCardProps) {
  const image = offering.cover_image || DEFAULT_DESTINATION_IMAGE;
  const meta = renderMeta(offering);

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
        <div className="relative min-h-52 bg-ink-100">
          <img src={image} alt={offering.name} className="h-full w-full object-cover" />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge variant={offering.status === 'published' ? 'success' : offering.status === 'archived' ? 'neutral' : 'warning'}>
              {offering.status}
            </Badge>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/70 to-transparent px-4 py-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">{getProviderOfferingKindLabel(offering.kind)}</p>
            <p className="mt-1 text-sm">{offering.category || offering.district || 'Local tourism business'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{getProviderOfferingKindLabel(offering.kind)}</Badge>
                {offering.category ? <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">{offering.category}</span> : null}
              </div>
              <h3 className="text-2xl font-semibold text-ink-900">{offering.name}</h3>
              <p className="max-w-2xl text-sm leading-6 text-ink-600">
                {offering.short_description || offering.description || 'No description has been added yet.'}
              </p>
            </div>
            <div className="rounded-2xl bg-sand p-3 text-ink-700">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Location</p>
              <p className="mt-2 text-sm font-medium text-ink-900">{offering.district || 'Not set'}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Price</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-ink-900">
                <Coins className="h-4 w-4 text-clay-700" />
                {formatIndianCurrency(offering.price)}
              </div>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Status</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-ink-900">
                <MapPin className="h-4 w-4 text-clay-700" />
                {offering.status}
              </div>
            </div>
          </div>

          {meta.length ? (
            <div className="flex flex-wrap gap-2 text-sm text-ink-600">
              {meta.map((item) => (
                <span key={item} className="inline-flex items-center rounded-full bg-ink-100 px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-ink-600">
              {offering.kind === 'product'
                ? 'Artisan goods and local products for travellers.'
                : offering.kind === 'experience'
                  ? 'Guided experiences, workshops, and cultural activities.'
                  : 'Stays and hospitality options for travellers.'}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link to={`/provider/${offering.kind}s/${offering.id}`} className="inline-flex items-center gap-2">
                  View
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to={`/provider/${offering.kind}s/${offering.id}/edit`} className="inline-flex items-center gap-2">
                  <PencilLine className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
              {onDelete ? (
                <Button type="button" variant="danger" onClick={() => onDelete(offering)} disabled={deleting}>
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
