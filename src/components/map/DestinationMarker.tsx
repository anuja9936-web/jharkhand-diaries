import { useEffect, useMemo, useRef } from 'react';
import { divIcon, type DivIcon, type Marker as LeafletMarker } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { DEFAULT_DESTINATION_IMAGE, getDestinationCategoryLabel } from '../../constants/destinations';
import type { Destination } from '../../types/destination';
import { Badge, Button, Card } from '../ui';
import { formatIndianCurrency } from '../../lib/utils';
import { Leaf } from 'lucide-react';

const MARKER_COLORS: Record<Destination['category'], string> = {
  waterfall: '#ef7b3a',
  heritage: '#56463a',
  tribal_culture: '#b84516',
  eco: '#337246',
  craft: '#943411',
  adventure: '#d75d1c',
  religious: '#74290d',
  wildlife: '#20472f',
};

function createDestinationIcon(category: Destination['category'], isSelected: boolean): DivIcon {
  const color = MARKER_COLORS[category];

  return divIcon({
    className: '',
    html: `
      <div style="
        width:${isSelected ? 36 : 28}px;
        height:${isSelected ? 36 : 28}px;
        border-radius:9999px;
        background:${color};
        border:3px solid rgba(255,255,255,0.95);
        box-shadow:0 10px 24px rgba(0,0,0,0.25);
        display:flex;
        align-items:center;
        justify-content:center;
        transform:${isSelected ? 'scale(1.08)' : 'scale(1)'};
      ">
        <div style="
          width:${isSelected ? 10 : 8}px;
          height:${isSelected ? 10 : 8}px;
          border-radius:9999px;
          background:rgba(255,255,255,0.95);
        "></div>
      </div>
    `,
    iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
    iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
    popupAnchor: [0, isSelected ? -16 : -12],
  });
}

function hasValidCoordinate(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function DestinationMarker({
  destination,
  isSelected,
}: {
  destination: Destination;
  isSelected: boolean;
}) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const latitude = Number(destination.latitude);
  const longitude = Number(destination.longitude);
  const coverImage = destination.cover_image || DEFAULT_DESTINATION_IMAGE;
  const icon = useMemo(() => createDestinationIcon(destination.category, isSelected), [destination.category, isSelected]);

  useEffect(() => {
    if (!isSelected) {
      return;
    }

    markerRef.current?.openPopup();
  }, [isSelected]);

  if (!hasValidCoordinate(latitude) || !hasValidCoordinate(longitude)) {
    return null;
  }

  return (
    <Marker
      ref={markerRef}
      position={[latitude, longitude]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      riseOnHover
      eventHandlers={{
        click: () => {
          markerRef.current?.openPopup();
        },
      }}
    >
      <Popup
        closeButton={false}
        autoPan
        eventHandlers={{
          add: () => {
            console.log('[POPUP] mounted', destination.slug);
          },
        }}
      >
        <Card className="w-72 border-0 bg-white p-0 shadow-none">
          <div className="overflow-hidden rounded-2xl">
            <img src={coverImage} alt={destination.name} className="h-28 w-full object-cover" />
          </div>
          <div className="space-y-3 p-2 pt-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-ink-900">{destination.name}</h3>
              <p className="text-xs text-ink-500">{destination.district}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{getDestinationCategoryLabel(destination.category)}</Badge>
                {destination.eco_zone ? (
                  <Badge variant="success" className="inline-flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    Eco zone
                  </Badge>
                ) : null}
              </div>
            </div>
            <p className="text-sm leading-6 text-ink-600">
              {destination.short_description || destination.description || 'Destination details coming soon.'}
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-clay-700">
                {formatIndianCurrency(destination.entry_fee)}
              </p>
              <Button
                type="button"
                variant="secondary"
                asChild
              >
                <Link
                  to={`/destinations/${destination.slug}`}
                >
                  View Destination
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </Popup>
    </Marker>
  );
}
