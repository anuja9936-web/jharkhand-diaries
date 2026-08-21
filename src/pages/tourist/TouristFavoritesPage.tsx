import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Compass, Bed, Sparkles, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { Button, Badge, Card } from '../../components/ui';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/StateBlocks';
import { getUserFavourites, removeFavourite } from '../../services/favourites/favouriteService';
import { getPublicProviderOfferings } from '../../services/provider/providerMarketplaceService';
import { DEFAULT_DESTINATION_IMAGE, getDestinationCategoryLabel } from '../../constants/destinations';
import { formatIndianCurrency } from '../../lib/utils';
import type { FavouriteRecord } from '../../types/tourist';
import type { ProviderOffering } from '../../types/provider';

type TabType = 'all' | 'destinations' | 'stays' | 'experiences' | 'crafts';

export function TouristFavoritesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [favourites, setFavourites] = useState<FavouriteRecord[]>([]);
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [favs, allOfferings] = await Promise.all([
        getUserFavourites().catch(() => []),
        getPublicProviderOfferings().catch(() => []),
      ]);
      setFavourites(favs);
      setOfferings(allOfferings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load your saved wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleRemove = async (destId: string) => {
    try {
      setRemovingId(destId);
      await removeFavourite(destId);
      setFavourites((prev) => prev.filter((f) => f.destination_id !== destId));
    } catch (err) {
      console.error('Failed to remove favourite:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const destinationFavs = favourites.filter((f) => f.destination);
  const stayOfferings = offerings.filter((o) => o.kind === 'stay').slice(0, 4);
  const expOfferings = offerings.filter((o) => o.kind === 'experience' || o.kind === 'tour').slice(0, 4);
  const craftOfferings = offerings.filter((o) => o.kind === 'product').slice(0, 4);

  const totalSavedCount = destinationFavs.length;

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-clay-950 to-forest-950 px-6 py-10 text-white shadow-xl sm:px-10">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3.5 py-1 text-xs font-bold text-rose-300 border border-rose-500/30">
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
            <span>MY TRAVEL WISHLIST</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Saved Gems &amp; Experiences
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Your personalized collection of breathtaking waterfalls, sacred heritage shrines, verified eco-homestays, and tribal craft masters across Jharkhand.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-200 pb-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: `All Saved (${totalSavedCount})`, icon: Heart },
            { id: 'destinations', label: `Destinations (${destinationFavs.length})`, icon: Compass },
            { id: 'stays', label: `Eco-Stays`, icon: Bed },
            { id: 'experiences', label: `Tours & Treks`, icon: Sparkles },
            { id: 'crafts', label: `Handicrafts`, icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={[
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all',
                  active
                    ? 'bg-clay-800 text-white shadow-sm'
                    : 'bg-[#FFFDF9] text-ink-700 border border-ink-200 hover:bg-sand',
                ].join(' ')}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-ink-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <Button asChild variant="secondary" size="sm" className="text-xs">
          <Link to="/tourist/explore" className="inline-flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5" />
            <span>Explore More</span>
          </Link>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState label="Loading your saved wishlist..." />
      ) : error ? (
        <ErrorState title="Unable to load wishlist" message={error} />
      ) : (
        <div className="space-y-12">
          {/* 1. Saved Destinations Section */}
          {(activeTab === 'all' || activeTab === 'destinations') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink-900">Saved Destinations</h2>
                  <p className="text-xs text-ink-600">Sacred temples, majestic waterfalls &amp; nature circuits</p>
                </div>
                <Badge variant="neutral">{destinationFavs.length} Saved</Badge>
              </div>

              {destinationFavs.length === 0 ? (
                <EmptyState
                  title="No favorite destinations yet"
                  message="Explore Jharkhand's 24 districts to bookmark mesmerizing waterfalls, hilltops, and heritage shrines to your wishlist."
                  actionLabel="Browse Destinations"
                  actionHref="/tourist/explore"
                />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {destinationFavs.map(({ destination }) => {
                    if (!destination) return null;
                    const isRemoving = removingId === destination.id;
                    return (
                      <Card
                        key={destination.id}
                        className="group flex flex-col justify-between overflow-hidden p-0 border border-ink-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
                          <img
                            src={destination.cover_image || DEFAULT_DESTINATION_IMAGE}
                            alt={destination.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <Badge variant="accent" className="bg-white/95 text-ink-900 shadow-sm text-[11px]">
                              {getDestinationCategoryLabel(destination.category)}
                            </Badge>
                          </div>
                          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-white/90">
                            <MapPin className="h-3.5 w-3.5 text-clay-300" />
                            <span>{destination.district || 'Jharkhand'}</span>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-clay-700 transition-colors">
                              {destination.name}
                            </h3>
                            <p className="mt-1 text-xs text-ink-600 line-clamp-2 leading-relaxed">
                              {destination.short_description || destination.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-ink-100 flex flex-wrap gap-2 justify-between items-center">
                            <Button asChild variant="primary" size="sm" className="text-xs flex-1">
                              <Link to={`/destinations/${destination.slug}`} className="inline-flex items-center justify-center gap-1">
                                <span>Details</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              disabled={isRemoving}
                              onClick={() => handleRemove(destination.id)}
                              className="text-xs px-2.5"
                              title="Remove from favorites"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* 2. Recommended Verified Stays Section */}
          {(activeTab === 'all' || activeTab === 'stays') && stayOfferings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink-900">Verified Eco-Stays for Your Wishlist</h2>
                  <p className="text-xs text-ink-600">Solar-powered homestays &amp; pine forest cottages</p>
                </div>
                <Button asChild variant="secondary" size="sm" className="text-xs">
                  <Link to="/accommodations">View All Stays</Link>
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stayOfferings.map((stay) => (
                  <Card key={stay.id} className="p-4 space-y-3 bg-[#FFFDF9] border-ink-200">
                    <div className="relative h-36 w-full overflow-hidden rounded-xl bg-sand">
                      <img
                        src={stay.cover_image || DEFAULT_DESTINATION_IMAGE}
                        alt={stay.name}
                        className="h-full w-full object-cover"
                      />
                      <Badge variant="accent" className="absolute top-2 left-2 text-[10px]">
                        {stay.category || 'Homestay'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ink-900 line-clamp-1">{stay.name}</h4>
                      <p className="text-xs text-ink-600">{stay.district ? `${stay.district} District` : 'Jharkhand'}</p>
                      <div className="mt-2 text-xs font-bold text-clay-700">
                        {stay.price ? `${formatIndianCurrency(stay.price)}/night` : 'On Request'}
                      </div>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="w-full text-xs">
                      <Link to={`/stays/${stay.id}`}>View Stay</Link>
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* 3. Tours & Experiences Section */}
          {(activeTab === 'all' || activeTab === 'experiences') && expOfferings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink-900">Guided Tours &amp; Treks</h2>
                  <p className="text-xs text-ink-600">Local guides, waterfall circuits &amp; adventure trails</p>
                </div>
                <Button asChild variant="secondary" size="sm" className="text-xs">
                  <Link to="/experiences">View All Experiences</Link>
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {expOfferings.map((exp) => (
                  <Card key={exp.id} className="p-4 space-y-3 bg-[#FFFDF9] border-ink-200">
                    <div className="relative h-36 w-full overflow-hidden rounded-xl bg-sand">
                      <img
                        src={exp.cover_image || DEFAULT_DESTINATION_IMAGE}
                        alt={exp.name}
                        className="h-full w-full object-cover"
                      />
                      <Badge variant="accent" className="absolute top-2 left-2 text-[10px]">
                        {exp.category || 'Experience'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ink-900 line-clamp-1">{exp.name}</h4>
                      <p className="text-xs text-ink-600">{exp.district ? `${exp.district} District` : 'Jharkhand'}</p>
                      <div className="mt-2 text-xs font-bold text-clay-700">
                        {exp.price ? formatIndianCurrency(exp.price) : 'On Request'}
                      </div>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="w-full text-xs">
                      <Link to={`/experiences/${exp.id}`}>View Details</Link>
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* 4. Cultural Crafts Showcase */}
          {(activeTab === 'all' || activeTab === 'crafts') && craftOfferings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink-900">Indigenous Mastercrafts</h2>
                  <p className="text-xs text-ink-600">GI-certified Sohrai canvas and Dhokra lost-wax castings</p>
                </div>
                <Button asChild variant="secondary" size="sm" className="text-xs">
                  <Link to="/marketplace">Marketplace</Link>
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {craftOfferings.map((craft) => (
                  <Card key={craft.id} className="p-4 space-y-3 bg-[#FFFDF9] border-ink-200">
                    <div className="relative h-36 w-full overflow-hidden rounded-xl bg-sand">
                      <img
                        src={craft.cover_image || DEFAULT_DESTINATION_IMAGE}
                        alt={craft.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ink-900 line-clamp-1">{craft.name}</h4>
                      <p className="text-xs text-ink-600">{craft.district || 'Artisan Village'}</p>
                      <div className="mt-2 text-xs font-bold text-forest-800">
                        {craft.price ? formatIndianCurrency(craft.price) : 'Enquire'}
                      </div>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="w-full text-xs">
                      <Link to={`/products/${craft.id}`}>View Craft</Link>
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
