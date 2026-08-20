import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  Circle,
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DestinationMarker } from './DestinationMarker';
import {
  CATEGORY_THEMES,
  JHARKHAND_DISTRICTS_DATA,
  JHARKHAND_DISTRICTS_GEOJSON,
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

  // Calculate actual Jharkhand geographic bounds directly from GeoJSON
  const jharkhandBounds = useMemo(() => {
    return L.geoJSON(JHARKHAND_DISTRICTS_GEOJSON).getBounds();
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-ink-200/80 shadow-md">
      <MapContainer
        bounds={jharkhandBounds}
        boundsOptions={{ padding: [20, 20] }}
        minZoom={7}
        maxZoom={16}
        maxBounds={jharkhandBounds.pad(0.2)}
        maxBoundsViscosity={0.95}
        scrollWheelZoom={true}
        className="z-0 h-full w-full"
        style={{ height: '100%', minHeight: '520px', width: '100%' }}
      >
        {/* Crisp, modern OpenStreetMap tourism tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Jharkhand Tourism GIS'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapVisibilityController isVisible={isVisible} />

        <MapFocusController
          jharkhandBounds={jharkhandBounds}
          selectedDestination={selectedDestination}
          selectedDistrict={selectedDistrict}
          userLocation={userLocation}
        />

        {/* 1. Authentic 24 District GeoJSON Layer */}
        {showDistricts && (
          <DistrictsGeoLayer
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
          />
        )}

        {/* 2. District Centroid Name Labels (Text-only, no square containers) */}
        {showDistricts && <DistrictCentroidLabels />}

        {/* 3. Tourist Destination Markers (Always rendered above district polygons) */}
        {destinations.map((destination) => (
          <DestinationMarker
            key={destination.id}
            destination={destination}
            isSelected={destination.slug === selectedDestination?.slug || destination.id === selectedDestination?.id}
            onAddToTrip={onAddToTrip}
          />
        ))}

        {/* 4. User Geolocation Marker */}
        {userLocation && <UserLocationMarker userLocation={userLocation} />}

        {/* 5. Top-Right Map Controls */}
        <MapOverlayControls
          jharkhandBounds={jharkhandBounds}
          showDistricts={showDistricts}
          setShowDistricts={setShowDistricts}
          onResetDistrict={() => onSelectDistrict && onSelectDistrict('all')}
        />
      </MapContainer>

      {/* Floating Legend Overlay Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-[400] pointer-events-auto">
        <div className="rounded-2xl border border-ink-200/90 bg-[#FFFDF9]/95 p-3 shadow-xl backdrop-blur-md max-w-xs sm:max-w-md">
          <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-ink-200/70">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay-700">
              Jharkhand Tourism Legend
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

function DistrictsGeoLayer({
  selectedDistrict,
  onSelectDistrict,
}: {
  selectedDistrict?: string | null;
  onSelectDistrict?: (district: string) => void;
}) {
  return (
    <GeoJSON
      key={selectedDistrict || 'all'}
      data={JHARKHAND_DISTRICTS_GEOJSON}
      style={(feature) => {
        const districtName = (feature?.properties?.name || '').toLowerCase();
        const isSelected = Boolean(
          selectedDistrict &&
          selectedDistrict !== 'all' &&
          districtName === selectedDistrict.toLowerCase()
        );

        return {
          color: isSelected ? '#b45309' : '#047857',
          weight: isSelected ? 3.5 : 1.4,
          fillColor: isSelected ? '#d97706' : '#10b981',
          fillOpacity: isSelected ? 0.32 : 0.05,
        };
      }}
      onEachFeature={(feature, layer) => {
        const districtName = feature.properties?.name || 'District';
        const districtMeta = Object.values(JHARKHAND_DISTRICTS_DATA).find(
          (d) => d.name.toLowerCase() === districtName.toLowerCase()
        );

        layer.bindTooltip(
          `<div style="font-family: sans-serif; text-align: center; padding: 2px;">
            <strong style="color: #0f172a; font-size: 12px;">${districtName} District</strong>
            ${districtMeta ? `<div style="color: #9a3412; font-size: 10px; font-weight: 600;">HQ: ${districtMeta.hq}</div>` : ''}
          </div>`,
          { sticky: true, direction: 'center', className: 'district-tooltip-label' }
        );

        layer.on({
          click: () => {
            if (onSelectDistrict) {
              onSelectDistrict(districtName);
            }
          },
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 2.5,
              color: '#d97706',
              fillOpacity: 0.2,
            });
          },
          mouseout: (e) => {
            const districtLower = districtName.toLowerCase();
            const isSelected = Boolean(
              selectedDistrict &&
              selectedDistrict !== 'all' &&
              districtLower === selectedDistrict.toLowerCase()
            );
            e.target.setStyle({
              color: isSelected ? '#b45309' : '#047857',
              weight: isSelected ? 3.5 : 1.4,
              fillColor: isSelected ? '#d97706' : '#10b981',
              fillOpacity: isSelected ? 0.32 : 0.05,
            });
          },
        });
      }}
    />
  );
}

function DistrictCentroidLabels() {
  return (
    <>
      {Object.values(JHARKHAND_DISTRICTS_DATA).map((district) => {
        const textIcon = L.divIcon({
          className: 'district-centroid-label',
          html: `<div style="
            font-family: sans-serif;
            font-size: 10px;
            font-weight: 700;
            color: #334155;
            text-shadow: 0 0 4px #ffffff, 0 0 4px #ffffff;
            pointer-events: none;
            white-space: nowrap;
            text-align: center;
          ">${district.name}</div>`,
          iconSize: [80, 16],
          iconAnchor: [40, 8],
        });

        return (
          <Marker
            key={`label-${district.name}`}
            position={district.center}
            icon={textIcon}
            interactive={false}
          />
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
  jharkhandBounds,
  selectedDestination,
  selectedDistrict,
  userLocation,
}: {
  jharkhandBounds: L.LatLngBounds;
  selectedDestination: Destination | null;
  selectedDistrict?: string | null;
  userLocation: UserLocation | null;
}) {
  const map = useMap();

  // Initial fitBounds on mount
  useEffect(() => {
    map.fitBounds(jharkhandBounds, {
      padding: [20, 20],
      animate: false,
    });
  }, [map, jharkhandBounds]);

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
    if (selectedDestination) return;

    if (!selectedDistrict || selectedDistrict === 'all') {
      map.flyToBounds(jharkhandBounds, {
        padding: [20, 20],
        animate: true,
        duration: 1,
      });
      return;
    }

    const feature = JHARKHAND_DISTRICTS_GEOJSON.features.find(
      (f) => (f.properties?.name || '').toLowerCase() === selectedDistrict.toLowerCase()
    );

    if (feature) {
      const bounds = L.geoJSON(feature).getBounds();
      map.flyToBounds(bounds, {
        padding: [30, 30],
        animate: true,
        duration: 1.2,
      });
    }
  }, [map, selectedDistrict, selectedDestination, jharkhandBounds]);

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
  jharkhandBounds,
  showDistricts,
  setShowDistricts,
  onResetDistrict,
}: {
  jharkhandBounds: L.LatLngBounds;
  showDistricts: boolean;
  setShowDistricts: React.Dispatch<React.SetStateAction<boolean>>;
  onResetDistrict?: () => void;
}) {
  const map = useMap();

  const handleReset = () => {
    if (onResetDistrict) {
      onResetDistrict();
    }
    map.flyToBounds(jharkhandBounds, {
      padding: [20, 20],
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
