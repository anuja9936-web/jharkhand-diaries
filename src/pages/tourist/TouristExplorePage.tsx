import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  MapPin,
  Heart,
  ChevronRight,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/StateBlocks';
import { getDestinations } from '../../services/destinations/destinationService';
import { getUserFavourites, toggleFavourite } from '../../services/favourites/favouriteService';
import { getUserTrips, addDestinationToTrip } from '../../services/trips/tripService';
import {
  DEFAULT_DESTINATION_IMAGE,
  DESTINATION_CATEGORY_OPTIONS,
  JHARKHAND_DISTRICTS,
  getDestinationCategoryLabel,
} from '../../constants/destinations';
import { normalizeSearchText } from '../../lib/utils';
import type { Destination } from '../../types/destination';
import type { TripRecord, FavouriteRecord } from '../../types/tourist';

export function TouristExplorePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [togglingFavId, setTogglingFavId] = useState<string | null>(null);
  const [selectedTripDest, setSelectedTripDest] = useState<Destination | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [addingToTrip, setAddingToTrip] = useState(false);
  const [tripNotice, setTripNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [dests, favs, userTrips] = await Promise.all([
          getDestinations(),
          getUserFavourites().catch(() => []),
          getUserTrips().catch(() => []),
        ]);
        if (alive) {
          setDestinations(dests);
          setFavouriteIds(new Set(favs.map((f: FavouriteRecord) => f.destination_id)));
          setTrips(userTrips);
          if (userTrips.length > 0) {
            setSelectedTripId(userTrips[0].id);
          }
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Failed to load destinations.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      alive = false;
    };
  }, []);

  const handleToggleFav = async (destId: string) => {
    try {
      setTogglingFavId(destId);
      const isFav = await toggleFavourite(destId);
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(destId);
        else next.delete(destId);
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
    } finally {
      setTogglingFavId(null);
    }
  };

  const handleAddToTrip = async () => {
    if (!selectedTripDest || !selectedTripId) return;
    try {
      setAddingToTrip(true);
      setTripNotice(null);
      await addDestinationToTrip({
        trip_id: selectedTripId,
        destination_id: selectedTripDest.id,
      });
      setTripNotice(`Added "${selectedTripDest.name}" to your trip!`);
      setTimeout(() => {
        setSelectedTripDest(null);
        setTripNotice(null);
      }, 1500);
    } catch (err) {
      setTripNotice(err instanceof Error ? err.message : 'Unable to add destination to trip.');
    } finally {
      setAddingToTrip(false);
    }
  };

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // Category filter
      if (selectedCategory !== 'all' && dest.category !== selectedCategory) {
        return false;
      }

      // District filter
      if (selectedDistrict !== 'all') {
        if (
          !dest.district ||
          normalizeSearchText(dest.district) !== normalizeSearchText(selectedDistrict)
        ) {
          return false;
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const q = normalizeSearchText(searchTerm);
        const text = [
          dest.name,
          dest.district,
          dest.category,
          dest.short_description,
          dest.description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return text.includes(q);
      }

      return true;
    });
  }, [destinations, selectedCategory, selectedDistrict, searchTerm]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) || selectedCategory !== 'all' || selectedDistrict !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDistrict('all');
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-forest-950 to-clay-950 px-6 py-10 text-white shadow-xl sm:px-10">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest-300 border border-forest-500/30">
            <Compass className="h-3.5 w-3.5" />
            <span>TOURIST EXPLORER</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Discover Jharkhand Destinations
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            From thunderous waterfalls and sacred hill shrines to tranquil tiger reserves and tribal art villages. Explore, plan, and save your favorites.
          </p>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by waterfall, district, temple, wildlife..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/50 backdrop-blur-md focus:border-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-300/30"
            />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {DESTINATION_CATEGORY_OPTIONS.map((cat) => {
            const count =
              cat.value === 'all'
                ? destinations.length
                : destinations.filter((d) => d.category === cat.value).length;
            const active = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={[
                  'rounded-full px-4 py-2 text-xs font-bold transition whitespace-nowrap',
                  active
                    ? 'bg-forest-900 text-white shadow-sm'
                    : 'bg-[#FFFDF9] text-ink-800 border border-ink-200 hover:bg-sand',
                ].join(' ')}
              >
                <span>{cat.label}</span>
                {count > 0 ? <span className="ml-1.5 opacity-70">({count})</span> : null}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-ink-200/90 bg-[#FFFDF9] p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-clay-700" />
              <label htmlFor="exp-district" className="text-xs font-bold uppercase tracking-wider text-ink-700">
                District:
              </label>
              <select
                id="exp-district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="rounded-xl border border-ink-200 bg-sand/40 px-3 py-1.5 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-clay-400"
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

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <span className="text-xs font-bold text-ink-600">
              {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''} found
            </span>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <LoadingState label="Loading destinations..." />
      ) : error ? (
        <ErrorState title="Unable to load destinations" message={error} />
      ) : filteredDestinations.length === 0 ? (
        <EmptyState
          title="No destinations match your search"
          message="Try adjusting your category or district filter to discover more places."
          actionLabel="View All Destinations"
          actionHref="/tourist/explore"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((dest) => {
            const isFav = favouriteIds.has(dest.id);
            const isToggling = togglingFavId === dest.id;

            return (
              <Card
                key={dest.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-0 border border-ink-200/90 bg-[#FFFDF9] shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div>
                  {/* Image Header */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
                    <img
                      src={dest.cover_image || DEFAULT_DESTINATION_IMAGE}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <Badge variant="accent" className="bg-[#FAF7F2] text-xs font-semibold text-ink-900 shadow-sm">
                        {getDestinationCategoryLabel(dest.category)}
                      </Badge>
                    </div>

                    {/* Top Right Favourite Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleFav(dest.id)}
                      disabled={isToggling}
                      className={[
                        'absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition shadow-sm',
                        isFav
                          ? 'bg-rose-500 text-white'
                          : 'bg-ink-950/60 text-white hover:bg-rose-500 hover:text-white',
                      ].join(' ')}
                      title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-white' : ''}`} />
                    </button>

                    {/* Bottom District */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-white/90">
                      <MapPin className="h-3.5 w-3.5 text-clay-300" />
                      <span>{dest.district ? `${dest.district} District` : 'Jharkhand'}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-clay-700 transition-colors">
                        {dest.name}
                      </h3>
                      <p className="mt-1 text-xs text-ink-600 line-clamp-2 leading-relaxed">
                        {dest.short_description || dest.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 flex flex-wrap gap-2">
                  <Button asChild variant="primary" size="sm" className="flex-1 text-xs">
                    <Link to={`/destinations/${dest.slug}`} className="inline-flex items-center justify-center gap-1.5">
                      <span>View Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>

                  {trips.length > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedTripDest(dest)}
                      className="text-xs inline-flex items-center gap-1"
                      title="Add to Itinerary Trip"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-clay-700" />
                      <span>Add to Trip</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add To Trip Modal */}
      {selectedTripDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-ink-200">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-ink-900">Add to Itinerary</h3>
              <p className="text-xs text-ink-600">
                Add <strong>{selectedTripDest.name}</strong> to one of your saved trips.
              </p>
            </div>

            {tripNotice && (
              <div className="rounded-xl bg-forest-50 border border-forest-200 p-3 text-xs font-semibold text-forest-800">
                {tripNotice}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="modal-trip-select" className="text-xs font-bold uppercase tracking-wider text-ink-700">
                Select Trip:
              </label>
              <select
                id="modal-trip-select"
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-sand/30 p-2.5 text-xs font-semibold text-ink-900"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.trip_destinations?.length || 0} stops)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-ink-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedTripDest(null);
                  setTripNotice(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={addingToTrip}
                onClick={handleAddToTrip}
              >
                {addingToTrip ? 'Adding...' : 'Confirm Add'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
