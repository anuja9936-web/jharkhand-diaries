import { useState } from 'react';
import { ArrowLeft, Bed, Check, MapPin, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StayItem {
  id: string;
  name: string;
  type: 'Village Homestay' | 'Eco-Resort' | 'Forest Cottage' | 'Glamping Tent';
  location: string;
  district: string;
  price: string;
  rating: number;
  description: string;
  amenities: string[];
  image: string;
}

const STAYS_DATA: StayItem[] = [
  {
    id: 'stay1',
    name: 'Netarhat Pine Mist Eco-Lodge',
    type: 'Forest Cottage',
    location: 'Upper Plateau Ridge',
    district: 'Latehar',
    price: '₹2,800 / night',
    rating: 4.9,
    description: 'Rustic wooden chalets overlooking morning clouds and pine groves, equipped with solar heating and home-cooked meals.',
    amenities: ['Solar Power & Heating', 'Organic Kitchen Garden', 'Bonfire & Stargazing', 'Sunrise Viewpoint'],
    image: '/images/destinations/netarhat.jpg',
  },
  {
    id: 'stay2',
    name: 'Patratu Lake Resort & Eco Villas',
    type: 'Eco-Resort',
    location: 'Reservoir Waterfront',
    district: 'Ramgarh',
    price: '₹4,200 / night',
    rating: 4.8,
    description: 'Spacious boutique stone villas offering panoramic infinity lake views, water sports access, and a multi-cuisine restaurant.',
    amenities: ['Infinity View Pool', 'Water Sports Facility', 'Free High-speed Wi-Fi', 'Private Balcony'],
    image: '/images/destinations/patratu-valley.jpg',
  },
  {
    id: 'stay3',
    name: 'Baidyanath Heritage Courtyard Homestay',
    type: 'Village Homestay',
    location: 'Tower Chowk Area',
    district: 'Deoghar',
    price: '₹1,600 / night',
    rating: 4.9,
    description: 'Traditional terracotta courtyard home offering pure vegetarian satvik meals and warm family hospitality close to the temple.',
    amenities: ['Home-cooked Satvik Thali', 'Temple Guidance', 'Air Conditioning', 'Family Suites'],
    image: '/images/destinations/deoghar-baidyanath.jpg',
  },
  {
    id: 'stay4',
    name: 'Betla Forest Wilderness Safari Camp',
    type: 'Glamping Tent',
    location: 'Palamu Tiger Buffer Zone',
    district: 'Latehar',
    price: '₹3,500 / night',
    rating: 4.9,
    description: 'Luxury weather-proof safari tents on elevated wooden platforms with en-suite bathrooms and dawn wildlife walks.',
    amenities: ['En-suite Modern Baths', 'Morning Safari Guide', 'Campfire Dining', 'Eco-certified'],
    image: '/images/destinations/betla-national-park.jpg',
  },
  {
    id: 'stay5',
    name: 'Saranda Forest Treehouse & Eco-Camp',
    type: 'Forest Cottage',
    location: 'Manoharpur Riverbank',
    district: 'West Singhbhum',
    price: '₹3,000 / night',
    rating: 4.8,
    description: 'Elevated wooden treehouses nestled amidst seven hundred hills of the Asia’s largest dense Sal forest.',
    amenities: ['Riverfront Bathing', 'Tribal Culinary Master', 'Forest Tracking Guide', 'Zero-waste Operation'],
    image: '/images/destinations/dassam-falls.jpg',
  },
  {
    id: 'stay6',
    name: 'Jonha Village Cultural Homestay',
    type: 'Village Homestay',
    location: 'Jonha Falls Foothills',
    district: 'Ranchi',
    price: '₹1,400 / night',
    rating: 4.9,
    description: 'Authentic mud-plastered tribal homestay painted with Sohrai art motifs, serving hot Dhuska and hand-ground chutneys.',
    amenities: ['Sohrai Painted Courtyard', 'Authentic Dhuska Breakfast', 'Waterfall Walking Trail', 'Local Host Family'],
    image: '/images/destinations/jonha-falls.jpg',
  },
];

const TYPES = ['All', 'Village Homestay', 'Eco-Resort', 'Forest Cottage', 'Glamping Tent'] as const;

export function AccommodationsPage() {
  const [activeType, setActiveType] = useState<string>('All');

  const filtered =
    activeType === 'All' ? STAYS_DATA : STAYS_DATA.filter((s) => s.type === activeType);

  return (
    <div className="min-h-screen bg-ink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ink-200">
          <div className="space-y-3 max-w-2xl">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-clay-700 hover:text-clay-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">
              STAY YOUR WAY
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink-900">
              Accommodations &amp; Eco-Stays
            </h1>
            <p className="text-sm sm:text-base text-ink-600">
              Discover verified rural homestays, pine wood forest chalets, nature resorts, and luxury glamping camps across Jharkhand.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={[
                  'rounded-full px-4 py-2 text-xs font-bold transition-all',
                  activeType === type
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'bg-white text-ink-700 border border-ink-200 hover:bg-sand',
                ].join(' ')}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Stays Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((stay) => (
            <article
              key={stay.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-ink-100">
                  <img
                    src={stay.image}
                    alt={stay.name}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-forest-200 border border-forest-400/30">
                      {stay.type}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-xs font-bold text-amber-300 border border-white/10">
                    <Star className="h-3 w-3 fill-amber-300" />
                    <span>{stay.rating}</span>
                  </div>
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-xs text-white/90 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    <span>{stay.location}, {stay.district}</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-clay-700">{stay.price}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified Host
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-ink-900 group-hover:text-clay-700 transition-colors leading-snug">
                    {stay.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed line-clamp-2">
                    {stay.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-ink-50">
                    {stay.amenities.map((am) => (
                      <p key={am} className="text-[11px] text-ink-500 flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-forest-600 shrink-0" />
                        <span>{am}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to="/marketplace"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-ink-900 py-2.5 text-xs font-bold text-white hover:bg-clay-700 transition-colors"
                >
                  <Bed className="h-3.5 w-3.5" />
                  <span>Reserve Stay in Marketplace</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
