import { useState } from 'react';
import { ArrowLeft, Clock, MapPin, Star, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExperienceItem {
  id: string;
  title: string;
  category: 'Workshops' | 'Nature & Wildlife' | 'Adventure' | 'Culinary';
  host: string;
  duration: string;
  location: string;
  price: string;
  rating: number;
  description: string;
  image: string;
  highlights: string[];
}

const EXPERIENCES_DATA: ExperienceItem[] = [
  {
    id: 'exp1',
    title: 'Sohrai & Khovar Masterclass with Village Guilds',
    category: 'Workshops',
    host: 'Women Artisans Collective',
    duration: '3.5 Hours',
    location: 'Hazaribagh Heritage Village',
    price: '₹750 / person',
    rating: 4.9,
    description: 'Learn ancient comb-cutting and natural clay pigment techniques directly from generational mural masters on handmade tiles.',
    image: '/images/destinations/rajrappa.jpg',
    highlights: ['All clay materials provided', 'Take home painted tile', 'Herbal welcome tea'],
  },
  {
    id: 'exp2',
    title: 'Sunrise Pine Forest Trek & High Plateau Stargazing',
    category: 'Nature & Wildlife',
    host: 'Latehar Eco-Guides',
    duration: '2 Days / 1 Night',
    location: 'Netarhat Pine Ridge',
    price: '₹2,400 / person',
    rating: 5.0,
    description: 'A 2-day immersion in the misty hills of Netarhat, with guided dawn walks, campfire tribal stories, and dark-sky observation.',
    image: '/images/destinations/netarhat.jpg',
    highlights: ['Camp & tent accommodation', 'Local organic meals', 'Certified guide'],
  },
  {
    id: 'exp3',
    title: 'Patratu Reservoir Kayaking & Sunset Sail',
    category: 'Adventure',
    host: 'Jharkhand Water Sports Club',
    duration: '2 Hours',
    location: 'Patratu Valley Dam',
    price: '₹950 / person',
    rating: 4.8,
    description: 'Glide across emerald reservoir waters framed by verdant mountain ridges with sunset photography opportunities.',
    image: '/images/destinations/patratu-valley.jpg',
    highlights: ['Safety life jackets', 'Instructor assistance', 'High-res photos'],
  },
  {
    id: 'exp4',
    title: 'Tribal Foraging, Dheki Pounding & Culinary Class',
    category: 'Culinary',
    host: 'Santhali Hearth Kitchens',
    duration: '4 Hours',
    location: 'Saranda Forest Fringe',
    price: '₹1,100 / person',
    rating: 4.9,
    description: 'Gather wild forest herbs, pound rice flour on ancestral wooden Dheki, and slow-cook Dhuska & Rugra in earthenware.',
    image: '/images/destinations/dassam-falls.jpg',
    highlights: ['Full traditional lunch', 'Recipe booklet', 'Organic ingredients'],
  },
  {
    id: 'exp5',
    title: 'Dalma Elephant Sanctuary Deep Forest Trail',
    category: 'Nature & Wildlife',
    host: 'Forest Department Certified Guides',
    duration: '5 Hours',
    location: 'Dalma Hills, Jamshedpur',
    price: '₹1,500 / group',
    rating: 4.9,
    description: 'Ascend rocky trails to the Dalma ridge overlooking Subarnarekha valley, learning bird calls and wildlife tracking.',
    image: '/images/destinations/dalma-hills.jpg',
    highlights: ['Birdwatching binoculars', 'Forest permits included', 'Hydration pack'],
  },
  {
    id: 'exp6',
    title: 'Dokra Lost-Wax Bell Metal Casting Studio Tour',
    category: 'Workshops',
    host: 'Master Dhokra Brassmiths',
    duration: '3 Hours',
    location: 'Dumka Artisan Cluster',
    price: '₹850 / person',
    rating: 4.8,
    description: 'Witness the 4,000-year-old lost-wax molten metal casting process and carve your own beeswax miniature totem.',
    image: '/images/destinations/deoghar-baidyanath.jpg',
    highlights: ['Studio tour & demo', 'Wax model making', 'Souvenir figurine'],
  },
];

const CATEGORIES = ['All', 'Workshops', 'Nature & Wildlife', 'Adventure', 'Culinary'] as const;

export function ExperiencesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filtered =
    activeCategory === 'All'
      ? EXPERIENCES_DATA
      : EXPERIENCES_DATA.filter((e) => e.category === activeCategory);

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
              IMMERSIVE TRAVEL
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink-900">
              Experiences &amp; Guided Tours
            </h1>
            <p className="text-sm sm:text-base text-ink-600">
              Participate in authentic workshops, nature expeditions, and culinary journeys led by registered local masters.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={[
                  'rounded-full px-4 py-2 text-xs font-bold transition-all',
                  activeCategory === cat
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'bg-white text-ink-700 border border-ink-200 hover:bg-sand',
                ].join(' ')}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((exp) => (
            <article
              key={exp.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-ink-100">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-300 border border-white/20">
                      {exp.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-xs font-bold text-amber-300 border border-white/10">
                    <Star className="h-3 w-3 fill-amber-300" />
                    <span>{exp.rating}</span>
                  </div>
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-xs text-white/90 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    <span>{exp.location}</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-ink-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {exp.duration}
                    </span>
                    <span className="text-clay-700 font-bold text-sm">{exp.price}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-ink-900 group-hover:text-clay-700 transition-colors leading-snug">
                    {exp.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed line-clamp-2">
                    {exp.description}
                  </p>

                  <div className="space-y-1 pt-2 border-t border-ink-50">
                    {exp.highlights.map((hl) => (
                      <p key={hl} className="text-[11px] text-ink-500 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-clay-500" />
                        <span>{hl}</span>
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
                  <Store className="h-3.5 w-3.5" />
                  <span>Book in Marketplace</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
