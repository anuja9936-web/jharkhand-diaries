import { Leaf, MapPin, Mountain, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_DESTINATION_IMAGE, getDestinationCategoryLabel } from '../../constants/destinations';
import type { Destination } from '../../types/destination';
import { formatIndianCurrency } from '../../lib/utils';
import { Badge, Button, Card } from '../ui';
import type { ReactNode } from 'react';

export function DestinationCard({
  destination,
  isActive = false,
  onShowOnMap,
  topRightAction,
}: {
  destination: Destination;
  isActive?: boolean;
  onShowOnMap?: (destination: Destination) => void;
  topRightAction?: ReactNode;
}) {
  const coverImage = destination.cover_image || DEFAULT_DESTINATION_IMAGE;

  return (
    <Card
      className={[
        'group overflow-hidden p-0 transition-transform duration-300 hover:-translate-y-1',
        isActive ? 'ring-2 ring-clay-400 ring-offset-2 ring-offset-sand' : '',
      ].join(' ')}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <img
          src={coverImage}
          alt={destination.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="accent">{getDestinationCategoryLabel(destination.category)}</Badge>
          {destination.eco_zone ? (
            <Badge variant="success" className="inline-flex items-center gap-1">
              <Leaf className="h-3.5 w-3.5" />
              Eco zone
            </Badge>
          ) : null}
        </div>
        {topRightAction ? <div className="absolute right-4 top-4">{topRightAction}</div> : null}
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-ink-900">{destination.name}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {destination.district}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mountain className="h-4 w-4" />
              {formatIndianCurrency(destination.entry_fee)}
            </span>
          </div>
        </div>

        <p className="min-h-[4.5rem] text-sm leading-6 text-ink-600">
          {destination.short_description || destination.description || 'Destination details will appear here soon.'}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-clay-700">
            {destination.best_time || 'Best time: check locally'}
          </p>
          <div className="flex flex-wrap gap-2">
            {onShowOnMap ? (
              <Button
                type="button"
                variant="secondary"
                onClick={(event) => {
                  event.preventDefault();
                  onShowOnMap(destination);
                }}
              >
                Show on Map
              </Button>
            ) : null}
            <Button asChild variant="secondary">
              <Link to={`/destinations/${destination.slug}`} className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                View details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
