import { useCallback, useState } from 'react';
import type { UserLocation } from '../components/map/TourismMap';

type LocationStatus = 'idle' | 'requesting' | 'success' | 'error';

function getFriendlyGeolocationError(error: GeolocationPositionError | Error): string {
  if ('code' in error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access was denied. You can still explore Jharkhand manually.';
      case error.POSITION_UNAVAILABLE:
        return 'Your location could not be determined right now. Try again later or continue exploring manually.';
      case error.TIMEOUT:
        return 'Location request timed out. You can try again or continue exploring manually.';
      default:
        return 'Location access could not be completed right now. You can still explore Jharkhand manually.';
    }
  }

  return 'Location access could not be completed right now. You can still explore Jharkhand manually.';
}

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Your browser does not support location access. You can still explore Jharkhand manually.');
      return;
    }

    setStatus('requesting');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || null,
        });
        setStatus('success');
      },
      (error) => {
        setStatus('error');
        setErrorMessage(getFriendlyGeolocationError(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const clearError = useCallback(() => setErrorMessage(null), []);

  return {
    location,
    status,
    errorMessage,
    requestLocation,
    clearError,
  };
}
