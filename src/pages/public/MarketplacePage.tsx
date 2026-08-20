import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
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

const CATEGORY_OPTIONS: Array<{ label: string; value: MarketplaceCategory }> = [
  { label: 'All', value: 'all' },
  { label: 'Destinations', value: 'destinations' },
  { label: 'Products', value: 'products' },
  { label: 'Experiences', value: 'experiences' },
  { label: 'Stays', value: 'stays' },
];

interface DestinationRatingSummary {
  average: number | null;
  count: number;
}

function formatRating(summary: DestinationRatingSummary | undefined) {
  if (!summary || summary.count === 0 || summary.average == null) {
    return null;
  }

  return `${summary.average.toFixed(1)} ★`;
}

function getProviderName(profile: ProviderPublicProfile | null | undefined) {
  return profile?.business_name ?? profile?.full_name ?? null;
}

function getKindBadgeLabel(kind: MarketplaceCategory) {
  switch (kind) {
    case 'destinations':
      return 'Destination';
    case 'products':
      return 'Product';
    case 'experiences':
      return 'Experience';
    case 'stays':
      return 'Stay';
    default:
      return 'Marketplace';
  }
}

function MarketplaceItemCard({
  kind,
  title,
  description,
  image,
  href,
  providerHref,
  providerName,
  metaPrimary,
  metaSecondary,
  badgeText,
}: {
  kind: MarketplaceCategory;
  title: string;
  description: string;
  image: string;
  href: string;
  providerHref?: string;
  providerName?: string | null;
  metaPrimary?: string | null;
  metaSecondary?: string | null;
  badgeText?: string | null;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_-48px_rgba(55,41,28,0.7)]">
      <div className="relative aspect-[4/3] bg-sand">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="accent">{getKindBadgeLabel(kind)}</Badge>
          {badgeText ? <Badge variant="neutral">{badgeText}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-ink-900">{title}</h3>
          <p className="text-sm leading-6 text-ink-600">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-ink-600">
          {metaPrimary ? <span className="inline-flex items-center rounded-full bg-sand px-3 py-1">{metaPrimary}</span> : null}
          {metaSecondary ? <span className="inline-flex items-center rounded-full bg-ink-100 px-3 py-1">{metaSecondary}</span> : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-ink-600">
            {providerName ? (
              providerHref ? (
                <Link to={providerHref} className="font-medium text-clay-700 hover:text-clay-800">
                  {providerName}
                </Link>
              ) : (
                <span className="font-medium text-clay-700">{providerName}</span>
              )
            ) : (
              <span>Local provider</span>
            )}
          </div>
          <Button asChild variant="secondary">
            <Link to={href} className="inline-flex items-center gap-2">
              View {getKindBadgeLabel(kind)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MarketplaceSection({
  title,
  items,
  loading,
  error,
  emptyTitle,
  emptyMessage,
  actionLabel,
  actionHref,
  kind,
}: {
  title: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    href: string;
    providerName?: string | null;
    providerHref?: string;
    metaPrimary?: string | null;
    metaSecondary?: string | null;
    badgeText?: string | null;
  }>;
  loading: boolean;
  error: string | null;
  emptyTitle: string;
  emptyMessage: string;
  actionLabel: string;
  actionHref: string;
  kind: MarketplaceCategory;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">{title}</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink-900">{title}</h2>
        </div>
        <Badge variant="accent">{items.length} available</Badge>
      </div>

      {loading ? (
        <LoadingState label={`Loading ${title.toLowerCase()}...`} />
      ) : error ? (
        <ErrorState title={`Unable to load ${title.toLowerCase()}`} message={error} />
      ) : items.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} actionLabel={actionLabel} actionHref={actionHref} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <MarketplaceItemCard
              key={item.id}
              kind={kind}
              title={item.title}
              description={item.description}
              image={item.image}
              href={item.href}
              providerName={item.providerName}
              providerHref={item.providerHref}
              metaPrimary={item.metaPrimary}
              metaSecondary={item.metaSecondary}
              badgeText={item.badgeText}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export function MarketplacePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [providerProfiles, setProviderProfiles] = useState<Record<string, ProviderPublicProfile | null>>({});
  const [destinationRatings, setDestinationRatings] = useState<Record<string, DestinationRatingSummary>>({});
  const [loading, setLoading] = useState(true);
  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [experienceError, setExperienceError] = useState<string | null>(null);
  const [stayError, setStayError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory>('all');

  useEffect(() => {
    let alive = true;

    async function loadMarketplace() {
      try {
        setLoading(true);
        setDestinationError(null);
        setProductError(null);
        setExperienceError(null);
        setStayError(null);

        const [destinationResult, offeringResult] = await Promise.allSettled([getPublishedDestinations(), getPublicProviderOfferings()]);

        const nextDestinations = destinationResult.status === 'fulfilled' ? destinationResult.value : [];
        const nextOfferings = offeringResult.status === 'fulfilled' ? offeringResult.value : [];

        if (!alive) {
          return;
        }

        setDestinations(nextDestinations);
        setOfferings(nextOfferings);

        if (destinationResult.status === 'rejected') {
          setDestinationError('Destinations could not be loaded right now.');
        }

        if (offeringResult.status === 'rejected') {
          setProductError('Products, experiences, and stays could not be loaded right now.');
          setExperienceError('Products, experiences, and stays could not be loaded right now.');
          setStayError('Products, experiences, and stays could not be loaded right now.');
        }

        const providerIds = [
          ...new Set([
            ...nextDestinations.map((destination) => destination.provider_id).filter((value): value is string => Boolean(value)),
            ...nextOfferings.map((offering) => offering.provider_id).filter((value): value is string => Boolean(value)),
          ]),
        ];

        if (providerIds.length > 0) {
          const profileResults = await Promise.allSettled(providerIds.map((providerId) => getPublicProviderProfile(providerId)));

          if (!alive) {
            return;
          }

          const profileMap: Record<string, ProviderPublicProfile | null> = {};
          providerIds.forEach((providerId, index) => {
            profileMap[providerId] = profileResults[index].status === 'fulfilled' ? profileResults[index].value : null;
          });
          setProviderProfiles(profileMap);
        } else {
          setProviderProfiles({});
        }

        if (nextDestinations.length > 0) {
          try {
            const reviews = await getReviewsForDestinationIds(nextDestinations.map((destination) => destination.id));
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
        } else {
          setDestinationRatings({});
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

  const destinationItems = useMemo(
    () =>
      destinations
        .filter((destination) => {
          if (activeCategory !== 'all' && activeCategory !== 'destinations') {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          const providerName = getProviderName(providerProfiles[destination.provider_id ?? '']);
          const searchable = [
            destination.name,
            destination.short_description,
            destination.description,
            destination.district,
            getDestinationCategoryLabel(destination.category),
            providerName,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return searchable.includes(normalizedSearch);
        })
        .map((destination) => ({
          id: destination.id,
          title: destination.name,
          description: destination.short_description || destination.description || 'Discover this destination from the public explorer.',
          image: destination.cover_image || DEFAULT_DESTINATION_IMAGE,
          href: `/destinations/${destination.slug}`,
          providerName: getProviderName(providerProfiles[destination.provider_id ?? '']),
          providerHref: destination.provider_id ? `/providers/${destination.provider_id}` : undefined,
          metaPrimary: destination.district,
          metaSecondary: formatRating(destinationRatings[destination.id]),
          badgeText: getDestinationCategoryLabel(destination.category),
        })),
    [activeCategory, destinationRatings, destinations, normalizedSearch, providerProfiles]
  );

  const offeringItems = useMemo(
    () =>
      offerings
        .filter((offering) => {
          if (activeCategory === 'products' && offering.kind !== 'product') {
            return false;
          }
          if (activeCategory === 'experiences' && offering.kind !== 'experience') {
            return false;
          }
          if (activeCategory === 'stays' && offering.kind !== 'stay') {
            return false;
          }
          if (activeCategory !== 'all' && activeCategory !== `${offering.kind}s`) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          const providerName = getProviderName(providerProfiles[offering.provider_id]);
          const searchable = [
            offering.name,
            offering.short_description,
            offering.description,
            offering.category,
            offering.district,
            providerName,
            offering.metadata?.duration,
            offering.metadata?.property_type,
            offering.metadata?.material,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return searchable.includes(normalizedSearch);
        })
        .map((offering) => ({
          id: offering.id,
          title: offering.name,
          description: offering.short_description || offering.description || 'Public provider offering.',
          image: offering.cover_image || DEFAULT_DESTINATION_IMAGE,
          href: `/${offering.kind === 'product' ? 'products' : offering.kind === 'experience' ? 'experiences' : 'stays'}/${offering.id}`,
          providerName: getProviderName(providerProfiles[offering.provider_id]),
          providerHref: `/providers/${offering.provider_id}`,
          metaPrimary:
            offering.kind === 'product'
              ? offering.category || offering.district || null
              : offering.kind === 'experience'
                ? typeof offering.metadata?.duration === 'string'
                  ? offering.metadata.duration
                  : offering.district || null
                : typeof offering.metadata?.property_type === 'string'
                  ? offering.metadata.property_type
                  : offering.district || null,
          metaSecondary:
            offering.price != null
              ? offering.kind === 'stay'
                ? `${formatIndianCurrency(offering.price)} / night`
                : formatIndianCurrency(offering.price)
              : null,
          badgeText: getProviderOfferingKindLabel(offering.kind),
        })),
    [activeCategory, normalizedSearch, offerings, providerProfiles]
  );

  const activeCategoryLabel = CATEGORY_OPTIONS.find((option) => option.value === activeCategory)?.label ?? 'All';

  const sections = [
    {
      key: 'destinations' as const,
      title: 'Destinations',
      items: destinationItems,
      loading,
      error: destinationError,
      emptyTitle: 'No destinations yet',
      emptyMessage: 'Start exploring Jharkhand destinations from the public tourism explorer.',
      actionLabel: 'Explore destinations',
      actionHref: '/explore',
      kind: 'destinations' as MarketplaceCategory,
    },
    {
      key: 'products' as const,
      title: 'Products',
      items: offeringItems.filter((item) => item.href.startsWith('/products/')),
      loading,
      error: productError,
      emptyTitle: 'No products yet',
      emptyMessage: 'Local products and handicrafts will appear here once providers publish them.',
      actionLabel: 'Explore destinations',
      actionHref: '/explore',
      kind: 'products' as MarketplaceCategory,
    },
    {
      key: 'experiences' as const,
      title: 'Experiences',
      items: offeringItems.filter((item) => item.href.startsWith('/experiences/')),
      loading,
      error: experienceError,
      emptyTitle: 'No experiences yet',
      emptyMessage: 'Workshops, guided activities, and cultural sessions will appear here once providers publish them.',
      actionLabel: 'Explore destinations',
      actionHref: '/explore',
      kind: 'experiences' as MarketplaceCategory,
    },
    {
      key: 'stays' as const,
      title: 'Stays',
      items: offeringItems.filter((item) => item.href.startsWith('/stays/')),
      loading,
      error: stayError,
      emptyTitle: 'No stays yet',
      emptyMessage: 'Hotels, homestays, and guesthouses will appear here once providers publish them.',
      actionLabel: 'Explore destinations',
      actionHref: '/explore',
      kind: 'stays' as MarketplaceCategory,
    },
  ];

  const visibleSections = activeCategory === 'all' ? sections : sections.filter((section) => section.key === activeCategory);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketplace"
        title="Explore Jharkhand"
        description="Discover local destinations, products, experiences, and stays from Jharkhand's service providers."
      />

      <Card className="space-y-4 border-clay-200 bg-white/90">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">Search marketplace</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search destinations, products, experiences..."
              className="pl-11"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="px-4 py-2 text-sm">
              {activeCategoryLabel}
            </Badge>
            <Badge variant="neutral" className="px-4 py-2 text-sm">
              {searchTerm ? 'Filtered results' : 'Browse all'}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={activeCategory === option.value ? 'primary' : 'secondary'}
              onClick={() => setActiveCategory(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Loading marketplace items..." />
      ) : (
        <div className="space-y-6">
          {visibleSections.map((section) => {
            const { key: sectionKey, ...sectionProps } = section;
            return <MarketplaceSection key={sectionKey} {...sectionProps} />;
          })}
        </div>
      )}
    </div>
  );
}
