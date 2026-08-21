import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CalendarDays,
  ChevronRight,
  Heart,
  MapPin,
  Sparkles,
  Bed,
  ArrowRight,
  Map,
} from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';
import { LoadingState, ErrorState } from '../../components/common/StateBlocks';
import { DEFAULT_DESTINATION_IMAGE, getDestinationCategoryLabel } from '../../constants/destinations';
import { useAuth } from '../../hooks/useAuth';
import { formatIndianCurrency } from '../../lib/utils';
import { getUserTrips } from '../../services/trips/tripService';
import { getUserFavourites } from '../../services/favourites/favouriteService';
import { getMyTouristBookings, type TouristBookingWithDetails } from '../../services/tourist/touristBookingService';
import { getDestinations } from '../../services/destinations/destinationService';
import { getTouristEcoSummary, type EcoPointsSummary } from '../../services/tourist/ecoPointsService';
import type { Destination } from '../../types/destination';
import type { TripRecord, FavouriteRecord } from '../../types/tourist';

export function TouristDashboardPage() {
  const { profile, user } = useAuth();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [favourites, setFavourites] = useState<FavouriteRecord[]>([]);
  const [bookings, setBookings] = useState<TouristBookingWithDetails[]>([]);
  const [recommendedDests, setRecommendedDests] = useState<Destination[]>([]);
  const [ecoSummary, setEcoSummary] = useState<EcoPointsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [userTrips, userFavs, userBookings, allDests, ecoData] = await Promise.all([
          getUserTrips().catch(() => []),
          getUserFavourites().catch(() => []),
          getMyTouristBookings().catch(() => []),
          getDestinations().catch(() => []),
          getTouristEcoSummary().catch(() => null),
        ]);

        if (alive) {
          setTrips(userTrips);
          setFavourites(userFavs);
          setBookings(userBookings);
          setRecommendedDests(allDests.slice(0, 6));
          setEcoSummary(ecoData);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadDashboardData();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <LoadingState label="Loading your personalized tourist dashboard..." />;
  }

  if (error) {
    return <ErrorState title="Dashboard Error" message={error} />;
  }

  const touristName = profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Traveler';
  const upcomingTrip = trips.length > 0 ? trips[0] : null;
  const recentBookings = bookings.slice(0, 3);
  const totalSavedCount = favourites.length;

  return (
    <div className="space-y-10 pb-16 font-sans">
      {/* 1. Personalized Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-forest-950 to-clay-950 p-6 sm:p-10 text-white shadow-2xl">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-forest-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-clay-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest-300 border border-forest-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>JOHAR &amp; WELCOME</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Johar, {touristName}!
            </h1>
            <p className="text-sm text-white/80 sm:text-base leading-relaxed">
              Explore Jharkhand’s 24 districts — from the thundering heights of Hundru &amp; Lodh Falls to sacred Parasnath peaks and centuries-old Sohrai mud painting villages.
            </p>
          </div>

          {/* Eco Points Badge Card */}
          {ecoSummary && (
            <Link
              to="/tourist/eco-passport"
              className="group flex flex-col items-center justify-center rounded-3xl bg-white/10 p-5 backdrop-blur-md border border-white/20 text-center min-w-[200px] shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              <span className="text-3xl">{ecoSummary.currentTier.badge}</span>
              <div className="mt-1 text-2xl font-black text-white">{ecoSummary.totalPoints} pts</div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-forest-300">
                {ecoSummary.currentTier.name}
              </p>
              <span className="mt-2 text-[10px] text-white/70 inline-flex items-center gap-1 group-hover:text-white">
                <span>View Eco Passport</span>
                <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Explore 24 Districts', href: '/tourist/explore', icon: Compass, color: 'bg-forest-50 text-forest-800 border-forest-200' },
          { label: 'GIS Map', href: '/tourist/map', icon: Map, color: 'bg-clay-50 text-clay-800 border-clay-200' },
          { label: 'Johar AI Guide', href: '/tourist/johar-ai', icon: Sparkles, color: 'bg-amber-50 text-amber-800 border-amber-200' },
          { label: 'My Saved Trips', href: '/tourist/itinerary', icon: CalendarDays, color: 'bg-teal-50 text-teal-800 border-teal-200' },
          { label: 'My Bookings', href: '/tourist/requests', icon: Bed, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
          { label: 'Saved Wishlist', href: '/tourist/favorites', icon: Heart, color: 'bg-rose-50 text-rose-800 border-rose-200' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.href}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${action.color}`}
            >
              <Icon className="h-5 w-5 mb-2" />
              <span className="text-xs font-bold leading-tight">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 3. Upcoming Trip & Recent Bookings (Side by Side) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Trip Card */}
        <Card className="flex flex-col justify-between p-6 space-y-4 border-ink-200/90 bg-[#FFFDF9] shadow-md">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-clay-700" />
              <h2 className="font-display text-lg font-bold text-ink-900">Upcoming Journey</h2>
            </div>
            {upcomingTrip ? (
              <Badge variant="accent">Active Itinerary</Badge>
            ) : null}
          </div>

          {upcomingTrip ? (
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-bold text-ink-900">{upcomingTrip.title}</h3>
                <p className="text-xs text-ink-600 mt-1">
                  Starting from <strong>{upcomingTrip.start_location || 'Ranchi'}</strong> • {upcomingTrip.trip_destinations?.length || 0} destinations scheduled
                </p>
              </div>

              {upcomingTrip.budget ? (
                <div className="text-xs font-bold text-clay-800 bg-sand/60 px-3 py-1.5 rounded-xl inline-block">
                  Estimated Budget: {formatIndianCurrency(upcomingTrip.budget)}
                </div>
              ) : null}

              {upcomingTrip.trip_destinations && upcomingTrip.trip_destinations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {upcomingTrip.trip_destinations.slice(0, 3).map((stop) => (
                    <span key={stop.id} className="text-[11px] font-semibold bg-sand px-2.5 py-1 rounded-full text-ink-800">
                      📍 {stop.destination?.name || 'Destination'}
                    </span>
                  ))}
                  {upcomingTrip.trip_destinations.length > 3 && (
                    <span className="text-[11px] font-semibold bg-ink-100 px-2 py-1 rounded-full text-ink-700">
                      +{upcomingTrip.trip_destinations.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs text-ink-600">You haven't scheduled your next Jharkhand adventure yet.</p>
              <Button asChild variant="primary" size="sm" className="text-xs">
                <Link to="/plan-trip" className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate Itinerary with AI</span>
                </Link>
              </Button>
            </div>
          )}

          <div className="pt-3 border-t border-ink-100 flex items-center justify-between">
            <span className="text-xs text-ink-500">{trips.length} saved trip{trips.length !== 1 ? 's' : ''} total</span>
            {upcomingTrip && (
              <Button asChild variant="secondary" size="sm" className="text-xs">
                <Link to={`/tourist/itinerary/${upcomingTrip.id}`} className="inline-flex items-center gap-1">
                  <span>Manage Trip</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </Card>

        {/* Recent Bookings & Enquiries */}
        <Card className="flex flex-col justify-between p-6 space-y-4 border-ink-200/90 bg-[#FFFDF9] shadow-md">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-forest-700" />
              <h2 className="font-display text-lg font-bold text-ink-900">Recent Bookings &amp; Enquiries</h2>
            </div>
            <Link to="/tourist/requests" className="text-xs font-bold text-clay-700 hover:text-clay-800">
              View All ({bookings.length})
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="space-y-3 divide-y divide-ink-100">
              {recentBookings.map((b) => (
                <div key={b.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-ink-900">{b.offering?.name || 'Jharkhand Stay / Experience'}</h4>
                    <p className="text-ink-600 text-[11px]">
                      {b.preferred_date ? `Date: ${b.preferred_date}` : 'Flexible timing'} • {b.participants} Guest(s)
                    </p>
                  </div>
                  <Badge
                    variant={
                      b.status === 'accepted'
                        ? 'success'
                        : b.status === 'rejected'
                        ? 'warning'
                        : b.status === 'completed'
                        ? 'neutral'
                        : 'accent'
                    }
                    className="capitalize text-[10px]"
                  >
                    {b.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs text-ink-600">No booking enquiries submitted yet.</p>
              <Button asChild variant="secondary" size="sm" className="text-xs">
                <Link to="/accommodations">Browse Verified Stays</Link>
              </Button>
            </div>
          )}

          <div className="pt-3 border-t border-ink-100 flex items-center justify-between">
            <span className="text-xs text-ink-500">Local rural homestays, transport &amp; tours</span>
            <Button asChild variant="secondary" size="sm" className="text-xs">
              <Link to="/tourist/requests">Go to Bookings</Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* 4. AI Recommended Destinations for You */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">Recommended Destinations</h2>
            <p className="text-xs text-ink-600">Curated cultural spots, waterfalls, and nature parks across Jharkhand</p>
          </div>
          <Button asChild variant="secondary" size="sm" className="text-xs">
            <Link to="/tourist/explore" className="inline-flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedDests.map((dest) => (
            <Card
              key={dest.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl p-0 border border-ink-200/90 bg-[#FFFDF9] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
                  <img
                    src={dest.cover_image || DEFAULT_DESTINATION_IMAGE}
                    alt={dest.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="accent" className="bg-[#FAF7F2] text-xs font-semibold text-ink-900 shadow-sm">
                      {getDestinationCategoryLabel(dest.category)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-white/90">
                    <MapPin className="h-3.5 w-3.5 text-clay-300" />
                    <span>{dest.district || 'Jharkhand'}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-clay-700 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed">
                    {dest.short_description || dest.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <Button asChild variant="primary" size="sm" className="flex-1 text-xs">
                  <Link to={`/destinations/${dest.slug}`}>Explore Details</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Saved Wishlist Preview */}
      {totalSavedCount > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
              <h2 className="font-display text-xl font-bold text-ink-900">Your Saved Wishlist</h2>
            </div>
            <Link to="/tourist/favorites" className="text-xs font-bold text-clay-700 hover:text-clay-800">
              View Wishlist ({totalSavedCount})
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {favourites.slice(0, 4).map(({ destination }) => {
              if (!destination) return null;
              return (
                <Link
                  key={destination.id}
                  to={`/destinations/${destination.slug}`}
                  className="group flex flex-col rounded-2xl border border-ink-200/80 bg-white p-3 shadow-xs hover:-translate-y-1 hover:shadow-md transition"
                >
                  <div className="relative h-28 w-full overflow-hidden rounded-xl bg-sand">
                    <img
                      src={destination.cover_image || DEFAULT_DESTINATION_IMAGE}
                      alt={destination.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="font-bold text-xs text-ink-900 truncate group-hover:text-clay-700">{destination.name}</h4>
                    <p className="text-[11px] text-ink-600 truncate">{destination.district}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
