import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Compass, LocateFixed, MapPin, Search, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { TourismMap } from '../../components/map/TourismMap';
import { DESTINATION_CATEGORY_LABELS, DESTINATION_CATEGORY_OPTIONS } from '../../constants/destinations';
import { getPublishedDestinations } from '../../services/destinations/destinationService';
import { useGeolocation } from '../../hooks/useGeolocation';
import type { Destination } from '../../types/destination';
import { Button, Input } from '../../components/ui';

export function MapDiscoveryPage() {
  const [searchParams] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { location: userLocation, requestLocation } = useGeolocation();

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const data = await getPublishedDestinations();
        if (mounted && data) {
          setDestinations(data);
          const targetSlug = searchParams.get('destination');
          const targetDistrict = searchParams.get('district');
          if (targetSlug) {
            const found = data.find((d) => d.slug === targetSlug || d.id === targetSlug);
            if (found) {
              setSelectedDestination(found);
            } else if (data.length > 0) {
              setSelectedDestination(data[0]);
            }
          } else if (data.length > 0) {
            setSelectedDestination(data[0]);
          }

          if (targetDistrict) {
            setSearchTerm(targetDistrict);
          }
        }
      } catch (err) {
        console.error('[MapPage] Failed loading destinations', err);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  useEffect(() => {
    const targetSlug = searchParams.get('destination');
    if (targetSlug && destinations.length > 0) {
      const found = destinations.find((d) => d.slug === targetSlug || d.id === targetSlug);
      if (found) {
        setSelectedDestination(found);
      }
    }
  }, [searchParams, destinations]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchCat = activeCategory === 'all' || dest.category === activeCategory;
      const matchSearch =
        !searchTerm.trim() ||
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.district.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [destinations, activeCategory, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-ink-200 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-600 hover:text-ink-900 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <span className="text-ink-300">/</span>
            <h1 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
              <Compass className="h-4 w-4 text-clay-700" />
              <span>Interactive GIS Map of Jharkhand</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={requestLocation}
              className="text-xs"
            >
              <LocateFixed className="h-3.5 w-3.5 text-clay-700" />
              <span>Locate Me</span>
            </Button>
            <Button asChild size="sm">
              <Link to="/explore">Explore List View</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-7rem)] overflow-hidden">
        {/* Left Side: Destination Directory Drawer */}
        <div className="bg-white border-r border-ink-200/80 p-4 overflow-y-auto flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" />
              <Input
                type="text"
                placeholder="Search places or districts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-xs"
              />
            </div>

            {/* Category Select Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-ink-600">
                Filter by Category
              </label>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-xs font-semibold text-ink-900 focus:outline-none"
              >
                {DESTINATION_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Count & Result List */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink-500 mb-2">
                <span>{filteredDestinations.length} Places Found</span>
              </div>

              <div className="space-y-2">
                {filteredDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => setSelectedDestination(dest)}
                    className={[
                      'w-full text-left p-3 rounded-2xl border transition-all text-xs flex flex-col gap-1',
                      selectedDestination?.id === dest.id
                        ? 'border-clay-500 bg-clay-50/80 shadow-xs'
                        : 'border-ink-100 bg-white hover:border-ink-200 hover:bg-sand/20',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink-900 text-sm">{dest.name}</span>
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-700">
                        {DESTINATION_CATEGORY_LABELS[dest.category]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-ink-500">
                      <MapPin className="h-3 w-3 text-clay-700" />
                      <span>{dest.district} District</span>
                      {dest.eco_zone && (
                        <span className="inline-flex items-center gap-0.5 text-forest-700 font-semibold ml-1">
                          • <ShieldCheck className="h-3 w-3" /> Eco Zone
                        </span>
                      )}
                    </div>

                    {selectedDestination?.id === dest.id && (
                      <div className="mt-2 pt-2 border-t border-clay-200 flex items-center justify-between">
                        <Link
                          to={`/destinations/${dest.slug}`}
                          className="font-bold text-clay-800 hover:text-clay-950 underline text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Full Destination Guide →
                        </Link>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Full Screen Map */}
        <div className="lg:col-span-2 relative h-full w-full bg-ink-100">
          <TourismMap
            destinations={filteredDestinations}
            selectedDestination={selectedDestination}
            userLocation={userLocation}
            isVisible={true}
          />
        </div>
      </div>
    </div>
  );
}
