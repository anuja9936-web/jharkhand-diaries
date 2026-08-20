import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Compass,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/StateBlocks';
import { JHARKHAND_DISTRICTS } from '../../constants/destinations';
import { formatIndianCurrency, normalizeSearchText } from '../../lib/utils';
import { getPublicProviderOfferings } from '../../services/provider/providerMarketplaceService';
import type { ProviderOffering } from '../../types/provider';

const TOUR_CATEGORIES = [
  'All',
  'Heritage & Culture',
  'Wildlife & Nature',
  'Tribal Experience',
  'Adventure',
  'Pilgrimage',
  'Photography',
] as const;

function TourCard({ tour }: { tour: ProviderOffering }) {
  const metadata = (tour.metadata ?? {}) as Record<string, unknown>;
  const rating = typeof metadata.rating === 'number' ? metadata.rating : 4.8;
  const reviewsCount = typeof metadata.reviews_count === 'number' ? metadata.reviews_count : null;
  const guideName =
    typeof metadata.guide_name === 'string'
      ? metadata.guide_name
      : typeof metadata.host_name === 'string'
        ? metadata.host_name
        : 'Certified Local Guide';
  const duration = typeof metadata.duration === 'string' ? metadata.duration : null;
  const maxGroup = typeof metadata.max_participants === 'number' ? metadata.max_participants : null;
  const specialties = Array.isArray(metadata.specialties)
    ? (metadata.specialties as string[])
    : ['Local Expertise', 'Cultural Immersion'];

  const priceText =
    tour.price != null && tour.price > 0
      ? `${formatIndianCurrency(tour.price)} / person`
      : 'Price on request';

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/90 bg-[#FFFDF9] shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-clay-300 hover:shadow-xl">
      <div>
        {/* Cover Image & Badges */}
        <div className="relative h-56 w-full overflow-hidden bg-sand">
          <img
            src={tour.cover_image || '/images/destinations/netarhat.jpg'}
            alt={tour.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x400/f5f0eb/37291c?text=' + encodeURIComponent(tour.name);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/20 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
            <Badge variant="accent" className="bg-[#FAF7F2] text-xs font-semibold text-ink-900 shadow-sm backdrop-blur-sm">
              {tour.category || 'Guided Tour'}
            </Badge>
          </div>

          {/* Bottom Left: Rating */}
          <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-xl bg-white/95 px-2.5 py-1 text-xs font-bold text-ink-900 shadow-sm backdrop-blur-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {rating}
              {reviewsCount && (
                <span className="font-normal text-ink-500 ml-0.5">({reviewsCount})</span>
              )}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div>
            <h2 className="font-display text-base font-bold leading-snug text-ink-900 group-hover:text-clay-800 transition-colors">
              {tour.name}
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-clay-700">
              <Compass className="h-3 w-3" />
              {guideName}
            </p>
          </div>

          {tour.short_description || tour.description ? (
            <p className="text-xs text-ink-600 leading-relaxed line-clamp-2">
              {tour.short_description || tour.description}
            </p>
          ) : null}

          {/* Highlights */}
          <div className="flex flex-wrap gap-1.5">
            {duration && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-sand px-2 py-0.5 text-[11px] font-medium text-ink-700">
                <Clock className="h-3 w-3 text-clay-700" />
                {duration}
              </span>
            )}
            {maxGroup && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-sand px-2 py-0.5 text-[11px] font-medium text-ink-700">
                <Users className="h-3 w-3 text-clay-700" />
                Up to {maxGroup} guests
              </span>
            )}
            {(specialties as string[]).slice(0, 2).map((s) => (
              <span
                key={s}
                className="rounded-lg bg-sand px-2 py-0.5 text-[11px] font-medium text-ink-700"
              >
                {s}
              </span>
            ))}
          </div>

          {tour.district && (
            <p className="flex items-center gap-1 text-xs text-ink-500">
              <MapPin className="h-3 w-3 text-clay-600" />
              {tour.district}, Jharkhand
            </p>
          )}
        </div>
      </div>

      {/* Footer: Price + CTA */}
      <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3.5">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-ink-400">
            From
          </span>
          <span className="text-sm font-bold text-ink-900">{priceText}</span>
        </div>
        <Button asChild size="sm">
          <Link to={`/tours/${tour.id}`}>Book Tour</Link>
        </Button>
      </div>
    </article>
  );
}

export function ToursPage() {
  const [tours, setTours] = useState<ProviderOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicProviderOfferings('tour');
        setTours(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load guided tours.');
      } finally {
        setLoading(false);
      }
    };

    void loadTours();
  }, []);

  const filteredTours = useMemo(() => {
    const needle = normalizeSearchText(searchTerm);
    return tours.filter((t) => {
      const matchSearch =
        !needle ||
        normalizeSearchText(t.name).includes(needle) ||
        (t.short_description && normalizeSearchText(t.short_description).includes(needle)) ||
        (t.description && normalizeSearchText(t.description).includes(needle)) ||
        (t.district && normalizeSearchText(t.district).includes(needle));

      const matchDistrict = selectedDistrict === 'All' || t.district === selectedDistrict;

      const matchCategory =
        selectedCategory === 'All' ||
        (t.category && normalizeSearchText(t.category).includes(normalizeSearchText(selectedCategory)));

      return matchSearch && matchDistrict && matchCategory;
    });
  }, [tours, searchTerm, selectedDistrict, selectedCategory]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedDistrict('All');
    setSelectedCategory('All');
  };

  const hasFilters = searchTerm || selectedDistrict !== 'All' || selectedCategory !== 'All';

  if (loading) {
    return <LoadingState label="Discovering guided tours across Jharkhand..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load tours" message={error} />;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-ink-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src="/images/destinations/netarhat.jpg"
            alt="Guided Tours in Jharkhand"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/70 to-ink-950" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3" />
              Certified Local Guides
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sand/90 backdrop-blur-sm">
              All 24 Districts
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Guided Tours &<br />
            <span className="text-amber-400">Local Experiences</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg">
            Explore Jharkhand with expert local guides — heritage walks, wildlife safaris, tribal
            village trails, and custom itineraries crafted for authentic discovery.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-64 max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                placeholder="Search tours by name, district, or style..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/95 pl-11 pr-4 py-3 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-clay-400 shadow-sm"
                id="tour-search"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 border-b border-ink-200/80 bg-[rgba(247,243,234,0.95)] backdrop-blur-xl shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 py-3">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
              {TOUR_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-clay-700 text-white shadow-sm'
                      : 'bg-white text-ink-700 border border-ink-200 hover:bg-sand'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* District filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="ml-auto rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 focus:outline-none focus:ring-1 focus:ring-clay-400"
              id="tour-district-filter"
            >
              <option value="All">All Districts</option>
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-sand transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tour Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-ink-600">
            <span className="font-bold text-ink-900">{filteredTours.length}</span>{' '}
            {filteredTours.length === 1 ? 'tour' : 'tours'} available
            {selectedDistrict !== 'All' && ` in ${selectedDistrict}`}
          </p>
        </div>

        {filteredTours.length === 0 ? (
          <EmptyState
            title={tours.length === 0 ? 'No tours listed yet' : 'No tours match your filters'}
            message={
              tours.length === 0
                ? 'Certified local guides and tour operators will appear here once they publish their itineraries. Check back soon!'
                : 'Try adjusting your search or district filter.'
            }
            actionLabel={hasFilters ? 'Clear Filters' : 'Explore Destinations'}
            actionHref={hasFilters ? '/tours' : '/explore'}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}

        {/* Partner CTA */}
        {tours.length > 0 && (
          <div className="mt-16 rounded-3xl bg-ink-950 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                Are you a local guide?
              </p>
              <h3 className="font-display text-xl font-bold text-white">
                List your guided tours on Jharkhand Diaries
              </h3>
              <p className="mt-1.5 text-sm text-ink-300">
                Reach thousands of travellers seeking authentic Jharkhand experiences.
              </p>
            </div>
            <Button asChild className="shrink-0 bg-amber-500 text-ink-950 hover:bg-amber-400">
              <Link to="/provider">Become a Partner Guide</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
