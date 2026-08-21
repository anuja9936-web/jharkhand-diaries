import { useEffect, useState } from 'react';
import { TourismMap, type UserLocation } from '../../components/map/TourismMap';
import { Sparkles, MapPin, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { getPublishedDestinations } from '../../services/destinations/destinationService';
import { VERIFIED_JHARKHAND_DESTINATIONS } from '../../constants/jharkhandDistrictsGeo';
import { useGeolocation } from '../../hooks/useGeolocation';
import type { Destination } from '../../types/destination';

export function TouristMapPage() {
  const [destinations, setDestinations] = useState<Destination[]>(VERIFIED_JHARKHAND_DESTINATIONS);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const { location } = useGeolocation();

  useEffect(() => {
    let alive = true;
    async function load() {
      const data = await getPublishedDestinations();
      if (alive && data.length > 0) {
        setDestinations(data);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const userLocation: UserLocation | null = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      }
    : null;

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-ink-950 via-forest-950 to-clay-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest-300 border border-forest-500/30">
            <MapPin className="h-3.5 w-3.5" />
            <span>24-DISTRICT GIS MAP</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Interactive Tourism Geospatial Map
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Click on any of Jharkhand’s 24 districts to zoom into local waterfalls, eco-homestays, sacred groves, and trekking trails.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Link to="/tourist/explore" className="inline-flex items-center gap-1.5 text-xs">
              <Compass className="h-3.5 w-3.5" />
              <span>Explore Grid</span>
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="text-xs">
            <Link to="/plan-trip" className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Plan AI Trip</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="rounded-3xl border border-ink-200/90 bg-white p-3 shadow-lg">
        <TourismMap
          destinations={destinations}
          selectedDestination={selectedDestination}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={(d) => setSelectedDistrict(d)}
          onAddToTrip={(d) => setSelectedDestination(d)}
          userLocation={userLocation}
        />
      </div>
    </div>
  );
}
