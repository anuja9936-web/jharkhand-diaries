import { useEffect, useMemo, useState } from 'react';
import { LocateFixed, List, Map as MapIcon, RotateCcw, Search } from 'lucide-react';
import { DestinationCard } from '../../components/destinations/DestinationCard';
import { FavouriteButton } from '../../components/destinations/FavouriteButton';
import { ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { TourismMap } from '../../components/map/TourismMap';
import { Badge, Button, Card, Input } from '../../components/ui';
import {
  DESTINATION_CATEGORY_LABELS,
  DESTINATION_CATEGORY_OPTIONS,
  type DestinationFilterCategory,
} from '../../constants/destinations';
import { normalizeSearchText } from '../../lib/utils';
import { getPublishedDestinations } from '../../services/destinations/destinationService';
import type { Destination } from '../../types/destination';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTouristFavourites } from '../../hooks/useTouristFavourites';

type MobileView = 'map' | 'list';

const INITIAL_MOBILE_VIEW: MobileView = 'map';

export function ExplorePage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<DestinationFilterCategory>('all');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>(INITIAL_MOBILE_VIEW);
  const { location: userLocation, status: locationStatus, errorMessage, requestLocation, clearError } =
    useGeolocation();
  const touristFavourites = useTouristFavourites();

  useEffect(() => {
    let isMounted = true;

    async function loadDestinations() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getPublishedDestinations();

        if (isMounted) {
          setDestinations(result);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? 'We could not load destinations from Supabase right now. Please try again shortly.'
              : 'We could not load destinations from Supabase right now. Please try again shortly.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDestinations = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchTerm);

    return destinations.filter((destination) => {
      const matchesCategory =
        activeCategory === 'all' || destination.category === activeCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const categoryLabel = DESTINATION_CATEGORY_LABELS[destination.category];
      const searchableText = [
        destination.name,
        destination.district,
        destination.category,
        categoryLabel,
        destination.short_description,
        destination.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [activeCategory, destinations, searchTerm]);

  useEffect(() => {
    if (selectedDestination && !filteredDestinations.some((destination) => destination.slug === selectedDestination.slug)) {
      setSelectedDestination(null);
    }
  }, [filteredDestinations, selectedDestination]);

  const handleShowOnMap = (destination: Destination) => {
    setSelectedDestination({ ...destination });

    if (!isDesktop) {
      setMobileView('map');
    }
  };

  const handleRequestLocation = () => {
    if (!isDesktop) {
      setMobileView('map');
    }

    clearError();
    requestLocation();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
    setSelectedDestination(null);
  };

  const renderFavouriteAction = (destination: Destination) => (
    <FavouriteButton
      isFavourite={touristFavourites.isFavourite(destination.id)}
      loading={touristFavourites.pendingDestinationId === destination.id}
      canSave={touristFavourites.isAuthenticated ? touristFavourites.isTourist : true}
      onToggle={
        touristFavourites.isAuthenticated && touristFavourites.isTourist
          ? () =>
              void touristFavourites.toggleFavourite(destination.id).catch((error) => {
                window.alert(error instanceof Error ? error.message : 'Unable to update favourites.');
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

  if (isLoading) {
    return <LoadingState label="Loading Jharkhand destinations..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load Explore" message={error} />;
  }

  const hasResults = filteredDestinations.length > 0;
  const shouldShowMap = isDesktop || mobileView === 'map';

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        eyebrow="Public discovery"
        title="Explore Jharkhand"
        description="Discover waterfalls, tribal heritage, eco destinations, crafts and hidden gems across Jharkhand."
        actions={
          <Button type="button" variant="secondary" onClick={handleRequestLocation} className="inline-flex items-center gap-2">
            <LocateFixed className="h-4 w-4" />
            Locate Me
          </Button>
        }
      />

      <Card className="space-y-5 overflow-hidden border-clay-200 bg-white/90">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">Search destinations</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by destination, district, or category"
              className="pl-11"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="accent" className="px-4 py-2 text-sm">
              {filteredDestinations.length} destinations
            </Badge>
            <Button type="button" variant="secondary" onClick={handleClearFilters} className="inline-flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {DESTINATION_CATEGORY_OPTIONS.map((option) => {
            const isActive = activeCategory === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant={isActive ? 'primary' : 'secondary'}
                onClick={() => setActiveCategory(option.value)}
                className="whitespace-nowrap"
              >
                {option.label}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand px-4 py-3 text-sm text-ink-700">
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-clay-700" />
            <span>Map and list stay synchronized through the same filtered destination set.</span>
          </div>
          {selectedDestination ? (
            <div className="flex items-center gap-2">
              <span className="font-medium text-ink-900">Selected:</span>
              <span>{selectedDestination.name}</span>
            </div>
          ) : null}
        </div>
      </Card>

      {errorMessage ? (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-6 text-amber-900">{errorMessage}</p>
            <Button type="button" variant="secondary" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        </Card>
      ) : null}

      {locationStatus === 'requesting' ? (
        <Card className="border-clay-200 bg-white/90">
          <p className="text-sm text-ink-600">Requesting your location so we can center the map on where you are now.</p>
        </Card>
      ) : null}

      {userLocation ? (
        <Card className="border-forest-200 bg-forest-50/70">
          <p className="text-sm leading-6 text-forest-900">
            Location ready. The map is centered near your position so you can explore Jharkhand from here.
          </p>
        </Card>
      ) : null}

      {!hasResults ? (
        <Card className="border-dashed border-ink-300 bg-white/80 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sand text-ink-700">
            <Search className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-ink-900">No destinations found.</h2>
          <p className="mt-2 text-sm leading-6 text-ink-600">
            Try a different search, switch category filters, or clear the current filters to see more Jharkhand destinations.
          </p>
          <div className="mt-5">
            <Button type="button" variant="secondary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="lg:hidden">
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-ink-200">
          <Button
            type="button"
            variant={mobileView === 'map' ? 'primary' : 'ghost'}
            onClick={() => setMobileView('map')}
            className="inline-flex items-center gap-2"
          >
            <MapIcon className="h-4 w-4" />
            Map
          </Button>
          <Button
            type="button"
            variant={mobileView === 'list' ? 'primary' : 'ghost'}
            onClick={() => setMobileView('list')}
            className="inline-flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>

        {shouldShowMap ? (
          <div className="overflow-hidden rounded-[1.75rem] border border-ink-200 bg-white shadow-[0_18px_70px_-40px_rgba(55,41,28,0.55)]">
            <TourismMap
              destinations={filteredDestinations}
              selectedDestination={selectedDestination}
              isVisible={shouldShowMap}
              userLocation={userLocation}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                isActive={destination.slug === selectedDestination?.slug}
                onShowOnMap={handleShowOnMap}
                topRightAction={renderFavouriteAction(destination)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-ink-200 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay-700">Interactive map</p>
                  <p className="mt-1 text-sm text-ink-600">
                    Explore Jharkhand destinations visually. Markers, popups, and the list all stay in sync.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="accent">{filteredDestinations.length} markers</Badge>
                  {selectedDestination ? <Badge variant="success">Selected on map</Badge> : null}
                </div>
              </div>
            </div>
            <TourismMap
              destinations={filteredDestinations}
              selectedDestination={selectedDestination}
              isVisible={true}
              userLocation={userLocation}
            />
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay-700">Destination list</p>
                <p className="mt-1 text-sm text-ink-600">Tap a card to focus it on the map.</p>
              </div>
              <Badge variant="accent">{filteredDestinations.length} results</Badge>
            </div>

            <div className="max-h-[760px] space-y-4 overflow-y-auto pr-1">
              {filteredDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                isActive={destination.slug === selectedDestination?.slug}
                onShowOnMap={handleShowOnMap}
                topRightAction={renderFavouriteAction(destination)}
              />
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
