import { CalendarDays, Leaf, Map, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_DESTINATION_IMAGE, getDestinationCategoryLabel } from '../../constants/destinations';
import type { Destination } from '../../types/destination';
import { formatIndianCurrency } from '../../lib/utils';
import { Badge, Button, Card } from '../ui';
import { TourismImage } from '../common/TourismImage';
import type { ReactNode } from 'react';

export function DestinationCard({
  destination,
  isActive = false,
  onShowOnMap,
  onAddToTrip,
  topRightAction,
  variant = 'default',
}: {
  destination: Destination;
  isActive?: boolean;
  /** Legacy: used in MapDiscoveryPage to focus the map on this destination */
  onShowOnMap?: (destination: Destination) => void;
  /** Opens the Add-to-Trip modal */
  onAddToTrip?: (destination: Destination) => void;
  topRightAction?: ReactNode;
  /** 'featured' renders a larger card with a taller image */
  variant?: 'default' | 'featured';
}) {
  const coverImage = destination.cover_image || DEFAULT_DESTINATION_IMAGE;
  const imageAspect = variant === 'featured' ? 'aspect-[16/9]' : 'aspect-[4/3]';

  return (
    <Card
      className={[
        'group overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        isActive ? 'ring-2 ring-clay-400 ring-offset-2 ring-offset-sand' : '',
      ].join(' ')}
    >
      {/* Image */}
      <div className={`relative ${imageAspect} overflow-hidden bg-sand`}>
        <TourismImage
          src={coverImage}
          alt={destination.name}
          category={destination.category}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent pointer-events-none" />

        {/* Top-left badges */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="accent">{getDestinationCategoryLabel(destination.category)}</Badge>
          {destination.eco_zone ? (
            <Badge variant="success" className="inline-flex items-center gap-1">
              <Leaf className="h-3.5 w-3.5" />
              Eco zone
            </Badge>
          ) : null}
        </div>

        {/* Top-right action (e.g. FavouriteButton) */}
        {topRightAction ? (
          <div className="absolute right-4 top-4">{topRightAction}</div>
        ) : null}

        {/* Bottom overlay — district */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90">
            <MapPin className="h-3.5 w-3.5 text-clay-300" />
            {destination.district}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div className="space-y-4 p-5">
        <div className="space-y-1.5">
          <h3 className="text-xl font-semibold text-ink-900">{destination.name}</h3>
          <p className="min-h-[3.75rem] text-sm leading-6 text-ink-600">
            {destination.short_description || destination.description || 'Destination details coming soon.'}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-ink-500">
          {destination.best_time ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-clay-600" />
              {destination.best_time}
            </span>
          ) : null}
          <span className="font-medium text-ink-700">
            {formatIndianCurrency(destination.entry_fee)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button asChild variant="primary" className="flex-1">
            <Link to={`/destinations/${destination.slug}`} className="inline-flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Explore
            </Link>
          </Button>

          <Button asChild variant="secondary">
            <Link
              to={`/map?destination=${destination.slug}`}
              title="View on map"
              className="inline-flex items-center gap-1.5"
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </Link>
          </Button>

          {/* Legacy onShowOnMap support (used in MapDiscoveryPage) */}
          {onShowOnMap ? (
            <Button
              type="button"
              variant="secondary"
              onClick={(event) => {
                event.preventDefault();
                onShowOnMap(destination);
              }}
              className="hidden"
              aria-hidden
            />
          ) : null}

          {onAddToTrip ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onAddToTrip(destination)}
              title="Add to My Trip"
            >
              + Trip
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
