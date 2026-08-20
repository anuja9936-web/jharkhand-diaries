import { Link } from 'react-router-dom';
import { ArrowRight, Home, MapPin, Star } from 'lucide-react';
import { Button } from '../ui';

interface StayOption {
  id: string;
  name: string;
  kind: 'Eco-Resort' | 'Village Homestay' | 'Forest Cottage' | 'Glamping Tent';
  location: string;
  pricePerNight: string;
  rating: number;
  features: string[];
  image: string;
}

const STAY_OPTIONS: StayOption[] = [
  {
    id: 's1',
    name: 'Netarhat Pine Mist Eco-Lodge',
    kind: 'Forest Cottage',
    location: 'Latehar Highlands',
    pricePerNight: '₹2,800 / night',
    rating: 4.9,
    features: ['Sal Wood Architecture', 'Organic Kitchen Garden', 'Sunrise Deck'],
    image: '/images/destinations/netarhat.jpg',
  },
  {
    id: 's2',
    name: 'Patratu Valley Hilltop Retreat',
    kind: 'Eco-Resort',
    location: 'Ramgarh Valley',
    pricePerNight: '₹4,200 / night',
    rating: 4.8,
    features: ['Panoramic Lake View', 'Infinity Pool', 'Water Sports Desk'],
    image: '/images/destinations/patratu-valley.jpg',
  },
  {
    id: 's3',
    name: 'Baidyanath Heritage Haveli Homestay',
    kind: 'Village Homestay',
    location: 'Deoghar Old Town',
    pricePerNight: '₹1,600 / night',
    rating: 4.9,
    features: ['Traditional Courtyard', 'Satvik Cuisine', 'Temple Walking Distance'],
    image: '/images/destinations/deoghar-baidyanath.jpg',
  },
  {
    id: 's4',
    name: 'Betla Forest Canopy Tented Camp',
    kind: 'Glamping Tent',
    location: 'Palamu Tiger Corridor',
    pricePerNight: '₹3,500 / night',
    rating: 4.9,
    features: ['Luxury Safari Tents', 'Night Stargazing', 'Guided Morning Safari'],
    image: '/images/destinations/betla-national-park.jpg',
  },
];

export function HomeAccommodationsSection() {
  return (
    <section className="py-20 bg-sand/30 border-y border-ink-200/70 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-3.5 py-1 text-xs font-bold text-forest-800">
              <Home className="h-3.5 w-3.5" />
              <span>RESPONSIBLE STAYS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
              Stay Your Way: From Village Homestays to Forest Retreats
            </h2>
            <p className="text-sm sm:text-base text-ink-600">
              Rest comfortably in verified eco-cottages, mountain lodges, and tribal community homestays where hospitality is an art form.
            </p>
          </div>

          <Button asChild className="shrink-0">
            <Link to="/accommodations" className="inline-flex items-center gap-2">
              <span>EXPLORE ALL STAYS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Accommodations Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAY_OPTIONS.map((stay) => (
            <article
              key={stay.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-ink-100">
                  <img
                    src={stay.image}
                    alt={stay.name}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-forest-200 border border-forest-400/30">
                      {stay.kind}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-white/10">
                    <Star className="h-3 w-3 fill-amber-300" />
                    <span>{stay.rating}</span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-white/90 font-medium">
                    <MapPin className="h-3 w-3 text-amber-400" />
                    <span>{stay.location}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2.5">
                  <p className="text-sm font-bold text-clay-700">{stay.pricePerNight}</p>
                  <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-clay-700 transition-colors leading-snug">
                    {stay.name}
                  </h3>

                  {/* Amenities */}
                  <div className="space-y-1 pt-1">
                    {stay.features.map((feat) => (
                      <p key={feat} className="text-[11px] text-ink-500 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-forest-500" />
                        <span>{feat}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-5 pt-0">
                <Link
                  to="/accommodations"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink-900 py-2 text-xs font-bold text-white hover:bg-clay-700 transition-colors"
                >
                  <span>View Details &amp; Reserve</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
