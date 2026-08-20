import { useEffect, useMemo, useRef } from 'react';
import { divIcon, type DivIcon, type Marker as LeafletMarker } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Coins,
  ExternalLink,
  Leaf,
  MapPin,
  Plus,
} from 'lucide-react';
import { DEFAULT_DESTINATION_IMAGE } from '../../constants/destinations';
import { CATEGORY_THEMES } from '../../constants/jharkhandDistrictsGeo';
import type { Destination } from '../../types/destination';
import { formatIndianCurrency } from '../../lib/utils';
import { Button } from '../ui';

function createThemedMarkerIcon(
  category: Destination['category'],
  isSelected: boolean
): DivIcon {
  const theme = CATEGORY_THEMES[category] ?? CATEGORY_THEMES.waterfall;
  const size = isSelected ? 42 : 32;
  const pulseHtml = isSelected
    ? `<div class="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping pointer-events-none"></div>`
    : '';

  return divIcon({
    className: 'custom-tourism-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
        isSelected ? 'scale-110 z-50' : 'hover:scale-110'
      }">
        ${pulseHtml}
        <div style="
          width:${size}px;
          height:${size}px;
          background-color:${theme.color};
          border:3px solid #ffffff;
          box-shadow:0 8px 20px rgba(0,0,0,0.35);
        " class="rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300">
          <div class="flex items-center justify-center pointer-events-none">
            ${theme.svgIcon}
          </div>
        </div>
        <div style="
          position:absolute;
          bottom:-5px;
          width:0;
          height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:6px solid ${theme.color};
        "></div>
      </div>
    `,
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 6],
    popupAnchor: [0, -(size + 8)],
  });
}

function hasValidCoordinate(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function DestinationMarker({
  destination,
  isSelected,
  onAddToTrip,
}: {
  destination: Destination;
  isSelected: boolean;
  onAddToTrip?: (destination: Destination) => void;
}) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const latitude = Number(destination.latitude);
  const longitude = Number(destination.longitude);
  const coverImage = destination.cover_image || DEFAULT_DESTINATION_IMAGE;
  const theme = CATEGORY_THEMES[destination.category] ?? CATEGORY_THEMES.waterfall;

  const icon = useMemo(
    () => createThemedMarkerIcon(destination.category, isSelected),
    [destination.category, isSelected]
  );

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  if (!hasValidCoordinate(latitude) || !hasValidCoordinate(longitude)) {
    return null;
  }

  return (
    <Marker
      ref={markerRef}
      position={[latitude, longitude]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 100}
      riseOnHover
    >
      <Popup
        closeButton={true}
        autoPan={true}
        className="tourism-destination-popup"
        maxWidth={320}
      >
        <div className="w-72 overflow-hidden rounded-2xl bg-[#FFFDF9] text-ink-900 shadow-xl border border-ink-200/90 p-0 font-sans">
          {/* Thumbnail Cover with Category Pill */}
          <div className="relative h-32 w-full overflow-hidden bg-sand">
            <img
              src={coverImage}
              alt={destination.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/600x400/png?text=' + encodeURIComponent(destination.name);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

            {/* Badges on Image */}
            <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5 z-10">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border shadow-xs ${theme.bgBadge}`}>
                {theme.label}
              </span>
              {destination.eco_zone && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-900/90 text-forest-200 border border-forest-500/40 px-2 py-0.5 text-[10px] font-bold shadow-xs">
                  <Leaf className="h-3 w-3 text-forest-300" />
                  Eco Zone
                </span>
              )}
            </div>

            {/* Title on bottom of image */}
            <div className="absolute bottom-2 left-2.5 right-2.5 z-10">
              <h3 className="font-display text-base font-bold text-white leading-tight drop-shadow-md truncate">
                {destination.name}
              </h3>
              <p className="flex items-center gap-1 text-[11px] text-sand/90 font-medium drop-shadow-sm">
                <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                <span>{destination.district} District</span>
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-3.5 space-y-3">
            <p className="text-xs text-ink-700 leading-relaxed line-clamp-2">
              {destination.short_description ||
                destination.description ||
                'Explore this iconic tourist attraction in Jharkhand.'}
            </p>

            {/* Metadata Badges: Best Time & Fee */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-ink-200/60 text-[11px]">
              <div className="flex items-center gap-1.5 text-ink-600">
                <CalendarDays className="h-3.5 w-3.5 text-clay-700 shrink-0" />
                <span className="truncate">{destination.best_time || 'October to March'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-ink-600">
                <Coins className="h-3.5 w-3.5 text-forest-700 shrink-0" />
                <span className="font-semibold text-ink-900">
                  {destination.entry_fee && destination.entry_fee > 0
                    ? formatIndianCurrency(destination.entry_fee)
                    : 'Free Entry'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-ink-200/60">
              <Button
                asChild
                size="sm"
                className="flex-1 bg-forest-900 text-white hover:bg-forest-800 text-xs font-bold py-1.5 h-auto justify-center"
              >
                <Link to={`/destinations/${destination.slug}`}>
                  <span>View Details</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>

              {onAddToTrip && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => onAddToTrip(destination)}
                  className="text-xs font-bold py-1.5 h-auto border border-ink-300 hover:bg-sand"
                  title="Add to Itinerary"
                >
                  <Plus className="h-3.5 w-3.5 mr-0.5 text-clay-700" />
                  <span>Trip</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
