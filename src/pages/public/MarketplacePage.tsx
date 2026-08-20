import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Compass, MapPin, Package, RotateCcw, Search, Sparkles, Star, Store, TreePine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { DEFAULT_DESTINATION_IMAGE, getDestinationCategoryLabel } from '../../constants/destinations';
import { getProviderOfferingKindLabel } from '../../constants/provider';
import { normalizeSearchText, formatIndianCurrency } from '../../lib/utils';
import { getPublishedDestinations } from '../../services/destinations/destinationService';
import { getReviewsForDestinationIds } from '../../services/reviews/reviewService';
import {
  getPublicProviderOfferings,
  getPublicProviderProfile,
} from '../../services/provider/providerMarketplaceService';
import type { Destination } from '../../types/destination';
import type { ProviderOffering, ProviderPublicProfile } from '../../types/provider';

type MarketplaceCategory = 'all' | 'destinations' | 'products' | 'experiences' | 'stays';

interface CategoryOption {
  label: string;
  value: MarketplaceCategory;
  icon: typeof Compass;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: 'All', value: 'all', icon: Compass },
  { label: 'Destinations', value: 'destinations', icon: TreePine },
  { label: 'Products', value: 'products', icon: Package },
  { label: 'Experiences', value: 'experiences', icon: Sparkles },
  { label: 'Stays', value: 'stays', icon: Store },
];

interface DestinationRatingSummary {
  average: number | null;
  count: number;
}

function getProviderName(profile: ProviderPublicProfile | null | undefined): string | null {
  return profile?.business_name ?? profile?.full_name ?? null;
}

interface UnifiedMarketplaceItem {
  id: string;
  kind: 'destination' | 'product' | 'experience' | 'stay';
  title: string;
  description: string;
  image: string;
  href: string;
  categoryBadge: string;
  location: string | null;
  providerName: string | null;
  providerHref?: string;
  priceFormatted: string | null;
  pricePrefix?: string | null;
  priceSuffix?: string | null;
  ratingFormatted?: string | null;
  ctaLabel: string;
}

function MarketplaceCard({ item }: { item: UnifiedMarketplaceItem }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-ink-200/80 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-clay-300 hover:shadow-[0_20px_60px_-25px_rgba(55,41,28,0.25)]">
      {/* Image Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="accent" className="bg-white/95 text-xs font-semibold text-ink-900 shadow-sm backdrop-blur-sm">
            {item.categoryBadge}
          </Badge>
        </div>

        {/* Rating or Price Overlay on Top Right if present */}
        {item.ratingFormatted ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink-900/85 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{item.ratingFormatted}</span>
          </div>
        ) : null}
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-5">
        {/* Location & Provider line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-600">
          {item.location ? (
            <span className="inline-flex items-center gap-1 font-medium text-ink-700">
              <MapPin className="h-3.5 w-3.5 text-clay-600" />
              {item.location}
            </span>
          ) : null}

          {item.providerName ? (
            item.providerHref ? (
              <Link
                to={item.providerHref}
                className="font-medium text-clay-700 hover:text-clay-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                by {item.providerName}
              </Link>
            ) : (
              <span className="text-ink-600">by {item.providerName}</span>
            )
          ) : null}
        </div>

        {/* Title */}
        <h3 className="mt-2 text-lg font-bold tracking-tight text-ink-900 transition-colors group-hover:text-clay-700">
          {item.title}
        </h3>

        {/* Short Description */}
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-600">
          {item.description}
        </p>

        {/* Bottom CTA Area with Price */}
        <div className="mt-auto pt-4 border-t border-ink-100/90 flex flex-wrap items-center justify-between gap-3">
          {/* Price display if applicable */}
          {item.priceFormatted ? (
            <div>
              {item.pricePrefix ? (
                <span className="block text-[11px] font-medium uppercase tracking-wider text-ink-500">
                  {item.pricePrefix}
                </span>
              ) : null}
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-ink-900">
                  {item.priceFormatted}
                </span>
                {item.priceSuffix ? (
                  <span className="text-xs text-ink-600 font-normal">{item.priceSuffix}</span>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="text-xs font-medium text-ink-500">
              {item.kind === 'destination' ? 'Jharkhand Landmark' : 'Enquire for details'}
            </div>
          )}

          {/* Single Primary Action Button */}
          <Button asChild variant="primary" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium shadow-sm">
            <Link to={item.href}>
              <span>{item.ctaLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function MarketplacePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [providerProfiles, setProviderProfiles] = useState<Record<string, ProviderPublicProfile | null>>({});
  const [destinationRatings, setDestinationRatings] = useState<Record<string, DestinationRatingSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory>('all');

  useEffect(() => {
    let alive = true;

    async function loadMarketplace() {
      try {
        setLoading(true);
        setError(null);

        const [destinationResult, offeringResult] = await Promise.allSettled([
          getPublishedDestinations(),
          getPublicProviderOfferings(),
        ]);

        const nextDestinations = destinationResult.status === 'fulfilled' ? destinationResult.value : [];
        const nextOfferings = offeringResult.status === 'fulfilled' ? offeringResult.value : [];

        if (!alive) {
          return;
        }

        setDestinations(nextDestinations);
        setOfferings(nextOfferings);

        if (destinationResult.status === 'rejected' && offeringResult.status === 'rejected') {
          setError('Unable to load marketplace offerings right now. Please try again shortly.');
        }

        const providerIds = [
          ...new Set([
            ...nextDestinations.map((d) => d.provider_id).filter((v): v is string => Boolean(v)),
            ...nextOfferings.map((o) => o.provider_id).filter((v): v is string => Boolean(v)),
          ]),
        ];

        if (providerIds.length > 0) {
          const profileResults = await Promise.allSettled(
            providerIds.map((providerId) => getPublicProviderProfile(providerId))
          );

          if (!alive) {
            return;
          }

          const profileMap: Record<string, ProviderPublicProfile | null> = {};
          providerIds.forEach((providerId, index) => {
            profileMap[providerId] =
              profileResults[index].status === 'fulfilled' ? profileResults[index].value : null;
          });
          setProviderProfiles(profileMap);
        } else {
          setProviderProfiles({});
        }

        if (nextDestinations.length > 0) {
          try {
            const reviews = await getReviewsForDestinationIds(nextDestinations.map((d) => d.id));
            if (!alive) {
              return;
            }

            const summaryMap = reviews.reduce<Record<string, { total: number; count: number }>>((acc, review) => {
              const current = acc[review.destination_id] ?? { total: 0, count: 0 };
              current.total += review.rating;
              current.count += 1;
              acc[review.destination_id] = current;
              return acc;
            }, {});

            const ratings: Record<string, DestinationRatingSummary> = {};
            Object.entries(summaryMap).forEach(([destinationId, summary]) => {
              ratings[destinationId] = {
                average: summary.count > 0 ? Number((summary.total / summary.count).toFixed(1)) : null,
                count: summary.count,
              };
            });
            setDestinationRatings(ratings);
          } catch {
            setDestinationRatings({});
          }
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadMarketplace();

    return () => {
      alive = false;
    };
  }, []);

  const normalizedSearch = normalizeSearchText(searchTerm);

  // Transform destinations into unified format
  const destinationItems = useMemo<UnifiedMarketplaceItem[]>(() => {
    return destinations.map((destination) => {
      const rating = destinationRatings[destination.id];
      const ratingStr = rating && rating.count > 0 && rating.average != null ? `${rating.average.toFixed(1)} ★` : null;

      return {
        id: destination.id,
        kind: 'destination',
        title: destination.name,
        description:
          destination.short_description ||
          destination.description ||
          'Explore this landmark, cultural heritage, and natural beauty of Jharkhand.',
        image: destination.cover_image || DEFAULT_DESTINATION_IMAGE,
        href: `/destinations/${destination.slug}`,
        categoryBadge: getDestinationCategoryLabel(destination.category),
        location: destination.district,
        providerName: getProviderName(providerProfiles[destination.provider_id ?? '']),
        providerHref: destination.provider_id ? `/providers/${destination.provider_id}` : undefined,
        priceFormatted:
          destination.entry_fee != null && destination.entry_fee > 0
            ? formatIndianCurrency(destination.entry_fee)
            : destination.entry_fee === 0
              ? 'Free Entry'
              : null,
        pricePrefix: destination.entry_fee != null && destination.entry_fee > 0 ? 'Entry fee' : null,
        ratingFormatted: ratingStr,
        ctaLabel: 'Explore Destination',
      };
    });
  }, [destinationRatings, destinations, providerProfiles]);

  // Transform offerings into unified format
  const offeringItems = useMemo<UnifiedMarketplaceItem[]>(() => {
    return offerings.map((offering) => {
      const providerProfile = providerProfiles[offering.provider_id];
      const providerName = getProviderName(providerProfile);
      const isProduct = offering.kind === 'product';
      const isExperience = offering.kind === 'experience';
      const isStay = offering.kind === 'stay';

      let ctaLabel = 'View Details';
      let pricePrefix: string | null = null;
      let priceSuffix: string | null = null;

      if (isProduct) {
        ctaLabel = 'Buy / Enquire';
        pricePrefix = 'Price';
      } else if (isExperience) {
        ctaLabel = 'Request Experience';
        pricePrefix = 'From';
      } else if (isStay) {
        ctaLabel = 'View Stay';
        priceSuffix = '/ night';
      }

      const categoryBadge =
        offering.category || getProviderOfferingKindLabel(offering.kind);

      return {
        id: offering.id,
        kind: offering.kind,
        title: offering.name,
        description:
          offering.short_description ||
          offering.description ||
          `Authentic Jharkhand ${offering.kind} offered by verified local provider.`,
        image: offering.cover_image || DEFAULT_DESTINATION_IMAGE,
        href: `/${isProduct ? 'products' : isExperience ? 'experiences' : 'stays'}/${offering.id}`,
        categoryBadge,
        location: offering.district || providerProfile?.district || 'Jharkhand',
        providerName,
        providerHref: `/providers/${offering.provider_id}`,
        priceFormatted: offering.price != null ? formatIndianCurrency(offering.price) : null,
        pricePrefix,
        priceSuffix,
        ctaLabel,
      };
    });
  }, [offerings, providerProfiles]);

  // Combined & Filtered items
  const allItems = useMemo<UnifiedMarketplaceItem[]>(() => {
    return [...destinationItems, ...offeringItems];
  }, [destinationItems, offeringItems]);

  const filteredItems = useMemo<UnifiedMarketplaceItem[]>(() => {
    return allItems.filter((item) => {
      // Category match
      if (activeCategory === 'destinations' && item.kind !== 'destination') return false;
      if (activeCategory === 'products' && item.kind !== 'product') return false;
      if (activeCategory === 'experiences' && item.kind !== 'experience') return false;
      if (activeCategory === 'stays' && item.kind !== 'stay') return false;

      // Search match
      if (!normalizedSearch) return true;

      const searchableText = [
        item.title,
        item.description,
        item.categoryBadge,
        item.location,
        item.providerName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [activeCategory, allItems, normalizedSearch]);

  const counts = useMemo(() => {
    return {
      all: allItems.length,
      destinations: destinationItems.length,
      products: offeringItems.filter((i) => i.kind === 'product').length,
      experiences: offeringItems.filter((i) => i.kind === 'experience').length,
      stays: offeringItems.filter((i) => i.kind === 'stay').length,
    };
  }, [allItems, destinationItems, offeringItems]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <PageHeader
        eyebrow="Discover & Support Local"
        title="Jharkhand Marketplace"
        description="Explore curated destinations, authentic tribal handicrafts, immersive cultural workshops, and local homestays across Jharkhand."
      />

      {/* Search & Category Filter Controls */}
      <Card className="border-clay-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="space-y-4">
          {/* Search bar at top */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, craft, destination, artisan, or district..."
              className="h-11 border-ink-200 pl-11 pr-4 text-sm focus:border-clay-500 focus:ring-clay-500"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-500 hover:text-ink-900"
              >
                Clear
              </button>
            ) : null}
          </div>

          {/* Category Tabs below search */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-ink-100">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 sm:pb-0">
              {CATEGORY_OPTIONS.map((option) => {
                const isActive = activeCategory === option.value;
                const count = counts[option.value];
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveCategory(option.value)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-clay-600 text-white shadow-sm ring-2 ring-clay-600 ring-offset-1'
                        : 'bg-sand/70 text-ink-700 hover:bg-sand hover:text-ink-900'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-clay-600'}`} />
                    <span>{option.label}</span>
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-ink-200/80 text-ink-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Results counter and reset */}
            <div className="flex items-center gap-2 text-xs text-ink-600">
              <span>
                Showing <strong>{filteredItems.length}</strong> items
              </span>
              {(searchTerm || activeCategory !== 'all') ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="h-8 gap-1 px-2.5 text-xs text-clay-700 hover:text-clay-800"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState label="Loading marketplace offerings from Jharkhand..." />
      ) : error ? (
        <ErrorState title="Unable to load marketplace" message={error} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No marketplace items found"
          message={
            searchTerm
              ? `No destinations, products, experiences, or stays match "${searchTerm}". Try adjusting your keywords or clearing the filters.`
              : 'No items are currently available in this category.'
          }
          actionLabel="View all marketplace items"
          actionHref="/marketplace"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <MarketplaceCard key={`${item.kind}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
