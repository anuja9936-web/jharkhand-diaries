import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Car,
  Compass,
  ExternalLink,
  Hotel,
  LocateFixed,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { TourismMap } from '../../components/map/TourismMap';
import { AddToTripModal } from '../../components/destinations/AddToTripModal';
import {
  CATEGORY_THEMES,
  JHARKHAND_DISTRICTS_DATA,
  VERIFIED_JHARKHAND_DESTINATIONS,
} from '../../constants/jharkhandDistrictsGeo';
import { getPublishedDestinations } from '../../services/destinations/destinationService';
import { getNearbyProviderOfferings } from '../../services/provider/providerMarketplaceService';
import { useGeolocation } from '../../hooks/useGeolocation';
import type { Destination } from '../../types/destination';
import type { ProviderOffering } from '../../types/provider';
import { Badge, Button, Card, Input } from '../../components/ui';
import { formatIndianCurrency } from '../../lib/utils';

// ─── Filter Category Definitions ──────────────────────────────────────────────
export interface MapCategoryFilter {
  id: string;
  label: string;
  emoji: string;
  categories?: readonly string[];
}

export const MAP_CATEGORY_FILTERS: readonly MapCategoryFilter[] = [
  { id: 'all', label: 'All', emoji: '✦' },
  { id: 'waterfall', label: 'Waterfalls', emoji: '🌊', categories: ['waterfall'] },
  { id: 'nature', label: 'Nature', emoji: '🌲', categories: ['eco', 'waterfall', 'adventure'] },
  { id: 'wildlife', label: 'Wildlife', emoji: '🐅', categories: ['wildlife'] },
  { id: 'tribal_culture', label: 'Tribal Culture', emoji: '🥁', categories: ['tribal_culture', 'craft'] },
  { id: 'heritage', label: 'Heritage', emoji: '🏛️', categories: ['heritage'] },
  { id: 'religious', label: 'Spiritual', emoji: '🛕', categories: ['religious'] },
  { id: 'adventure', label: 'Adventure', emoji: '⛺', categories: ['adventure'] },
  { id: 'lakes_dams', label: 'Lakes & Dams', emoji: '⛵', categories: ['eco', 'heritage'] },
  { id: 'craft', label: 'Art & Crafts', emoji: '🎨', categories: ['craft', 'tribal_culture'] },
  { id: 'eco', label: 'Eco Tourism', emoji: '🌿', categories: ['eco'] },
];

// ─── Haversine Distance Helper ────────────────────────────────────────────────
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

interface AddToTripState {
  destinationId: string;
  destinationName: string;
}

export function MapDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>(VERIFIED_JHARKHAND_DESTINATIONS);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addToTripState, setAddToTripState] = useState<AddToTripState | null>(null);
  const [nearbyOfferings, setNearbyOfferings] = useState<ProviderOffering[]>([]);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const { location: userLocation, requestLocation, status, errorMessage: geoError } = useGeolocation();
  const isRequesting = status === 'requesting';

  // Load database destinations and combine with curated verified catalog
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const dbData = await getPublishedDestinations();
        if (mounted && dbData && dbData.length > 0) {
          const map = new Map<string, Destination>();
          VERIFIED_JHARKHAND_DESTINATIONS.forEach((d) => map.set(d.id, d));
          dbData.forEach((d) => map.set(d.id, d));
          const combined = Array.from(map.values());
          setDestinations(combined);

          const targetSlug = searchParams.get('destination');
          const targetDistrict = searchParams.get('district');

          if (targetSlug) {
            const found = combined.find((d) => d.slug === targetSlug || d.id === targetSlug);
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
        console.warn('[MapDiscoveryPage] Using verified offline catalog fallback', err);
      }
    }
    void loadData();
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

  // Load nearby provider ecosystem offerings when selected destination/district changes
  useEffect(() => {
    let active = true;
    async function fetchOfferings() {
      const targetDistrict = selectedDestination?.district || (selectedDistrict !== 'all' ? selectedDistrict : null);
      if (targetDistrict) {
        const offerings = await getNearbyProviderOfferings(targetDistrict);
        if (active) setNearbyOfferings(offerings);
      } else {
        if (active) setNearbyOfferings([]);
      }
    }
    void fetchOfferings();
    return () => {
      active = false;
    };
  }, [selectedDestination, selectedDistrict]);

  // Near Me handler
  const handleNearMe = () => {
    setIsNearMeActive(true);
    setGeoNotice(null);
    requestLocation();
  };

  useEffect(() => {
    if (geoError && isNearMeActive) {
      setGeoNotice('Location permission was denied or is unavailable. Please enable browser location to view nearby places.');
    }
  }, [geoError, isNearMeActive]);

  // Filter and sort destinations
  const filteredDestinations = useMemo(() => {
    const activeFilterObj = MAP_CATEGORY_FILTERS.find((f) => f.id === activeCategory);
    const matchingCategories: readonly string[] = activeFilterObj?.categories ?? [];

    let list = destinations.filter((dest) => {
      // Category Match
      const matchCat =
        activeCategory === 'all' ||
        matchingCategories.includes(dest.category) ||
        (activeCategory === 'lakes_dams' && (dest.name.toLowerCase().includes('dam') || dest.name.toLowerCase().includes('lake')));

      // District Match
      const matchDistrict =
        selectedDistrict === 'all' ||
        dest.district.toLowerCase() === selectedDistrict.toLowerCase();

      // Search Match
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        dest.name.toLowerCase().includes(q) ||
        dest.district.toLowerCase().includes(q) ||
        dest.category.toLowerCase().includes(q) ||
        (dest.short_description && dest.short_description.toLowerCase().includes(q));

      return matchCat && matchDistrict && matchSearch;
    });

    // If Near Me is active and we have user coordinates, calculate distance and sort
    if (userLocation && isNearMeActive) {
      list = list.map((dest) => {
        const dist = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          Number(dest.latitude),
          Number(dest.longitude)
        );
        return { ...dest, _distanceKm: dist };
      }).sort((a, b) => ((a as Destination & { _distanceKm: number })._distanceKm - (b as Destination & { _distanceKm: number })._distanceKm));
    }

    return list;
  }, [destinations, activeCategory, selectedDistrict, searchTerm, userLocation, isNearMeActive]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: destinations.length };
    MAP_CATEGORY_FILTERS.forEach((f) => {
      if (f.id === 'all') return;
      const cats: readonly string[] = f.categories ?? [];
      counts[f.id] = destinations.filter(
        (d) => cats.includes(d.category) || (f.id === 'lakes_dams' && (d.name.toLowerCase().includes('dam') || d.name.toLowerCase().includes('lake')))
      ).length;
    });
    return counts;
  }, [destinations]);

  const handleSelectDestination = (dest: Destination) => {
    setSelectedDestination(dest);
    setSearchParams({ destination: dest.slug, ...(dest.district ? { district: dest.district } : {}) });
  };

  const handleSelectDistrict = (district: string) => {
    setSelectedDistrict(district);
    setSelectedDestination(null);
    setSearchParams(district === 'all' ? {} : { district });
  };

  const handleResetToState = () => {
    setSelectedDistrict('all');
    setSelectedDestination(null);
    setSearchTerm('');
    setActiveCategory('all');
    setIsNearMeActive(false);
    setSearchParams({});
  };

  const selectedDistrictInfo = useMemo(() => {
    if (!selectedDistrict || selectedDistrict === 'all') return null;
    return (
      Object.values(JHARKHAND_DISTRICTS_DATA).find(
        (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
      ) || null
    );
  }, [selectedDistrict]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-ink-950 font-sans">
      {/* ── Add-to-Trip Modal ──────────────────────────────────────────────── */}
      {addToTripState && (
        <AddToTripModal
          destinationId={addToTripState.destinationId}
          destinationName={addToTripState.destinationName}
          onClose={() => setAddToTripState(null)}
        />
      )}

      {/* ── Top Bar: Search + Near Me + View All Reset ──────────────────────── */}
      <header className="bg-white border-b border-ink-200/80 px-4 py-3 sm:px-6 sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-600 hover:text-ink-950 transition"
            >
              <ArrowLeft className="h-4 w-4 text-clay-700" />
              <span>Home</span>
            </Link>
            <span className="text-ink-300">/</span>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-forest-900 text-amber-400 p-1 flex items-center justify-center">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <h1 className="font-display text-sm sm:text-base font-bold text-ink-950 leading-tight">
                  Jharkhand Interactive Tourism Map
                </h1>
                <p className="text-[11px] text-ink-500 hidden sm:block">
                  24 Districts &bull; Verified Waterfalls, Sanctuaries &amp; Shrines
                </p>
              </div>
            </div>
          </div>

          {/* Search + Action Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:flex-1 lg:max-w-2xl justify-start sm:justify-end">
            {/* Search Input */}
            <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[180px] max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <Input
                type="search"
                placeholder="Search Jharkhand destinations (e.g. Hundru, Betla, Deoghar)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 text-xs bg-sand/30 border-ink-200 rounded-full focus:bg-white focus:border-clay-500 w-full"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Instant Search Dropdown */}
              {searchTerm.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-2xl border border-ink-200 bg-white p-1.5 shadow-2xl z-50 space-y-0.5">
                  {filteredDestinations.length === 0 ? (
                    <div className="p-3 text-center text-xs text-ink-500">
                      No destinations matching "{searchTerm}"
                    </div>
                  ) : (
                    filteredDestinations.slice(0, 6).map((dest) => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => {
                          handleSelectDestination(dest);
                          setSearchTerm('');
                        }}
                        className="w-full flex items-center justify-between gap-2 rounded-xl p-2 text-left hover:bg-amber-50/80 transition text-xs"
                      >
                        <div className="truncate">
                          <p className="font-bold text-ink-950 truncate">{dest.name}</p>
                          <p className="text-[10px] text-ink-500">{dest.district} District &bull; <span className="capitalize">{dest.category}</span></p>
                        </div>
                        <span className="text-[10px] font-bold text-clay-700 shrink-0">View on Map &rarr;</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Near Me Button */}
            <Button
              type="button"
              variant={isNearMeActive && userLocation ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleNearMe}
              disabled={isRequesting}
              className={`rounded-full text-xs font-bold px-3 sm:px-3.5 shrink-0 ${
                isNearMeActive && userLocation
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white hover:bg-sand text-ink-800 border-ink-200'
              }`}
            >
              <LocateFixed className={`h-3.5 w-3.5 mr-1.5 ${isNearMeActive && userLocation ? 'text-white' : 'text-blue-600'}`} />
              <span>{isRequesting ? 'Locating...' : '📍 Near Me'}</span>
            </Button>

            {/* View All Jharkhand Reset Button */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleResetToState}
              className="rounded-full text-xs font-bold bg-sand/50 text-ink-800 hover:bg-sand border-ink-200 shrink-0"
              title="Reset View to Full Jharkhand State"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1 text-clay-700" />
              <span>View all Jharkhand</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Category Filter Bar ─────────────────────────────────────────────── */}
      <div className="bg-[#FFFDF9] border-b border-ink-200/70 px-4 py-2.5 sm:px-6 sticky top-[57px] z-20 shadow-2xs">
        <div className="mx-auto max-w-7xl flex items-center gap-2 overflow-x-auto no-scrollbar">
          {MAP_CATEGORY_FILTERS.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'bg-white text-ink-700 hover:bg-sand border border-ink-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? 'bg-forest-700 text-white' : 'bg-sand text-ink-600 font-semibold'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Geolocation Notice banner if denied */}
      {geoNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <span>{geoNotice}</span>
          <button type="button" onClick={() => setGeoNotice(null)} className="font-bold underline text-amber-800 ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Main Map Area + Interactive Panels ──────────────────────────────── */}
      <main className="flex-1 relative flex flex-col min-h-[440px] sm:min-h-[560px] lg:min-h-[640px]">
        {/* Map Container */}
        <div className="flex-1 w-full relative min-h-[400px]">
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

        {/* ── District Info Card Overlay (When District is Selected & no single destination active) ── */}
        {selectedDistrictInfo && !selectedDestination && (
          <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md z-[500] pointer-events-auto">
            <Card className="border border-ink-200/90 bg-[#FFFDF9]/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700">
                    District Insights • Jharkhand Tourism
                  </span>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-ink-950">
                    {selectedDistrictInfo.name} District
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleResetToState}
                  className="rounded-full p-1 text-ink-400 hover:text-ink-700 hover:bg-sand transition"
                  aria-label="Close district info"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-ink-700 leading-relaxed">
                {selectedDistrictInfo.description}
              </p>

              {/* Key Attractions quick chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                  Key Attractions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDistrictInfo.keyAttractions.map((attr) => (
                    <button
                      key={attr}
                      type="button"
                      onClick={() => setSearchTerm(attr)}
                      className="rounded-lg bg-sand/70 hover:bg-amber-100 hover:text-amber-900 border border-ink-200/60 px-2.5 py-1 text-[11px] font-semibold text-ink-800 transition"
                    >
                      {attr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-ink-200/60 text-xs">
                <span className="text-ink-500">
                  {filteredDestinations.length} places shown in {selectedDistrictInfo.name}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleResetToState}
                  className="text-xs font-bold py-1 h-auto"
                >
                  Reset View
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Selected Destination Information Showcase Panel + Provider Ecosystem ── */}
        {selectedDestination && (
          <div className="border-t border-ink-200/90 bg-[#FFFDF9] p-4 sm:p-6 shadow-2xl relative z-20 animate-in slide-in-from-bottom-6 duration-200">
            <div className="mx-auto max-w-7xl space-y-5">
              {/* Destination Header Row */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="relative h-28 w-full sm:h-28 sm:w-36 rounded-2xl overflow-hidden bg-sand shrink-0 shadow-md">
                    <img
                      src={selectedDestination.cover_image || '/images/destinations/hundru-falls.jpg'}
                      alt={selectedDestination.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/400x300/png?text=' + encodeURIComponent(selectedDestination.name);
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-xs ${CATEGORY_THEMES[selectedDestination.category]?.bgBadge || 'bg-amber-100 text-amber-900'}`}>
                        {CATEGORY_THEMES[selectedDestination.category]?.label || selectedDestination.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 max-w-2xl min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-clay-700 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{selectedDestination.district} District</span>
                      </span>
                      {selectedDestination.eco_zone && (
                        <Badge variant="success" className="text-[10px]">
                          Eco Protected Zone
                        </Badge>
                      )}
                      {(selectedDestination as Destination & { _distanceKm?: number })._distanceKm !== undefined && (
                        <span className="rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-bold px-2 py-0.5 text-[10px]">
                          📍 {(selectedDestination as Destination & { _distanceKm?: number })._distanceKm} km from you
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-950">
                      {selectedDestination.name}
                    </h2>

                    <p className="text-xs sm:text-sm text-ink-700 leading-relaxed line-clamp-2">
                      {selectedDestination.short_description || selectedDestination.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-ink-600 pt-1">
                      {selectedDestination.best_time && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-clay-700" />
                          <span>Best Time: {selectedDestination.best_time}</span>
                        </span>
                      )}
                      {selectedDestination.entry_fee !== undefined && (
                        <span className="font-semibold text-ink-900">
                          Entry: {selectedDestination.entry_fee != null && Number(selectedDestination.entry_fee) > 0 ? formatIndianCurrency(selectedDestination.entry_fee) : 'Free Entry'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                  <Button
                    asChild
                    size="sm"
                    className="bg-forest-900 text-white hover:bg-forest-800 text-xs font-bold px-4 flex-1 sm:flex-initial"
                  >
                    <Link to={`/destinations/${selectedDestination.slug}`}>
                      <span>View Details</span>
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100 text-xs font-bold px-4 flex-1 sm:flex-initial"
                  >
                    <Link to={`/plan-trip?destination=${encodeURIComponent(selectedDestination.name)}&district=${encodeURIComponent(selectedDestination.district)}`}>
                      <Plus className="mr-1.5 h-3.5 w-3.5 text-amber-700" />
                      <span>Plan Trip</span>
                    </Link>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('open-johar-ai', {
                          detail: {
                            prompt: `I am looking at ${selectedDestination.name} in ${selectedDestination.district} district, Jharkhand. What can I do here and what other places can I visit nearby?`,
                          },
                        })
                      );
                    }}
                    className="text-xs font-bold px-3.5 bg-sand text-clay-800 border border-ink-200 hover:bg-sand/80 flex-1 sm:flex-initial"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                    <span>Ask Johar AI</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => setSelectedDestination(null)}
                    className="p-1.5 rounded-full text-ink-400 hover:text-ink-900 hover:bg-sand transition"
                    title="Close details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* ── Nearby Provider Ecosystem Row (Stays, Transport, Guides, Experiences, Crafts) ── */}
              {nearbyOfferings.length > 0 && (
                <div className="pt-4 border-t border-ink-200/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay-800 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      <span>Nearby Service Providers in {selectedDestination.district} District</span>
                    </span>
                    <span className="text-xs text-ink-500 font-medium">
                      Verified Tourism Partners
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {nearbyOfferings.slice(0, 4).map((offering) => {
                      const kindIcon =
                        offering.kind === 'stay' ? (
                          <Hotel className="h-3.5 w-3.5 text-amber-600" />
                        ) : offering.kind === 'transport' ? (
                          <Car className="h-3.5 w-3.5 text-blue-600" />
                        ) : offering.kind === 'product' ? (
                          <Package className="h-3.5 w-3.5 text-clay-600" />
                        ) : (
                          <Compass className="h-3.5 w-3.5 text-emerald-600" />
                        );

                      const targetRoute =
                        offering.kind === 'stay'
                          ? `/stays/${offering.id}`
                          : offering.kind === 'transport'
                          ? `/transport/${offering.id}`
                          : offering.kind === 'product'
                          ? `/products/${offering.id}`
                          : offering.kind === 'tour'
                          ? `/tours/${offering.id}`
                          : `/experiences/${offering.id}`;

                      return (
                        <Link
                          key={offering.id}
                          to={targetRoute}
                          className="group p-3 rounded-xl bg-white border border-ink-200/80 hover:border-clay-400 hover:shadow-md transition-all flex items-start gap-3"
                        >
                          <div className="h-12 w-12 rounded-lg bg-sand overflow-hidden shrink-0">
                            <img
                              src={offering.cover_image || '/images/destinations/hundru-falls.jpg'}
                              alt={offering.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-clay-700">
                              {kindIcon}
                              <span className="capitalize">{offering.kind}</span>
                            </div>
                            <h4 className="font-bold text-xs text-ink-950 truncate group-hover:text-forest-900">
                              {offering.name}
                            </h4>
                            {offering.price ? (
                              <p className="text-[11px] font-semibold text-ink-700">
                                {formatIndianCurrency(offering.price)}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
