import { useEffect, useMemo, useState } from 'react';
import {
  Bed,
  Check,
  Leaf,
  Map,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/StateBlocks';
import { JHARKHAND_DISTRICTS } from '../../constants/destinations';
import { formatIndianCurrency, normalizeSearchText } from '../../lib/utils';
import { getPublicProviderOfferings } from '../../services/provider/providerMarketplaceService';
import type { ProviderOffering } from '../../types/provider';

const ACCOMMODATION_TYPES = [
  'All',
  'Village Homestay',
  'Eco-Resort',
  'Forest Cottage',
  'Glamping Tent',
  'Hotel',
] as const;

interface StayCardProps {
  stay: ProviderOffering;
}

function AccommodationCard({ stay }: StayCardProps) {
  const metadata = (stay.metadata ?? {}) as Record<string, unknown>;
  const rating = typeof metadata.rating === 'number' ? metadata.rating : 4.8;
  const reviewsCount = typeof metadata.reviewsCount === 'number' ? metadata.reviewsCount : null;
  const isEcoCertified = Boolean(metadata.eco_certified);
  const hostName =
    typeof metadata.host_name === 'string' ? metadata.host_name : 'Verified Local Host';
  const amenities = Array.isArray(metadata.amenities)
    ? (metadata.amenities as string[])
    : ['Local Hospitality', 'Private Space'];

  const priceText =
    stay.price != null && stay.price > 0
      ? formatIndianCurrency(stay.price)
      : 'Price on request';

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-clay-300 hover:shadow-xl">
      <div>
        {/* Cover Image & Badges */}
        <div className="relative h-60 w-full overflow-hidden bg-sand">
          <img
            src={stay.cover_image || '/images/stays/pine-eco-lodge.jpg'}
            alt={stay.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x400/f5f0eb/37291c?text=' + encodeURIComponent(stay.name);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/20 to-transparent" />

          {/* Top Left: Category Badge */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
            <Badge variant="accent" className="bg-white/95 text-xs font-semibold text-ink-900 shadow-sm backdrop-blur-sm">
              {stay.category || 'Homestay'}
            </Badge>
            {isEcoCertified && (
              <Badge variant="success" className="inline-flex items-center gap-1 text-[11px]">
                <Leaf className="h-3 w-3" />
                <span>Eco Certified</span>
              </Badge>
            )}
          </div>

          {/* Top Right: Rating */}
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-full bg-ink-950/80 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm shadow-sm">
            <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
            <span>{rating.toFixed(1)}</span>
            {reviewsCount ? <span className="text-[10px] text-white/70">({reviewsCount})</span> : null}
          </div>

          {/* Bottom Left: Location overlay */}
          <div className="absolute bottom-3 left-3.5 flex items-center gap-1 text-xs font-medium text-white/90">
            <MapPin className="h-3.5 w-3.5 text-clay-300" />
            <span>{stay.district ? `${stay.district} District` : 'Jharkhand'}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-ink-900">{priceText}</span>
              {stay.price != null && stay.price > 0 ? (
                <span className="text-xs font-medium text-ink-500">/ night</span>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{hostName}</span>
            </span>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-ink-900 group-hover:text-clay-700 transition-colors leading-snug">
              {stay.name}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-ink-600 leading-relaxed line-clamp-2">
              {stay.short_description || stay.description}
            </p>
          </div>

          {/* Key Amenities */}
          <div className="space-y-1.5 pt-3 border-t border-ink-100">
            {amenities.slice(0, 3).map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 text-xs text-ink-600">
                <Check className="h-3.5 w-3.5 text-forest-600 shrink-0" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 pt-0 flex flex-wrap gap-2">
        <Button asChild variant="primary" className="flex-1 text-xs">
          <Link to={`/stays/${stay.id}`} className="inline-flex items-center justify-center gap-1.5">
            <Bed className="h-3.5 w-3.5" />
            <span>Request to Book</span>
          </Link>
        </Button>
        {stay.district ? (
          <Button asChild variant="secondary" className="text-xs">
            <Link
              to={`/map?district=${encodeURIComponent(stay.district)}`}
              title="View destination on map"
              className="inline-flex items-center gap-1"
            >
              <Map className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Map</span>
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function AccommodationsPage() {
  const [stays, setStays] = useState<ProviderOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [ecoFriendlyOnly, setEcoFriendlyOnly] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;

    async function loadStays() {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicProviderOfferings('stay');
        if (alive) {
          setStays(data);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Unable to load accommodations.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadStays();
    return () => {
      alive = false;
    };
  }, []);

  const filteredStays = useMemo(() => {
    return stays.filter((stay) => {
      // Type filter
      if (selectedType !== 'All') {
        const cat = stay.category?.toLowerCase() || '';
        const selected = selectedType.toLowerCase();
        if (!cat.includes(selected) && !selected.includes(cat)) {
          return false;
        }
      }

      // District filter
      if (selectedDistrict !== 'all') {
        if (
          !stay.district ||
          normalizeSearchText(stay.district) !== normalizeSearchText(selectedDistrict)
        ) {
          return false;
        }
      }

      // Eco friendly filter
      if (ecoFriendlyOnly) {
        const metadata = (stay.metadata ?? {}) as Record<string, unknown>;
        if (!metadata.eco_certified) {
          return false;
        }
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = normalizeSearchText(searchTerm);
        const metadata = (stay.metadata ?? {}) as Record<string, unknown>;
        const amenities = Array.isArray(metadata.amenities)
          ? (metadata.amenities as string[]).join(' ')
          : '';

        const text = [
          stay.name,
          stay.district,
          stay.category,
          stay.address,
          stay.short_description,
          stay.description,
          amenities,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return text.includes(q);
      }

      return true;
    });
  }, [stays, selectedType, selectedDistrict, ecoFriendlyOnly, searchTerm]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedType !== 'All' ||
    selectedDistrict !== 'all' ||
    ecoFriendlyOnly;

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedDistrict('all');
    setEcoFriendlyOnly(false);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-forest-950 to-clay-950 px-6 py-14 text-white shadow-2xl sm:px-10 sm:py-20">
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-forest-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-forest-400/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-forest-300 border border-forest-400/30">
            <Bed className="h-3.5 w-3.5" />
            <span>STAY IN JHARKHAND</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Where Will You Stay?
          </h1>
          <p className="mt-4 text-sm text-white/80 sm:text-base sm:mt-5 max-w-2xl mx-auto leading-relaxed">
            Find stays that fit your journey — from serene pine forest cottages and lakeside resorts to authentic tribal mud homestays and wilderness safari camps.
          </p>

          {/* Quick Search */}
          <div className="mt-8 relative max-w-2xl mx-auto">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by stay name, location, amenities, or district..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 py-4 pl-14 pr-5 text-sm text-white placeholder:text-white/50 backdrop-blur-md focus:border-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-300/30 transition shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Filter Bar: Accommodation Type Pills + District Selector + Eco Toggle */}
      <div className="space-y-4">
        {/* Type Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {ACCOMMODATION_TYPES.map((type) => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={[
                  'flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold transition-all',
                  isActive
                    ? 'bg-ink-950 text-white shadow-md'
                    : 'bg-white text-ink-700 border border-ink-200 hover:bg-sand hover:text-ink-900',
                ].join(' ')}
              >
                <span>{type}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-ink-200/80 bg-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* District dropdown */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-clay-700" />
              <label htmlFor="stay-district" className="text-xs font-bold uppercase tracking-wider text-ink-700">
                District:
              </label>
              <select
                id="stay-district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="rounded-xl border border-ink-200 bg-sand/40 px-3 py-1.5 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-clay-400"
              >
                <option value="all">All Districts (24)</option>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Eco Certified filter */}
            <button
              type="button"
              onClick={() => setEcoFriendlyOnly((prev) => !prev)}
              className={[
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                ecoFriendlyOnly
                  ? 'border-forest-600 bg-forest-100 text-forest-900 shadow-xs'
                  : 'border-ink-200 bg-sand/30 text-ink-700 hover:bg-sand/60',
              ].join(' ')}
            >
              <Leaf className="h-3.5 w-3.5 text-forest-700" />
              <span>Eco-Certified Only</span>
            </button>
          </div>

          {/* Counter and reset */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            <span className="text-xs font-bold text-ink-600">
              {filteredStays.length} stay{filteredStays.length !== 1 ? 's' : ''} available
            </span>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset filters</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Accommodations Content Grid */}
      {loading ? (
        <LoadingState label="Finding available stays across Jharkhand..." />
      ) : error ? (
        <ErrorState title="Unable to load accommodations" message={error} />
      ) : filteredStays.length === 0 ? (
        <EmptyState
          title="No accommodations match your search"
          message={
            searchTerm || selectedDistrict !== 'all' || selectedType !== 'All'
              ? 'No verified stays matched your selected criteria. Try resetting your filters to view all options.'
              : 'No accommodations published in this category yet.'
          }
          actionLabel="View All Stays"
          actionHref="/accommodations"
        />
      ) : (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStays.map((stay) => (
            <AccommodationCard key={stay.id} stay={stay} />
          ))}
        </div>
      )}

      {/* Cross-Link Banner to Marketplace and Map */}
      <div className="rounded-3xl bg-gradient-to-r from-ink-950 via-ink-900 to-clay-950 p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-clay-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Complete Your Jharkhand Journey</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-white">
            Discover Local Experiences &amp; Master Crafts
          </h3>
          <p className="text-sm text-white/75 leading-relaxed">
            Enhance your stay with authentic tribal painting masterclasses, guided waterfall treks, and handcrafted GI Sohrai canvas directly from local artisan guilds.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link to="/marketplace">Explore Marketplace</Link>
          </Button>
          <Button asChild variant="secondary" className="border-white/30 text-white hover:bg-white/10 bg-white/10 backdrop-blur-sm">
            <Link to="/map">View on GIS Map</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
