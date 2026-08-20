import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Compass,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { TourismMap } from '../../components/map/TourismMap';
import { AddToTripModal } from '../../components/destinations/AddToTripModal';
import {
  DESTINATION_CATEGORY_OPTIONS,
  JHARKHAND_DISTRICTS,
} from '../../constants/destinations';
import {
  CATEGORY_THEMES,
  JHARKHAND_DISTRICTS_DATA,
} from '../../constants/jharkhandDistrictsGeo';
import { getPublishedDestinations } from '../../services/destinations/destinationService';
import { useGeolocation } from '../../hooks/useGeolocation';
import type { Destination } from '../../types/destination';
import { Badge, Button, Input } from '../../components/ui';

interface AddToTripState {
  destinationId: string;
  destinationName: string;
}

export function MapDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addToTripState, setAddToTripState] = useState<AddToTripState | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'places' | 'districts'>('places');

  const { location: userLocation, requestLocation } = useGeolocation();

  // Load destination data
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
              setSelectedDistrict(found.district);
            }
          }

          if (targetDistrict) {
            setSelectedDistrict(targetDistrict);
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

  // Synchronize state when URL params change
  useEffect(() => {
    const targetSlug = searchParams.get('destination');
    const targetDistrict = searchParams.get('district');

    if (targetSlug && destinations.length > 0) {
      const found = destinations.find((d) => d.slug === targetSlug || d.id === targetSlug);
      if (found) {
        setSelectedDestination(found);
      }
    } else if (!targetSlug) {
      setSelectedDestination(null);
    }

    if (targetDistrict) {
      setSelectedDistrict(targetDistrict);
    }
  }, [searchParams, destinations]);

  // Filter destinations based on search term, category, and district
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchCat = activeCategory === 'all' || dest.category === activeCategory;
      const matchDistrict =
        selectedDistrict === 'all' ||
        dest.district.toLowerCase() === selectedDistrict.toLowerCase();

      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        dest.name.toLowerCase().includes(q) ||
        dest.district.toLowerCase().includes(q) ||
        dest.category.toLowerCase().includes(q) ||
        (dest.short_description && dest.short_description.toLowerCase().includes(q));

      return matchCat && matchDistrict && matchSearch;
    });
  }, [destinations, activeCategory, selectedDistrict, searchTerm]);

  const handleSelectDestination = (dest: Destination) => {
    setSelectedDestination(dest);
    setSearchParams({ destination: dest.slug, ...(selectedDistrict !== 'all' ? { district: selectedDistrict } : {}) });
  };

  const handleSelectDistrict = (district: string) => {
    setSelectedDistrict(district);
    setSelectedDestination(null);
    setSearchParams({ district });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
    setSelectedDistrict('all');
    setSelectedDestination(null);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* ── Add-to-Trip Modal ──────────────────────────────────────────────── */}
      {addToTripState && (
        <AddToTripModal
          destinationId={addToTripState.destinationId}
          destinationName={addToTripState.destinationName}
          onClose={() => setAddToTripState(null)}
        />
      )}

      {/* ── Top Header Navigation Bar ─────────────────────────────────────── */}
      <div className="bg-white border-b border-ink-200/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-600 hover:text-ink-950 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <span className="text-ink-300">/</span>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-clay-100 p-1.5 text-clay-700">
                <Compass className="h-full w-full" />
              </div>
              <div>
                <h1 className="font-display text-sm sm:text-base font-bold text-ink-950 leading-tight">
                  Jharkhand Interactive Tourism GIS Map
                </h1>
                <p className="text-[11px] text-ink-500 hidden sm:block">
                  Explore tourist landmarks, waterfalls, wildlife sanctuaries &amp; 24 district boundaries
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={requestLocation}
              className="text-xs font-semibold"
            >
              <LocateFixed className="h-3.5 w-3.5 text-clay-700 mr-1" />
              <span>My Location</span>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-forest-900 text-white hover:bg-forest-800 text-xs font-bold"
            >
              <Link to="/explore">Explore List View</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Interactive Discovery Grid ───────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_1fr] h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Side: Directory & Search Drawer */}
        <div className="bg-[#FFFDF9] border-r border-ink-200/80 p-4 overflow-y-auto flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" />
              <Input
                type="text"
                placeholder="Search waterfalls, Betla, Ranchi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-8 text-xs bg-white border-ink-200 focus:border-clay-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-3 text-ink-400 hover:text-ink-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* View Switcher Tabs: Places vs Districts */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-sand/60 p-1 text-xs font-bold text-ink-700">
              <button
                type="button"
                onClick={() => setActiveViewTab('places')}
                className={`rounded-lg py-1.5 transition-all ${
                  activeViewTab === 'places'
                    ? 'bg-white text-ink-950 shadow-xs'
                    : 'hover:text-ink-950'
                }`}
              >
                Places ({filteredDestinations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('districts')}
                className={`rounded-lg py-1.5 transition-all ${
                  activeViewTab === 'districts'
                    ? 'bg-white text-ink-950 shadow-xs'
                    : 'hover:text-ink-950'
                }`}
              >
                24 Districts
              </button>
            </div>

            {/* Filter Controls Bar */}
            <div className="grid grid-cols-2 gap-2">
              {/* Category Dropdown */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">
                  Category
                </label>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-1 focus:ring-clay-400"
                >
                  {DESTINATION_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Dropdown */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">
                  District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleSelectDistrict(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-1 focus:ring-clay-400"
                >
                  <option value="all">All 24 Districts</option>
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Pill & Clear Button */}
            {(searchTerm || activeCategory !== 'all' || selectedDistrict !== 'all') && (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-sand/40 p-2 text-xs border border-ink-200/60">
                <span className="text-ink-600 truncate text-[11px]">
                  Filtered: <strong className="text-ink-900">{selectedDistrict !== 'all' ? selectedDistrict : ''} {activeCategory !== 'all' ? activeCategory : ''} {searchTerm}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-clay-700 hover:text-clay-900 shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>
            )}

            {/* ── Content List based on active tab ──────────────────────── */}
            {activeViewTab === 'places' ? (
              <div className="space-y-2 pt-1">
                {filteredDestinations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-ink-300 p-6 text-center text-xs text-ink-500 space-y-2">
                    <p className="font-semibold text-ink-800">No destinations found</p>
                    <p>Try clearing your category or district filters.</p>
                    <Button size="sm" variant="secondary" onClick={handleResetFilters} className="text-xs">
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  filteredDestinations.map((dest) => {
                    const isSelected =
                      selectedDestination?.slug === dest.slug ||
                      selectedDestination?.id === dest.id;
                    const theme =
                      CATEGORY_THEMES[dest.category] ?? CATEGORY_THEMES.waterfall;

                    return (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => handleSelectDestination(dest)}
                        className={[
                          'w-full text-left p-2.5 rounded-2xl border transition-all text-xs flex items-center gap-3',
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/40'
                            : 'border-ink-200/80 bg-white hover:border-ink-300 hover:bg-sand/30 shadow-2xs',
                        ].join(' ')}
                      >
                        {/* Tiny Thumbnail */}
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-sand shrink-0">
                          <img
                            src={dest.cover_image || '/images/destinations/hundru-falls.jpg'}
                            alt={dest.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/100x100/png?text=' + encodeURIComponent(dest.name);
                            }}
                          />
                        </div>

                        {/* Title & Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-ink-950 truncate text-xs">
                              {dest.name}
                            </h4>
                            <span
                              style={{ backgroundColor: theme.color }}
                              className="h-2 w-2 rounded-full shrink-0"
                              title={theme.label}
                            />
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-ink-500 mt-0.5">
                            <MapPin className="h-3 w-3 text-clay-700 shrink-0" />
                            <span className="truncate">{dest.district} District</span>
                            {dest.eco_zone && (
                              <span className="text-forest-700 font-semibold ml-1 shrink-0">
                                • Eco
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              /* Districts Tab */
              <div className="space-y-1.5 pt-1">
                {Object.values(JHARKHAND_DISTRICTS_DATA).map((dist) => {
                  const isSelected =
                    selectedDistrict.toLowerCase() === dist.name.toLowerCase();

                  return (
                    <button
                      key={dist.name}
                      type="button"
                      onClick={() => handleSelectDistrict(dist.name)}
                      className={[
                        'w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between',
                        isSelected
                          ? 'border-clay-500 bg-clay-50 shadow-sm ring-1 ring-clay-400'
                          : 'border-ink-200/80 bg-white hover:bg-sand/40',
                      ].join(' ')}
                    >
                      <div>
                        <p className="font-bold text-ink-900">{dist.name} District</p>
                        <p className="text-[10px] text-ink-500 truncate max-w-[240px]">
                          {dist.description}
                        </p>
                      </div>
                      <Badge variant="neutral" className="text-[10px] py-0.5">
                        HQ: {dist.hq}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Card Summary */}
          <div className="rounded-2xl border border-ink-200/80 bg-sand/50 p-3 text-[11px] text-ink-600 space-y-1">
            <p className="font-bold text-ink-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Jharkhand Tourism GIS</span>
            </p>
            <p>
              Click any location on the map or select from the list to fly and inspect destination details.
            </p>
          </div>
        </div>

        {/* Right Side: Full Interactive Leaflet Map */}
        <div className="relative h-full w-full bg-sand/30 p-2 sm:p-3 overflow-hidden">
          <TourismMap
            destinations={filteredDestinations}
            selectedDestination={selectedDestination}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={(district) => handleSelectDistrict(district)}
            onAddToTrip={(dest) =>
              setAddToTripState({ destinationId: dest.id, destinationName: dest.name })
            }
            userLocation={userLocation}
            isVisible={true}
          />
        </div>
      </div>
    </div>
  );
}
