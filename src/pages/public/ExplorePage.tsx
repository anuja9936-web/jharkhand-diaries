import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Compass,
  Leaf,
  Map,
  MapPin,
  Palette,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Tent,
  Utensils,
} from 'lucide-react';
import { DestinationCard } from '../../components/destinations/DestinationCard';
import { FavouriteButton } from '../../components/destinations/FavouriteButton';
import { AddToTripModal } from '../../components/destinations/AddToTripModal';
import { ErrorState, LoadingState } from '../../components/common/StateBlocks';
import { Badge, Button, Card } from '../../components/ui';
import {
  EXPLORE_CATEGORY_OPTIONS,
  EXPLORE_TO_DB_CATEGORIES,
  JHARKHAND_DISTRICTS,
  type ExploreCategory,
} from '../../constants/destinations';
import { JHARKHAND_CUISINE, type CuisineItem } from '../../constants/cuisineContent';
import { JHARKHAND_FESTIVALS, type FestivalItem } from '../../constants/festivalContent';
import { JHARKHAND_ART_CRAFTS, type ArtCraftItem } from '../../constants/artCraftContent';
import { JHARKHAND_ADVENTURES, type AdventureItem } from '../../constants/adventureContent';
import { JHARKHAND_CULTURE, type CultureItem } from '../../constants/cultureContent';
import { normalizeSearchText } from '../../lib/utils';
import { getPublishedDestinations } from '../../services/destinations/destinationService';
import type { Destination } from '../../types/destination';
import { useTouristFavourites } from '../../hooks/useTouristFavourites';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddToTripState {
  destinationId: string;
  destinationName: string;
}

// ─── Cuisine Card ─────────────────────────────────────────────────────────────

function CuisineCard({ item }: { item: CuisineItem }) {
  return (
    <Card className="group overflow-hidden p-0 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x450/f5f0eb/37291c?text=' + encodeURIComponent(item.name);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent" />
          <Badge variant="accent" className="absolute left-4 top-4 capitalize">
            {item.type}
          </Badge>
          <p className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <MapPin className="h-3.5 w-3.5 text-clay-300" />
            {item.region}
          </p>
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start gap-2">
            <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-clay-600" />
            <h3 className="text-lg font-semibold text-ink-900">{item.name}</h3>
          </div>
          <p className="text-sm leading-6 text-ink-600 line-clamp-3">{item.description}</p>
          <div className="rounded-2xl bg-sand/70 px-3 py-2 text-xs text-ink-700">
            <span className="font-semibold">Where to try: </span>
            {item.whereToTry}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-clay-50 px-2.5 py-0.5 text-xs font-medium text-clay-800 border border-clay-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-5 pt-0">
        <Button asChild variant="secondary" className="w-full text-xs">
          <Link to="/experiences" className="inline-flex items-center justify-center gap-1.5">
            <span>Find Culinary Experience</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

// ─── Festival Card ────────────────────────────────────────────────────────────

function FestivalCard({ item }: { item: FestivalItem }) {
  return (
    <Card className="group overflow-hidden p-0 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x450/f5f0eb/37291c?text=' + encodeURIComponent(item.name);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent" />
          <Badge variant="accent" className="absolute left-4 top-4 capitalize">
            {item.category}
          </Badge>
          <p className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <Calendar className="h-3.5 w-3.5 text-clay-300" />
            {item.month} ({item.season})
          </p>
        </div>
        <div className="space-y-3 p-5">
          <h3 className="text-lg font-semibold text-ink-900">{item.name}</h3>
          <p className="text-sm leading-6 text-ink-600 line-clamp-3">{item.description}</p>
          <div className="rounded-2xl bg-sand/70 px-3 py-2 text-xs text-ink-700">
            <span className="font-semibold">Community: </span>
            {item.community}
          </div>
          <p className="text-xs text-ink-500 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-clay-600" />
            <span>{item.region}</span>
          </p>
        </div>
      </div>
      <div className="p-5 pt-0">
        <Button asChild variant="secondary" className="w-full text-xs">
          <Link to="/events" className="inline-flex items-center justify-center gap-1.5">
            <span>View Festival Calendar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

// ─── Art & Craft Card ─────────────────────────────────────────────────────────

function ArtCraftCard({ item }: { item: ArtCraftItem }) {
  return (
    <Card className="group overflow-hidden p-0 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x450/f5f0eb/37291c?text=' + encodeURIComponent(item.name);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent" />
          {item.giTagged ? (
            <Badge variant="success" className="absolute left-4 top-4 inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              GI Tagged
            </Badge>
          ) : (
            <Badge variant="accent" className="absolute left-4 top-4">
              Traditional Craft
            </Badge>
          )}
          <p className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <MapPin className="h-3.5 w-3.5 text-clay-300" />
            {item.region}
          </p>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-clay-700">
              {item.subtitle}
            </p>
            <h3 className="text-lg font-semibold text-ink-900 mt-0.5">{item.name}</h3>
          </div>
          <p className="text-sm leading-6 text-ink-600 line-clamp-3">{item.description}</p>
          <div className="rounded-2xl bg-sand/70 px-3 py-2 text-xs text-ink-700">
            <span className="font-semibold">Materials: </span>
            {item.materials}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-clay-50 px-2.5 py-0.5 text-xs font-medium text-clay-800 border border-clay-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-5 pt-0 flex flex-wrap gap-2">
        <Button asChild variant="primary" className="flex-1 text-xs">
          <Link to="/marketplace" className="inline-flex items-center justify-center gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            <span>Shop Crafts</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" className="text-xs">
          <Link to="/experiences">Workshop</Link>
        </Button>
      </div>
    </Card>
  );
}

// ─── Adventure Card ───────────────────────────────────────────────────────────

function AdventureCard({ item }: { item: AdventureItem }) {
  return (
    <Card className="group overflow-hidden p-0 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x450/f5f0eb/37291c?text=' + encodeURIComponent(item.name);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent" />
          <Badge variant="accent" className="absolute left-4 top-4 capitalize">
            {item.difficulty} • {item.activityType.replace('_', ' ')}
          </Badge>
          <p className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <MapPin className="h-3.5 w-3.5 text-clay-300" />
            {item.district} District
          </p>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-clay-700">
              {item.subtitle}
            </p>
            <h3 className="text-lg font-semibold text-ink-900 mt-0.5">{item.name}</h3>
          </div>
          <p className="text-sm leading-6 text-ink-600 line-clamp-3">{item.description}</p>
          <div className="rounded-2xl bg-sand/70 px-3 py-2 text-xs text-ink-700">
            <span className="font-semibold">Best Season: </span>
            {item.bestSeason}
          </div>
          <ul className="space-y-1 text-xs text-ink-600">
            {item.highlights.slice(0, 2).map((h, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-5 pt-0">
        <Button asChild variant="primary" className="w-full text-xs">
          <Link to="/experiences" className="inline-flex items-center justify-center gap-1.5">
            <Tent className="h-3.5 w-3.5" />
            <span>Find Adventure Guide</span>
          </Link>
        </Button>
      </div>
    </Card>
  );
}

// ─── Culture Card ─────────────────────────────────────────────────────────────

function CultureCard({ item }: { item: CultureItem }) {
  return (
    <Card className="group overflow-hidden p-0 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x450/f5f0eb/37291c?text=' + encodeURIComponent(item.name);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent" />
          <Badge variant="accent" className="absolute left-4 top-4">
            Living Heritage
          </Badge>
          <p className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <MapPin className="h-3.5 w-3.5 text-clay-300" />
            {item.region}
          </p>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-clay-700">
              {item.subtitle}
            </p>
            <h3 className="text-lg font-semibold text-ink-900 mt-0.5">{item.name}</h3>
          </div>
          <p className="text-sm leading-6 text-ink-600 line-clamp-3">{item.description}</p>
          <div className="rounded-2xl bg-sand/70 px-3 py-2 text-xs text-ink-700">
            <span className="font-semibold">Significance: </span>
            {item.culturalContext}
          </div>
        </div>
      </div>
      <div className="p-5 pt-0">
        <Button asChild variant="secondary" className="w-full text-xs">
          <Link to="/events" className="inline-flex items-center justify-center gap-1.5">
            <span>Explore Cultural Calendar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

// ─── Main Explore Page ────────────────────────────────────────────────────────

export function ExplorePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ExploreCategory>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [ecoZoneOnly, setEcoZoneOnly] = useState<boolean>(false);

  // Modals & hooks
  const [addToTripState, setAddToTripState] = useState<AddToTripState | null>(null);
  const touristFavourites = useTouristFavourites();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPublishedDestinations();
        if (mounted) setDestinations(data);
      } catch (err) {
        if (mounted) {
          setError('Unable to load destinations right now. Please try again shortly.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Destination Filtering ──────────────────────────────────────────────────
  const filteredDestinations = useMemo(() => {
    const allowedDbCategories = EXPLORE_TO_DB_CATEGORIES[activeCategory];

    let result = destinations;

    // Filter by DB category
    if (allowedDbCategories.length > 0 && activeCategory !== 'all') {
      result = result.filter((d) => allowedDbCategories.includes(d.category));
    } else if (allowedDbCategories.length === 0) {
      result = []; // Static content tab
    }

    // Filter by District
    if (selectedDistrict !== 'all') {
      const normDistrict = normalizeSearchText(selectedDistrict);
      result = result.filter((d) => normalizeSearchText(d.district) === normDistrict);
    }

    // Filter by Eco Zone
    if (ecoZoneOnly) {
      result = result.filter((d) => Boolean(d.eco_zone));
    }

    // Filter by Search Text
    if (searchTerm.trim()) {
      const q = normalizeSearchText(searchTerm);
      result = result.filter((d) => {
        const text = [
          d.name,
          d.district,
          d.category,
          d.short_description,
          d.description,
          d.best_time,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }

    return result;
  }, [destinations, activeCategory, selectedDistrict, ecoZoneOnly, searchTerm]);

  // ── Static Content Filtered Lists ──────────────────────────────────────────
  const filteredCuisine = useMemo(() => {
    let items = JHARKHAND_CUISINE;
    if (selectedDistrict !== 'all') {
      items = items.filter(
        (c) =>
          normalizeSearchText(c.region).includes(normalizeSearchText(selectedDistrict)) ||
          normalizeSearchText(c.whereToTry).includes(normalizeSearchText(selectedDistrict))
      );
    }
    if (searchTerm.trim()) {
      const q = normalizeSearchText(searchTerm);
      items = items.filter((c) => {
        const text = [c.name, c.description, c.region, c.culturalSignificance, c.whereToTry, ...c.tags]
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }
    return items;
  }, [searchTerm, selectedDistrict]);

  const filteredFestivals = useMemo(() => {
    let items = JHARKHAND_FESTIVALS;
    if (selectedDistrict !== 'all') {
      items = items.filter((f) =>
        normalizeSearchText(f.region).includes(normalizeSearchText(selectedDistrict))
      );
    }
    if (searchTerm.trim()) {
      const q = normalizeSearchText(searchTerm);
      items = items.filter((f) => {
        const text = [
          f.name,
          f.description,
          f.month,
          f.season,
          f.community,
          f.region,
          f.culturalContext,
          ...f.whatToExpect,
        ]
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }
    return items;
  }, [searchTerm, selectedDistrict]);

  const filteredArts = useMemo(() => {
    let items = JHARKHAND_ART_CRAFTS;
    if (selectedDistrict !== 'all') {
      items = items.filter((a) =>
        normalizeSearchText(a.region).includes(normalizeSearchText(selectedDistrict))
      );
    }
    if (searchTerm.trim()) {
      const q = normalizeSearchText(searchTerm);
      items = items.filter((a) => {
        const text = [
          a.name,
          a.subtitle,
          a.description,
          a.culturalContext,
          a.region,
          a.materials,
          ...a.tags,
        ]
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }
    return items;
  }, [searchTerm, selectedDistrict]);

  const filteredAdventures = useMemo(() => {
    let items = JHARKHAND_ADVENTURES;
    if (selectedDistrict !== 'all') {
      items = items.filter((adv) =>
        normalizeSearchText(adv.district).includes(normalizeSearchText(selectedDistrict))
      );
    }
    if (searchTerm.trim()) {
      const q = normalizeSearchText(searchTerm);
      items = items.filter((adv) => {
        const text = [
          adv.name,
          adv.subtitle,
          adv.description,
          adv.district,
          adv.bestSeason,
          adv.difficulty,
          ...adv.highlights,
        ]
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }
    return items;
  }, [searchTerm, selectedDistrict]);

  const filteredCulture = useMemo(() => {
    let items = JHARKHAND_CULTURE;
    if (searchTerm.trim()) {
      const q = normalizeSearchText(searchTerm);
      items = items.filter((c) => {
        const text = [c.name, c.subtitle, c.description, c.culturalContext, c.region, ...c.tags]
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }
    return items;
  }, [searchTerm]);

  const isStaticCategory = activeCategory === 'cuisine' || activeCategory === 'festival';

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    activeCategory !== 'all' ||
    selectedDistrict !== 'all' ||
    ecoZoneOnly;

  function handleClear() {
    setSearchTerm('');
    setActiveCategory('all');
    setSelectedDistrict('all');
    setEcoZoneOnly(false);
  }

  const renderFavButton = (d: Destination) => (
    <FavouriteButton
      isFavourite={touristFavourites.isFavourite(d.id)}
      loading={touristFavourites.pendingDestinationId === d.id}
      canSave={touristFavourites.isAuthenticated ? touristFavourites.isTourist : true}
      onToggle={
        touristFavourites.isAuthenticated && touristFavourites.isTourist
          ? () =>
              void touristFavourites.toggleFavourite(d.id).catch((e) => {
                window.alert(e instanceof Error ? e.message : 'Unable to update favourites.');
              })
          : undefined
      }
      compact
      className="bg-white/90 text-ink-900 shadow-lg backdrop-blur-sm"
      loginHref="/login"
      saveLabel="Save"
      savedLabel="Saved"
      loginLabel="Login to save"
      touristOnlyLabel="Tourist only"
    />
  );

  if (isLoading) return <LoadingState label="Discovering Jharkhand…" />;
  if (error) return <ErrorState title="Unable to load Explore" message={error} />;

  const featured = filteredDestinations.slice(0, 1)[0];
  const rest = filteredDestinations.slice(1);

  return (
    <>
      {/* ── Add-to-Trip Modal ─────────────────────────────────────────────── */}
      {addToTripState && (
        <AddToTripModal
          destinationId={addToTripState.destinationId}
          destinationName={addToTripState.destinationName}
          onClose={() => setAddToTripState(null)}
        />
      )}

      <div className="space-y-10">
        {/* ── Hero + Search ───────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-ink-900 to-clay-950 px-6 py-14 text-white shadow-2xl sm:px-10 sm:py-20">
          {/* Background glows */}
          <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-clay-500/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-clay-400/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-clay-300 border border-clay-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>EXPLORE JHARKHAND</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Discover Jharkhand
            </h1>
            <p className="mt-4 text-sm text-white/80 sm:text-base sm:mt-5 max-w-2xl mx-auto leading-relaxed">
              Discover places, flavours, traditions, wildlife and adventures across the state.
            </p>

            {/* Search bar */}
            <div className="mt-8 relative max-w-2xl mx-auto">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search places, experiences, cuisine..."
                className="w-full rounded-2xl border border-white/20 bg-white/10 py-4 pl-14 pr-5 text-sm text-white placeholder:text-white/50 backdrop-blur-md focus:border-clay-300 focus:outline-none focus:ring-2 focus:ring-clay-300/30 transition shadow-inner"
              />
            </div>

            {/* Quick stats pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-white/70">
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-xs">
                {destinations.length} Destinations
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-xs">
                {JHARKHAND_CUISINE.length} Cuisines
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-xs">
                {JHARKHAND_ART_CRAFTS.length} Master Crafts
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-xs">
                {JHARKHAND_FESTIVALS.length} Festivals
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-xs">
                24 Districts
              </span>
            </div>
          </div>
        </div>

        {/* ── Category Navigation Tabs ────────────────────────────────────── */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {EXPLORE_CATEGORY_OPTIONS.map((opt) => {
              const isActive = activeCategory === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActiveCategory(opt.value)}
                  className={[
                    'flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-400',
                    isActive
                      ? 'bg-forest-900 text-white font-bold shadow-sm'
                      : 'bg-[#FFFDF9] text-ink-800 border border-ink-200 hover:bg-sand hover:text-ink-950',
                  ].join(' ')}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-sand to-transparent sm:hidden" />
        </div>

        {/* ── Filter Bar (District + Eco Zone + Result Counters) ──────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-ink-200/90 bg-[#FFFDF9] p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* District Filter Dropdown */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-clay-700" />
              <label htmlFor="district-select" className="text-xs font-bold uppercase tracking-wider text-ink-700">
                District:
              </label>
              <select
                id="district-select"
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

            {/* Eco Zone Toggle */}
            <button
              type="button"
              onClick={() => setEcoZoneOnly((prev) => !prev)}
              className={[
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                ecoZoneOnly
                  ? 'border-forest-600 bg-forest-100 text-forest-900 shadow-xs'
                  : 'border-ink-200 bg-sand/30 text-ink-700 hover:bg-sand/60',
              ].join(' ')}
            >
              <Leaf className="h-3.5 w-3.5 text-forest-700" />
              <span>Eco Zones Only</span>
            </button>
          </div>

          {/* Right side: Count & Clear */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            {!isStaticCategory && (
              <span className="text-xs font-bold text-ink-600">
                {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''} found
                {selectedDistrict !== 'all' ? ` in ${selectedDistrict}` : ''}
              </span>
            )}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear filters</span>
              </Button>
            )}
          </div>
        </div>

        {/* ── CUISINE TAB ────────────────────────────────────────────────── */}
        {activeCategory === 'cuisine' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">Flavours of Jharkhand</p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink-900">What to Eat Here</h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-600 leading-relaxed">
                  Jharkhand's cuisine is deeply rooted in tribal traditions, forest foraging and seasonal agricultural rhythms.
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link to="/experiences" className="inline-flex items-center gap-2">
                  <span>Culinary Experiences</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {filteredCuisine.length === 0 ? (
              <Card className="border-dashed border-ink-300 bg-white/80 text-center py-12">
                <p className="text-base font-semibold text-ink-900">No cuisine items found</p>
                <p className="mt-1 text-sm text-ink-600">Try searching for other dishes like Dhuska, Rugra, or Thekua.</p>
                <Button type="button" variant="secondary" size="sm" onClick={handleClear} className="mt-4">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCuisine.map((item) => (
                  <CuisineCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Food Experience CTA */}
            <Card className="bg-gradient-to-r from-clay-50 to-sand border-clay-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink-900">Want to taste local cuisine?</p>
                  <p className="mt-1 text-sm text-ink-600">
                    Book a home-cooked tribal meal or food walk with local community hosts.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="primary">
                    <Link to="/experiences" className="inline-flex items-center gap-2">
                      Food Experiences <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link to="/marketplace">Shop Food Products</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── FESTIVALS TAB ──────────────────────────────────────────────── */}
        {activeCategory === 'festival' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">Cultural Calendar</p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink-900">Festivals of Jharkhand</h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-600 leading-relaxed">
                  Living expressions of indigenous heritage tied to Sal tree blooming, harvest cycles, and sacred river ghats.
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link to="/events" className="inline-flex items-center gap-2">
                  <span>Full Events Guide</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {filteredFestivals.length === 0 ? (
              <Card className="border-dashed border-ink-300 bg-white/80 text-center py-12">
                <p className="text-base font-semibold text-ink-900">No festival items found</p>
                <p className="mt-1 text-sm text-ink-600">Try searching for Sarhul, Karma, Sohrai, or Tusu Parab.</p>
                <Button type="button" variant="secondary" size="sm" onClick={handleClear} className="mt-4">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredFestivals.map((item) => (
                  <FestivalCard key={item.id} item={item} />
                ))}
              </div>
            )}

            <Card className="bg-gradient-to-r from-clay-50 to-sand border-clay-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink-900">Experience a festival in person</p>
                  <p className="mt-1 text-sm text-ink-600">
                    Book guided village stays and witness Sarna sacred rituals and Mandar drum dances firsthand.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="primary">
                    <Link to="/experiences" className="inline-flex items-center gap-2">
                      Cultural Experiences <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── ART & CRAFTS TAB ───────────────────────────────────────────── */}
        {activeCategory === 'art_crafts' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">Artisan Heritage</p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink-900">
                  Indigenous Arts &amp; Master Crafts
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-600 leading-relaxed">
                  Explore GI-tagged Sohrai wall murals, Khovar bridal art, 4,000-year-old lost-wax Dokra bronze casting, and wild Tussar silks.
                </p>
              </div>
              <Button asChild variant="primary" size="sm">
                <Link to="/marketplace" className="inline-flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span>Shop Local Crafts</span>
                </Link>
              </Button>
            </div>

            {filteredArts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredArts.map((item) => (
                  <ArtCraftCard key={item.id} item={item} />
                ))}
              </div>
            ) : null}

            {/* DB Craft Destinations */}
            {filteredDestinations.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="font-display text-xl font-bold text-ink-900">Craft Centres &amp; Villages</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDestinations.map((d) => (
                    <DestinationCard
                      key={d.id}
                      destination={d}
                      topRightAction={renderFavButton(d)}
                      onAddToTrip={(dest) =>
                        setAddToTripState({ destinationId: dest.id, destinationName: dest.name })
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ADVENTURE TAB ──────────────────────────────────────────────── */}
        {activeCategory === 'adventure' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">Wilderness &amp; Thrills</p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink-900">
                  Adventure &amp; Trekking Trails
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-600 leading-relaxed">
                  Hike the highest peaks in eastern India, kayak through serene reservoirs, and camp under the stars in lush valley ghats.
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link to="/experiences" className="inline-flex items-center gap-2">
                  <Tent className="h-4 w-4" />
                  <span>Adventure Experiences</span>
                </Link>
              </Button>
            </div>

            {filteredAdventures.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAdventures.map((item) => (
                  <AdventureCard key={item.id} item={item} />
                ))}
              </div>
            ) : null}

            {/* DB Adventure Destinations */}
            {filteredDestinations.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="font-display text-xl font-bold text-ink-900">Adventure Destinations</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDestinations.map((d) => (
                    <DestinationCard
                      key={d.id}
                      destination={d}
                      topRightAction={renderFavButton(d)}
                      onAddToTrip={(dest) =>
                        setAddToTripState({ destinationId: dest.id, destinationName: dest.name })
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CULTURE TAB ────────────────────────────────────────────────── */}
        {activeCategory === 'culture' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">Ancestral Heritage</p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink-900">
                  Living Culture: Rhythms of Earth &amp; Spirit
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-600 leading-relaxed">
                  Discover masked Seraikela Chhau performances, sacred Sal grove worship (Sarna), and syncopated Mandar rhythms.
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link to="/events" className="inline-flex items-center gap-2">
                  <span>Cultural Events</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {filteredCulture.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredCulture.map((item) => (
                  <CultureCard key={item.id} item={item} />
                ))}
              </div>
            ) : null}

            {/* DB Cultural Destinations */}
            {filteredDestinations.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="font-display text-xl font-bold text-ink-900">Cultural Landmarks &amp; Museums</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDestinations.map((d) => (
                    <DestinationCard
                      key={d.id}
                      destination={d}
                      topRightAction={renderFavButton(d)}
                      onAddToTrip={(dest) =>
                        setAddToTripState({ destinationId: dest.id, destinationName: dest.name })
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DB-BACKED DESTINATION TABS (ALL, PLACES, WILDLIFE, HERITAGE) ── */}
        {!isStaticCategory && activeCategory !== 'art_crafts' && activeCategory !== 'adventure' && activeCategory !== 'culture' && (
          <div className="space-y-8">
            {/* Empty State */}
            {filteredDestinations.length === 0 && (
              <Card className="border-dashed border-ink-300 bg-white/80 text-center py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sand text-ink-700">
                  <Search className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-ink-900">No destinations found</h2>
                <p className="mt-2 text-sm text-ink-600 max-w-md mx-auto">
                  {searchTerm || selectedDistrict !== 'all' || ecoZoneOnly
                    ? 'No places matched your active filters. Try adjusting your search keyword or selected district.'
                    : 'No destinations published in this category yet.'}
                </p>
                <div className="mt-5">
                  <Button type="button" variant="secondary" onClick={handleClear}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear all filters
                  </Button>
                </div>
              </Card>
            )}

            {/* Featured Top Pick Card */}
            {featured && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">
                  {activeCategory === 'all' ? 'Featured Destination' : 'Top Highlight'}
                </p>
                <div className="relative overflow-hidden rounded-3xl shadow-xl bg-ink-950">
                  <img
                    src={featured.cover_image || 'https://placehold.co/1200x600/f5f0eb/37291c?text=Jharkhand'}
                    alt={featured.name}
                    className="h-72 sm:h-96 w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/35 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="accent" className="capitalize">{featured.category}</Badge>
                      {featured.eco_zone && (
                        <Badge variant="success" className="inline-flex items-center gap-1">
                          <Leaf className="h-3.5 w-3.5" />
                          Eco zone
                        </Badge>
                      )}
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">{featured.name}</h2>
                    <p className="mt-2 text-sm text-white/85 max-w-2xl line-clamp-2">
                      {featured.short_description || featured.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/70">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-clay-300" />
                        {featured.district} District
                      </span>
                      {featured.best_time && (
                        <span>• Best: {featured.best_time}</span>
                      )}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button asChild variant="primary">
                        <Link to={`/destinations/${featured.slug}`} className="inline-flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Explore Destination
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="secondary"
                        className="border-white/30 text-white hover:bg-white/10 bg-white/10 backdrop-blur-sm"
                      >
                        <Link to={`/map?destination=${featured.slug}`} className="inline-flex items-center gap-2">
                          <Map className="h-4 w-4" />
                          View on Map
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="border-white/30 text-white hover:bg-white/10 bg-white/10 backdrop-blur-sm"
                        onClick={() =>
                          setAddToTripState({
                            destinationId: featured.id,
                            destinationName: featured.name,
                          })
                        }
                      >
                        + Add to My Trip
                      </Button>
                    </div>
                  </div>
                  <div className="absolute right-5 top-5">{renderFavButton(featured)}</div>
                </div>
              </div>
            )}

            {/* Grid of Other Destinations */}
            {rest.length > 0 && (
              <div>
                {featured && (
                  <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-clay-700">
                    {activeCategory === 'all' ? 'All Places to Discover' : 'More Highlights'}
                  </p>
                )}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((destination) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      topRightAction={renderFavButton(destination)}
                      onAddToTrip={(d) =>
                        setAddToTripState({ destinationId: d.id, destinationName: d.name })
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Map Connection Strip */}
            {filteredDestinations.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-3xl bg-gradient-to-r from-ink-950 to-ink-900 px-6 py-6 text-white shadow-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-clay-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Compass className="h-4 w-4" />
                    <span>GIS Map Navigation</span>
                  </div>
                  <p className="font-semibold text-lg">See these destinations on the interactive map</p>
                  <p className="mt-1 text-sm text-white/70">
                    Explore coordinates, distances, and road routes across all 24 districts.
                  </p>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  className="border-white/30 text-white hover:bg-white/10 bg-white/10 backdrop-blur-sm whitespace-nowrap"
                >
                  <Link
                    to={selectedDistrict !== 'all' ? `/map?district=${selectedDistrict}` : '/map'}
                    className="inline-flex items-center gap-2"
                  >
                    Open Map View <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Cross-Discovery Quick Cards (All tab when not searching) ─────── */}
        {activeCategory === 'all' && !searchTerm && selectedDistrict === 'all' && (
          <div className="space-y-4 pt-4 border-t border-ink-200">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">Holistic Exploration</p>
              <h3 className="text-xl font-bold text-ink-900">Explore by Category</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Flavours & Cuisine',
                  desc: `${JHARKHAND_CUISINE.length} authentic dishes`,
                  cat: 'cuisine' as ExploreCategory,
                  emoji: '🍛',
                },
                {
                  label: 'Arts & Master Crafts',
                  desc: 'GI Sohrai, Khovar & Dokra',
                  cat: 'art_crafts' as ExploreCategory,
                  emoji: '🎨',
                },
                {
                  label: 'Adventure Trails',
                  desc: 'Peaks, valley camps & lakes',
                  cat: 'adventure' as ExploreCategory,
                  emoji: '⛺',
                },
                {
                  label: 'Cultural Festivals',
                  desc: 'Sarhul, Karma & Sohrai',
                  cat: 'festival' as ExploreCategory,
                  emoji: '🎊',
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveCategory(item.cat)}
                  className="group flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5 text-left hover:border-clay-400 hover:shadow-md transition-all"
                >
                  <span className="text-3xl transition-transform group-hover:scale-110">{item.emoji}</span>
                  <div>
                    <p className="font-semibold text-ink-900 group-hover:text-clay-800">{item.label}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
