import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Clock,
  Compass,
  GraduationCap,
  MapPin,
  Package,
  Palette,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  Tent,
  Users,
  Utensils,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/StateBlocks';
import { JHARKHAND_DISTRICTS } from '../../constants/destinations';
import { formatIndianCurrency, normalizeSearchText } from '../../lib/utils';
import { getPublicProviderOfferings } from '../../services/provider/providerMarketplaceService';
import type { ProviderOffering } from '../../types/provider';

type MarketplaceKindFilter = 'all' | 'product' | 'experience';

const MARKETPLACE_CATEGORIES = [
  { value: 'all', label: 'All Offerings', icon: Compass },
  { value: 'Handicrafts & Art', label: 'Handicrafts & Art', icon: Palette },
  { value: 'Textiles', label: 'Tussar Silk & Textiles', icon: Tag },
  { value: 'Home Decor', label: 'Bamboo & Home Decor', icon: Store },
  { value: 'Local Food & Forest Goods', label: 'Forest Goods & Honey', icon: Utensils },
  { value: 'Workshops', label: 'Artisan Workshops', icon: GraduationCap },
  { value: 'Culinary Experiences', label: 'Culinary Classes', icon: Utensils },
  { value: 'Adventure', label: 'Guided Adventures', icon: Tent },
] as const;

interface MarketplaceCardProps {
  item: ProviderOffering;
}

function ProductOrExperienceCard({ item }: MarketplaceCardProps) {
  const metadata = (item.metadata ?? {}) as Record<string, unknown>;
  const isProduct = item.kind === 'product';
  const isExperience = item.kind === 'experience';

  const artisanName =
    typeof metadata.artisan_name === 'string'
      ? metadata.artisan_name
      : typeof metadata.host_name === 'string'
        ? metadata.host_name
        : 'Local Artisan Guild';

  const craftTradition =
    typeof metadata.craft_tradition === 'string' ? metadata.craft_tradition : null;
  const duration = typeof metadata.duration === 'string' ? metadata.duration : null;
  const materials = typeof metadata.materials === 'string' ? metadata.materials : null;
  const giTagged = Boolean(metadata.gi_tagged);
  const rating = typeof metadata.rating === 'number' ? metadata.rating : 4.9;
  const reviewsCount = typeof metadata.reviewsCount === 'number' ? metadata.reviewsCount : null;

  const priceFormatted =
    item.price != null && item.price > 0
      ? formatIndianCurrency(item.price)
      : 'Price on request';

  const detailHref = isProduct ? `/products/${item.id}` : `/experiences/${item.id}`;
  const ctaLabel = isProduct ? 'Buy / Enquire' : 'Request to Book';

  return (
    <Card className="group flex h-full flex-col justify-between overflow-hidden border-ink-200/90 bg-[#FFFDF9] p-0 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-clay-300 hover:shadow-xl">
      <div>
        {/* Cover Image Banner */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
          <img
            src={item.cover_image || '/images/products/sohrai-canvas.jpg'}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x400/f5f0eb/37291c?text=' + encodeURIComponent(item.name);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent" />

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge
              variant={isProduct ? 'accent' : 'warning'}
              className="text-xs font-semibold shadow-sm backdrop-blur-sm"
            >
              {isProduct ? 'PRODUCT' : 'EXPERIENCE'}
            </Badge>
            {giTagged && (
              <Badge variant="success" className="inline-flex items-center gap-1 text-[11px]">
                <ShieldCheck className="h-3 w-3" />
                <span>GI Tagged</span>
              </Badge>
            )}
          </div>

          {/* Top Right Rating */}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-ink-950/80 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm shadow-sm">
            <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
            <span>{rating.toFixed(1)}</span>
            {reviewsCount ? <span className="text-[10px] text-white/70">({reviewsCount})</span> : null}
          </div>

          {/* Bottom Left District & Location */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-white/90">
            <MapPin className="h-3.5 w-3.5 text-clay-300" />
            <span>{item.district ? `${item.district} District` : 'Jharkhand'}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-clay-700 font-bold uppercase tracking-wider text-[11px]">
              {craftTradition || item.category || (isProduct ? 'Handicraft' : 'Workshop')}
            </span>
            {duration ? (
              <span className="inline-flex items-center gap-1 text-ink-600 font-medium">
                <Clock className="h-3 w-3" />
                <span>{duration}</span>
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-clay-700 transition-colors leading-snug">
              {item.name}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-ink-700 leading-relaxed line-clamp-2">
              {item.short_description || item.description}
            </p>
          </div>

          {/* Artisan Line */}
          <div className="pt-2 border-t border-ink-100 flex items-center justify-between text-xs text-ink-600">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-clay-600" />
              <span>By {artisanName}</span>
            </span>
            {materials ? (
              <span className="text-[11px] text-ink-500 line-clamp-1 max-w-[140px] text-right">
                {materials}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer & Price */}
      <div className="p-5 pt-0 border-t border-ink-100/80 mt-auto flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-400">
            {isExperience ? 'Per Person' : 'Price'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-ink-900">{priceFormatted}</span>
            {isExperience && item.price != null ? (
              <span className="text-xs font-medium text-ink-500">/ person</span>
            ) : null}
          </div>
        </div>

        <Button asChild variant="primary" size="sm" className="gap-1.5 text-xs">
          <Link to={detailHref}>
            {isProduct ? <ShoppingBag className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span>{ctaLabel}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export function MarketplacePage() {
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<MarketplaceKindFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  useEffect(() => {
    let alive = true;

    async function loadOfferings() {
      try {
        setLoading(true);
        setError(null);
        // Exclude 'stay' offerings since Accommodations has its own dedicated system
        const [products, experiences] = await Promise.all([
          getPublicProviderOfferings('product'),
          getPublicProviderOfferings('experience'),
        ]);

        if (alive) {
          setOfferings([...products, ...experiences]);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Unable to load marketplace offerings.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadOfferings();
    return () => {
      alive = false;
    };
  }, []);

  const filteredOfferings = useMemo(() => {
    return offerings.filter((item) => {
      // Kind filter
      if (kindFilter !== 'all' && item.kind !== kindFilter) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const itemCat = item.category?.toLowerCase() || '';
        const targetCat = selectedCategory.toLowerCase();
        if (!itemCat.includes(targetCat) && !targetCat.includes(itemCat)) {
          return false;
        }
      }

      // District filter
      if (selectedDistrict !== 'all') {
        if (
          !item.district ||
          normalizeSearchText(item.district) !== normalizeSearchText(selectedDistrict)
        ) {
          return false;
        }
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = normalizeSearchText(searchTerm);
        const metadata = (item.metadata ?? {}) as Record<string, unknown>;
        const artisan = typeof metadata.artisan_name === 'string' ? metadata.artisan_name : '';
        const host = typeof metadata.host_name === 'string' ? metadata.host_name : '';
        const tradition = typeof metadata.craft_tradition === 'string' ? metadata.craft_tradition : '';
        const materials = typeof metadata.materials === 'string' ? metadata.materials : '';

        const text = [
          item.name,
          item.district,
          item.category,
          item.short_description,
          item.description,
          artisan,
          host,
          tradition,
          materials,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return text.includes(q);
      }

      return true;
    });
  }, [offerings, kindFilter, selectedCategory, selectedDistrict, searchTerm]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    kindFilter !== 'all' ||
    selectedCategory !== 'all' ||
    selectedDistrict !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setKindFilter('all');
    setSelectedCategory('all');
    setSelectedDistrict('all');
  };

  const productCount = useMemo(
    () => offerings.filter((o) => o.kind === 'product').length,
    [offerings]
  );
  const experienceCount = useMemo(
    () => offerings.filter((o) => o.kind === 'experience').length,
    [offerings]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-clay-950 to-amber-950 px-6 py-14 text-white shadow-2xl sm:px-10 sm:py-20">
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-clay-400/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-amber-300 border border-amber-400/30">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>JHARKHAND LOCAL MARKETPLACE</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Shop Local. Experience Local.
          </h1>
          <p className="mt-4 text-sm text-white/80 sm:text-base sm:mt-5 max-w-2xl mx-auto leading-relaxed">
            Support indigenous artisans, buy authentic GI Sohrai canvas and Dokra metalwork, and book immersive cultural masterclasses directly from local creators.
          </p>

          {/* Search bar */}
          <div className="mt-8 relative max-w-2xl mx-auto">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by craft (Dokra, Sohrai, Silk), artisan, district..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 py-4 pl-14 pr-5 text-sm text-white placeholder:text-white/50 backdrop-blur-md focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/30 transition shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Kind Switcher + Category Pills + District Filter */}
      <div className="space-y-4">
        {/* Kind Toggle (All vs Products vs Experiences) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-2xl bg-[#FFFDF9] p-1.5 border border-ink-200/90 shadow-xs">
            <button
              type="button"
              onClick={() => setKindFilter('all')}
              className={[
                'rounded-xl px-4 py-2 text-xs font-bold transition-all',
                kindFilter === 'all'
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'text-ink-800 hover:text-ink-950',
              ].join(' ')}
            >
              All Items ({offerings.length})
            </button>
            <button
              type="button"
              onClick={() => setKindFilter('product')}
              className={[
                'rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5',
                kindFilter === 'product'
                  ? 'bg-clay-700 text-white shadow-xs'
                  : 'text-ink-800 hover:text-ink-950',
              ].join(' ')}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Products ({productCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setKindFilter('experience')}
              className={[
                'rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5',
                kindFilter === 'experience'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-ink-700 hover:text-ink-950',
              ].join(' ')}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Experiences &amp; Workshops ({experienceCount})</span>
            </button>
          </div>

          {/* District selector */}
          <div className="flex items-center gap-2 rounded-2xl bg-[#FFFDF9] px-4 py-2 border border-ink-200/90 shadow-xs">
            <MapPin className="h-4 w-4 text-clay-700" />
            <label htmlFor="mkt-district" className="text-xs font-bold uppercase tracking-wider text-ink-700">
              District:
            </label>
            <select
              id="mkt-district"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="rounded-xl border border-ink-200 bg-sand/40 px-3 py-1 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-clay-400"
            >
              <option value="all">All Districts (24)</option>
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {MARKETPLACE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={[
                  'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all',
                  isActive
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'bg-[#FFFDF9] text-ink-800 border border-ink-200 hover:bg-sand hover:text-ink-950',
                ].join(' ')}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-clay-600'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Counter & Clear */}
        <div className="flex items-center justify-between text-xs text-ink-700 px-1">
          <span>
            Showing <strong>{filteredOfferings.length}</strong> verified craft &amp; experience listing{filteredOfferings.length !== 1 ? 's' : ''}
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
              <span>Reset all filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Marketplace Grid */}
      {loading ? (
        <LoadingState label="Loading authentic Jharkhand crafts and experiences..." />
      ) : error ? (
        <ErrorState title="Unable to load marketplace" message={error} />
      ) : filteredOfferings.length === 0 ? (
        <EmptyState
          title="No marketplace items match your search"
          message={
            searchTerm || selectedCategory !== 'all' || selectedDistrict !== 'all'
              ? 'No crafts or workshops matched your active filters. Try searching for other terms like Sohrai, Dokra, Silk, or Honey.'
              : 'No items are published in this category yet.'
          }
          actionLabel="View All Marketplace Offerings"
          actionHref="/marketplace"
        />
      ) : (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOfferings.map((item) => (
            <ProductOrExperienceCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Artisan Empowerment Story Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-clay-900 via-ink-900 to-forest-950 p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Fair Trade &amp; Direct Support</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-white">
            100% Direct Artisan Benefit
          </h3>
          <p className="text-sm text-white/75 leading-relaxed">
            Every craft purchase and workshop reservation directly supports indigenous women collectives, tribal handloom weavers, and rural youth guilds across Jharkhand with fair wages and cultural preservation.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link to="/explore">Explore Jharkhand Heritage</Link>
          </Button>
          <Button asChild variant="secondary" className="border-white/30 text-white hover:bg-white/10 bg-white/10 backdrop-blur-sm">
            <Link to="/accommodations">Find Nearby Stays</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
