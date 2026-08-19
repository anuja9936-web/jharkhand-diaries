import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DestinationMarker } from './DestinationMarker';
import type { Destination } from '../../types/destination';

const JHARKHAND_CENTER: [number, number] = [23.6102, 85.2799];
const JHARKHAND_ZOOM = 7.2;

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export function TourismMap({
  destinations,
  selectedDestination,
  isVisible = true,
  userLocation,
}: {
  destinations: Destination[];
  selectedDestination: Destination | null;
  isVisible?: boolean;
  userLocation: UserLocation | null;
}) {
  return (
    <MapContainer
      center={JHARKHAND_CENTER}
      zoom={JHARKHAND_ZOOM}
      scrollWheelZoom
      className="z-0 h-full min-h-[480px] w-full rounded-[1.5rem]"
      style={{ minHeight: '480px', width: '100%' }}
      whenReady={() => {
        console.log('[MAP] map mounted');
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapVisibilityController isVisible={isVisible} />
      <MapController selectedDestination={selectedDestination} userLocation={userLocation} />

      {destinations.map((destination) => (
        <DestinationMarker
          key={destination.id}
          destination={destination}
          isSelected={destination.slug === selectedDestination?.slug}
        />
      ))}

      {userLocation ? <UserLocationMarker userLocation={userLocation} /> : null}
    </MapContainer>
  );
}

function MapVisibilityController({ isVisible }: { isVisible: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isVisible, map]);

  return null;
}

function MapController({
  selectedDestination,
  userLocation,
}: {
  selectedDestination: Destination | null;
  userLocation: UserLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    const latitude = selectedDestination == null ? null : Number(selectedDestination.latitude);
    const longitude = selectedDestination == null ? null : Number(selectedDestination.longitude);

    if (!isValidCoordinates(latitude, longitude)) {
      console.warn('[MAP] invalid focus coordinates', selectedDestination);
      return;
    }

    map.flyTo([latitude!, longitude!], 13, {
      animate: true,
      duration: 1,
    });
  }, [map, selectedDestination]);

  useEffect(() => {
    if (userLocation == null) {
      return;
    }

    map.flyTo([userLocation.latitude, userLocation.longitude], 12, {
      animate: true,
      duration: 0.6,
    });
  }, [map, userLocation]);

  return null;
}

function isValidCoordinates(latitude: number | null | undefined, longitude: number | null | undefined) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function UserLocationMarker({ userLocation }: { userLocation: UserLocation }) {
  const locationIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `
          <div style="
            width:18px;
            height:18px;
            border-radius:9999px;
            background:#1e293b;
            border:3px solid #ffffff;
            box-shadow:0 0 0 8px rgba(30,41,59,0.18);
          "></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
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
          pathOptions={{ color: '#1e293b', fillColor: '#1e293b', fillOpacity: 0.08 }}
        />
      ) : null}
    </>
  );
}
