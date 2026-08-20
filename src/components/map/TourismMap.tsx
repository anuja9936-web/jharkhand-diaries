import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  Circle,
  MapContainer,
  Marker,
  Polygon,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DestinationMarker } from './DestinationMarker';
import {
  CATEGORY_THEMES,
  JHARKHAND_DISTRICTS_DATA,
  JHARKHAND_MAP_CONFIG,
} from '../../constants/jharkhandDistrictsGeo';
import type { Destination } from '../../types/destination';
import { Layers, RotateCcw } from 'lucide-react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export function TourismMap({
  destinations,
  selectedDestination,
  selectedDistrict,
  onSelectDistrict,
  onAddToTrip,
  isVisible = true,
  userLocation,
}: {
  destinations: Destination[];
  selectedDestination: Destination | null;
  selectedDistrict?: string | null;
  onSelectDistrict?: (district: string) => void;
  onAddToTrip?: (destination: Destination) => void;
  isVisible?: boolean;
  userLocation: UserLocation | null;
}) {
  const [showDistricts, setShowDistricts] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-ink-200/80 shadow-md">
      <MapContainer
        center={JHARKHAND_MAP_CONFIG.CENTER}
        zoom={JHARKHAND_MAP_CONFIG.DEFAULT_ZOOM}
        minZoom={JHARKHAND_MAP_CONFIG.MIN_ZOOM}
        maxZoom={JHARKHAND_MAP_CONFIG.MAX_ZOOM}
        maxBounds={JHARKHAND_MAP_CONFIG.BOUNDS}
        maxBoundsViscosity={JHARKHAND_MAP_CONFIG.MAX_BOUNDS_VISCOSITY}
        scrollWheelZoom={true}
        className="z-0 h-full w-full"
        style={{ height: '100%', minHeight: '520px', width: '100%' }}
      >
        {/* Crisp, light tourism tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Jharkhand Tourism GIS'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapVisibilityController isVisible={isVisible} />

        <MapFocusController
          selectedDestination={selectedDestination}
          selectedDistrict={selectedDistrict}
          userLocation={userLocation}
        />

        {/* 1. 24 District Boundaries & Polygons */}
        {showDistricts && (
          <DistrictsLayer
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
          />
        )}

        {/* 2. Tourist Destination Markers */}
        {destinations.map((destination) => (
          <DestinationMarker
            key={destination.id}
            destination={destination}
            isSelected={destination.slug === selectedDestination?.slug || destination.id === selectedDestination?.id}
            onAddToTrip={onAddToTrip}
          />
        ))}

        {/* 3. User Geolocation Marker */}
        {userLocation && <UserLocationMarker userLocation={userLocation} />}

        {/* 4. Top-Right Map Controls (Inside MapContainer to access Leaflet map context) */}
        <MapOverlayControls
          showDistricts={showDistricts}
          setShowDistricts={setShowDistricts}
        />
      </MapContainer>

      {/* Floating Legend Overlay Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-[400] pointer-events-auto">
        <div className="rounded-2xl border border-ink-200/90 bg-[#FFFDF9]/95 p-3 shadow-xl backdrop-blur-md max-w-xs sm:max-w-md">
          <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-ink-200/70">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay-700">
              Jharkhand Tourism GIS Legend
            </span>
            <button
              type="button"
              onClick={() => setShowLegend((prev) => !prev)}
              className="text-[10px] font-semibold text-ink-500 hover:text-ink-900"
            >
              {showLegend ? 'Hide' : 'Show'}
            </button>
          </div>

          {showLegend && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-medium text-ink-800">
              {Object.entries(CATEGORY_THEMES).map(([cat, config]) => (
                <div key={cat} className="flex items-center gap-1.5 truncate">
                  <span
                    style={{ backgroundColor: config.color }}
                    className="h-2.5 w-2.5 rounded-full ring-1 ring-white shrink-0"
                  />
                  <span className="truncate">{config.label.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DistrictsLayer({
  selectedDistrict,
  onSelectDistrict,
}: {
  selectedDistrict?: string | null;
  onSelectDistrict?: (district: string) => void;
}) {
  return (
    <>
      {Object.values(JHARKHAND_DISTRICTS_DATA).map((district) => {
        const isSelected =
          selectedDistrict?.toLowerCase() === district.name.toLowerCase();

        return (
          <Polygon
            key={district.name}
            positions={district.polygon}
            pathOptions={{
              color: isSelected ? '#b45309' : '#334155',
              weight: isSelected ? 3 : 1.2,
              dashArray: isSelected ? undefined : '4, 4',
              fillColor: isSelected ? '#f59e0b' : '#059669',
              fillOpacity: isSelected ? 0.18 : 0.03,
            }}
            eventHandlers={{
              click: () => {
                if (onSelectDistrict) {
                  onSelectDistrict(district.name);
                }
              },
            }}
          >
            <Tooltip
              sticky
              direction="center"
              className="district-tooltip-label"
              opacity={0.95}
            >
              <div className="text-center font-sans text-xs">
                <p className="font-bold text-ink-900">{district.name} District</p>
                <p className="text-[10px] text-ink-600">{district.description.slice(0, 45)}…</p>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}

function MapVisibilityController({ isVisible }: { isVisible: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!isVisible) return;
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isVisible, map]);

  return null;
}

function MapFocusController({
  selectedDestination,
  selectedDistrict,
  userLocation,
}: {
  selectedDestination: Destination | null;
  selectedDistrict?: string | null;
  userLocation: UserLocation | null;
}) {
  const map = useMap();

  // Focus on specific selected destination
  useEffect(() => {
    if (!selectedDestination) return;

    const lat = Number(selectedDestination.latitude);
    const lng = Number(selectedDestination.longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.flyTo([lat, lng], 13, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [map, selectedDestination]);

  // Focus on district when district changes and no destination is actively focused
  useEffect(() => {
    if (!selectedDistrict || selectedDistrict === 'all' || selectedDestination) {
      return;
    }

    const districtData = Object.values(JHARKHAND_DISTRICTS_DATA).find(
      (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
    );

    if (districtData) {
      map.flyTo(districtData.center, districtData.zoom, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [map, selectedDistrict, selectedDestination]);

  // Geolocation focus
  useEffect(() => {
    if (!userLocation) return;
    map.flyTo([userLocation.latitude, userLocation.longitude], 12, {
      animate: true,
      duration: 1,
    });
  }, [map, userLocation]);

  return null;
}

function MapOverlayControls({
  showDistricts,
  setShowDistricts,
}: {
  showDistricts: boolean;
  setShowDistricts: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const map = useMap();

  const handleReset = () => {
    map.flyTo(JHARKHAND_MAP_CONFIG.CENTER, JHARKHAND_MAP_CONFIG.DEFAULT_ZOOM, {
      animate: true,
      duration: 1,
    });
  };

  return (
    <div
      className="leaflet-top leaflet-right !pointer-events-auto"
      style={{ marginTop: '12px', marginRight: '12px', zIndex: 1000 }}
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-ink-800 shadow-md backdrop-blur-md hover:bg-sand transition-all cursor-pointer"
          title="Reset Map to Full Jharkhand View"
        >
          <RotateCcw className="h-3.5 w-3.5 text-clay-700" />
          <span>Reset View</span>
        </button>

        <button
          type="button"
          onClick={() => setShowDistricts((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold backdrop-blur-md shadow-md transition-all cursor-pointer ${
            showDistricts
              ? 'bg-forest-900 text-white border-forest-700'
              : 'bg-white/95 text-ink-800 border-ink-200 hover:bg-sand'
          }`}
          title="Toggle 24 District Boundaries"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>24 Districts</span>
        </button>
      </div>
    </div>
  );
}

function UserLocationMarker({ userLocation }: { userLocation: UserLocation }) {
  const locationIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `
          <div style="
            width:20px;
            height:20px;
            border-radius:9999px;
            background:#0284c7;
            border:3px solid #ffffff;
            box-shadow:0 0 0 6px rgba(2,132,199,0.25);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    []
  );

  return (
    <>
      <Marker position={[userLocation.latitude, userLocation.longitude]} icon={locationIcon} />
      {userLocation.accuracy != null ? (
        <Circle
          center={[userLocation.latitude, userLocation.longitude]}
          radius={userLocation.accuracy}
          pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.08 }}
        />
      ) : null}
    </>
  );
}
