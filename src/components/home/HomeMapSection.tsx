import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, MapPin, Navigation, Sparkles } from 'lucide-react';
import { TourismMap } from '../map/TourismMap';
import { getPublishedDestinations } from '../../services/destinations/destinationService';
import type { Destination } from '../../types/destination';
import { Button } from '../ui';

export function HomeMapSection() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDestinations() {
      try {
        const data = await getPublishedDestinations();
        if (isMounted && data && data.length > 0) {
          setDestinations(data);
          setSelectedDestination(data[0]);
        }
      } catch (e) {
        console.warn('[HomeMap] Could not load live destinations', e);
      }
    }

    fetchDestinations();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-sand/40 border-y border-ink-200/70 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-3.5 py-1 text-xs font-bold text-forest-800">
              <Navigation className="h-3.5 w-3.5" />
              <span>GIS INTERACTIVE MAPPING</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
              Find Your Way Around Jharkhand
            </h2>
            <p className="text-sm sm:text-base text-ink-600">
              Locate waterfalls, sanctuaries, hill stations, and heritage monuments across all 24 districts.
            </p>
          </div>

          <Button asChild className="shrink-0">
            <Link to="/map" className="inline-flex items-center gap-2">
              <Compass className="h-4 w-4" />
              <span>EXPLORE THE MAP</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Map Container + Destination Quick Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-3xl border border-ink-200/90 bg-[#FFFDF9] p-3 sm:p-4 shadow-xl">
          {/* Quick Destination Pills Drawer */}
          <div className="p-4 flex flex-col justify-between space-y-4 max-h-[480px] overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-clay-700">
                  Featured Coordinates
                </span>
                <span className="text-[11px] font-semibold text-ink-500">
                  {destinations.length} Places Mapped
                </span>
              </div>

              <div className="space-y-2">
                {destinations.slice(0, 5).map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => setSelectedDestination(dest)}
                    className={[
                      'w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between group',
                      selectedDestination?.id === dest.id
                        ? 'border-clay-400 bg-clay-50/80 shadow-xs'
                        : 'border-ink-100 hover:border-ink-200 hover:bg-sand/30',
                    ].join(' ')}
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-ink-900 group-hover:text-clay-800">
                        {dest.name}
                      </p>
                      <p className="text-xs text-ink-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-clay-600" />
                        <span>{dest.district} District</span>
                      </p>
                    </div>
                    <ArrowRight
                      className={[
                        'h-4 w-4 transition-transform',
                        selectedDestination?.id === dest.id
                          ? 'text-clay-700 translate-x-1'
                          : 'text-ink-300 opacity-0 group-hover:opacity-100',
                      ].join(' ')}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Distinction Card */}
            <div className="p-4 rounded-2xl bg-ink-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>HOW TO NAVIGATE</span>
              </div>
              <p className="text-xs text-sand/80 leading-relaxed">
                <strong>Explore</strong> helps you find <em>what</em> to discover, while <strong>Map</strong> shows you <em>where</em> everything is located with driving distances.
              </p>
            </div>
          </div>

          {/* Interactive Map Wrapper */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-ink-200/80 h-[480px]">
            <TourismMap
              destinations={destinations}
              selectedDestination={selectedDestination}
              userLocation={null}
              isVisible={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
