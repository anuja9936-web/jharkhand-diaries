import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import { getPublishedDestinations } from '../../services/destinations/destinationService';
import { DESTINATION_CATEGORY_LABELS } from '../../constants/destinations';
import type { Destination } from '../../types/destination';
import { Button } from '../ui';

// Fallback destinations matching existing seeded data in case Supabase is loading/offline
const FALLBACK_DESTINATIONS: Partial<Destination>[] = [
  {
    id: 'f1',
    name: 'Patratu Valley',
    slug: 'patratu-valley',
    district: 'Ramgarh',
    category: 'adventure',
    cover_image: '/images/destinations/patratu-valley.jpg',
    short_description: 'Winding scenic mountain curves overlooking the sprawling Patratu reservoir and rolling green hills.',
    eco_zone: true,
    best_time: 'October to March',
  },
  {
    id: 'f2',
    name: 'Dassam Falls',
    slug: 'dassam-falls',
    district: 'Ranchi',
    category: 'waterfall',
    cover_image: '/images/destinations/dassam-falls.jpg',
    short_description: 'Spectacular 44-metre cascade of the Kanchi river gushing through rugged rock formations.',
    eco_zone: true,
    best_time: 'October to February',
  },
  {
    id: 'f3',
    name: 'Netarhat',
    slug: 'netarhat',
    district: 'Latehar',
    category: 'eco',
    cover_image: '/images/destinations/netarhat.jpg',
    short_description: 'The famed Queen of Chotanagpur, known for misty sunrises, pine forests, and cool plateau breezes.',
    eco_zone: true,
    best_time: 'September to April',
  },
  {
    id: 'f4',
    name: 'Betla National Park',
    slug: 'betla-national-park',
    district: 'Latehar',
    category: 'wildlife',
    cover_image: '/images/destinations/betla-national-park.jpg',
    short_description: 'Rich wildlife sanctuary home to tigers, elephants, ancient 16th-century Chero forts, and deep sal woods.',
    eco_zone: true,
    best_time: 'November to March',
  },
  {
    id: 'f5',
    name: 'Hundru Falls',
    slug: 'hundru-falls',
    district: 'Ranchi',
    category: 'waterfall',
    cover_image: '/images/destinations/hundru-falls.jpg',
    short_description: 'Jharkhand’s highest waterfall, plunging 98 metres into a natural pool carved out of granite rocks.',
    eco_zone: true,
    best_time: 'July to February',
  },
  {
    id: 'f6',
    name: 'Baidyanath Dham',
    slug: 'deoghar-baidyanath',
    district: 'Deoghar',
    category: 'religious',
    cover_image: '/images/destinations/deoghar-baidyanath.jpg',
    short_description: 'One of the twelve sacred Jyotirlingas, revered for profound spirituality and the annual Shravani Mela.',
    eco_zone: false,
    best_time: 'Throughout the year',
  },
];

export function HomePlacesSection() {
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadPlaces() {
      try {
        const data = await getPublishedDestinations();
        if (mounted && data && data.length > 0) {
          setDestinations(data.slice(0, 6));
        }
      } catch (err) {
        console.warn('[HomePlaces] Using fallback destinations', err);
      }
    }

    loadPlaces();

    return () => {
      mounted = false;
    };
  }, []);

  const displayList = destinations.length > 0 ? destinations : (FALLBACK_DESTINATIONS as Destination[]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">
            PLACES THAT STAY WITH YOU
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
            Iconic Escapes Across the Plateau
          </h2>
          <p className="text-sm sm:text-base text-ink-600">
            Explore world-renowned waterfalls, ancient temples, misty hill stations, and biodiversity hotspots.
          </p>
        </div>

        <Button asChild className="shrink-0">
          <Link to="/explore" className="inline-flex items-center gap-2">
            <span>EXPLORE ALL DESTINATIONS</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Grid of Places */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {displayList.map((destination) => (
          <article
            key={destination.id ?? destination.slug}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
          >
            {/* Image Container */}
            <div className="relative h-64 w-full overflow-hidden bg-ink-100">
              <img
                src={destination.cover_image ?? '/images/destinations/patratu-valley.jpg'}
                alt={destination.name}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                <span className="rounded-full bg-ink-900/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/10">
                  {DESTINATION_CATEGORY_LABELS[destination.category] ?? destination.category}
                </span>

                {destination.eco_zone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-forest-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-forest-200 border border-forest-500/30">
                    <ShieldCheck className="h-3 w-3" /> Eco Zone
                  </span>
                )}
              </div>

              {/* Bottom Location Indicator */}
              <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-white/90 font-medium">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>{destination.district} District</span>
              </div>
            </div>

            {/* Body Description */}
            <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-ink-900 group-hover:text-clay-700 transition-colors">
                  <Link to={`/destinations/${destination.slug}`}>
                    {destination.name}
                  </Link>
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-ink-600 line-clamp-2 leading-relaxed">
                  {destination.short_description ?? 'Discover this unique scenic destination in Jharkhand.'}
                </p>
              </div>

              {/* Footer Meta & Action */}
              <div className="pt-4 border-t border-ink-100 flex items-center justify-between text-xs">
                {destination.best_time && (
                  <span className="text-ink-500 font-medium">
                    Best: <strong className="text-ink-700">{destination.best_time}</strong>
                  </span>
                )}
                <Link
                  to={`/destinations/${destination.slug}`}
                  className="inline-flex items-center gap-1 font-bold text-clay-700 hover:text-clay-800 transition-colors ml-auto group/btn"
                >
                  <span>Explore Place</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
