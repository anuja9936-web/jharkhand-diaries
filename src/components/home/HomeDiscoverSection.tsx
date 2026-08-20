import { Link } from 'react-router-dom';
import {
  Compass,
  UtensilsCrossed,
  Footprints,
  Palette,
  Music2,
  TreePine,
  Landmark,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  DESTINATION_IMAGES,
  CUISINE_IMAGES,
  ADVENTURE_IMAGES,
  ART_CRAFT_IMAGES,
  CULTURE_IMAGES,
} from '../../constants/contentImages';

interface CategoryPillar {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Compass;
  href: string;
  image: string;
  badge: string;
}

const CATEGORY_PILLARS: CategoryPillar[] = [
  {
    id: 'places',
    title: 'Places',
    subtitle: 'Waterfalls & Hills',
    description: 'Waterfalls, hills, forests and hidden escapes across the plateau.',
    icon: Compass,
    href: '/explore',
    image: DESTINATION_IMAGES.HUNDRU_FALLS,
    badge: '24 Districts',
  },
  {
    id: 'cuisine',
    title: 'Cuisine',
    subtitle: 'Traditional Flavours',
    description: 'Flavours rooted in Jharkhand’s traditions — Dhuska, Rugra & Karil.',
    icon: UtensilsCrossed,
    href: '#cuisine',
    image: CUISINE_IMAGES.DHUSKA,
    badge: 'Indigenous Flavours',
  },
  {
    id: 'adventure',
    title: 'Adventure',
    subtitle: 'Trails & Waters',
    description: 'Trails, camping, rock climbing and outdoor experiences.',
    icon: Footprints,
    href: '/experiences',
    image: ADVENTURE_IMAGES.PARASNATH_TREK,
    badge: 'Outdoor Thrills',
  },
  {
    id: 'art-crafts',
    title: 'Art & Crafts',
    subtitle: 'Handmade Traditions',
    description: 'Stories shaped by local hands — Sohrai, Khovar murals and Dokra casting.',
    icon: Palette,
    href: '/marketplace',
    image: ART_CRAFT_IMAGES.SOHRAI_MURAL,
    badge: 'GI-Tagged Arts',
  },
  {
    id: 'culture',
    title: 'Culture',
    subtitle: 'Music & Community',
    description: 'Mandar rhythms, Chhau dance, Sarna groves and indigenous harmony.',
    icon: Music2,
    href: '#culture',
    image: CULTURE_IMAGES.CHHAU_DANCE,
    badge: 'Living Heritage',
  },
  {
    id: 'wildlife',
    title: 'Wildlife',
    subtitle: 'Sanctuaries & Corridors',
    description: 'Forests, sanctuaries and wild encounters from Betla to Dalma.',
    icon: TreePine,
    href: '/explore?category=wildlife',
    image: DESTINATION_IMAGES.BETLA_NATIONAL_PARK,
    badge: 'Tiger & Elephant Corridors',
  },
  {
    id: 'heritage',
    title: 'Heritage',
    subtitle: 'Faith & Ancient Lore',
    description: 'Places shaped by history, sacred Jyotirlingas and ancient stone temples.',
    icon: Landmark,
    href: '/explore?category=heritage',
    image: DESTINATION_IMAGES.DEOGHAR_BAIDYANATH,
    badge: 'Spiritual Sanctuaries',
  },
  {
    id: 'festivals',
    title: 'Festivals',
    subtitle: 'Seasonal Celebrations',
    description: 'Celebrations that bring communities together — Sarhul, Karma and Tusu.',
    icon: Sparkles,
    href: '/events',
    image: CULTURE_IMAGES.SARNA_WORSHIP,
    badge: 'Tribal Calendar',
  },
];

export function HomeDiscoverSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">
          DISCOVER THE MANY FACES OF JHARKHAND
        </p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
          Where Every Journey Tells a Story
        </h2>
        <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
          From dramatic waterfalls and forests to living traditions, local flavours and unforgettable adventures.
        </p>
      </div>

      {/* 8 Curated Thematic Pillars */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CATEGORY_PILLARS.map((pillar) => (
          <Link
            key={pillar.id}
            to={pillar.href}
            className="group relative overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
          >
            {/* Image Aspect Container */}
            <div className="relative h-44 w-full overflow-hidden bg-ink-100">
              <img
                src={pillar.image}
                alt={pillar.title}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />

              {/* Top Badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/20">
                  {pillar.badge}
                </span>
              </div>

              {/* Corner Icon */}
              <div className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white/95 p-2 text-ink-900 shadow-md backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-400">
                <pillar.icon className="h-full w-full" />
              </div>
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col justify-between flex-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-clay-700">
                  {pillar.subtitle}
                </p>
                <h3 className="font-display text-xl font-bold text-ink-900 mt-1 flex items-center justify-between">
                  <span>{pillar.title}</span>
                  <ArrowUpRight className="h-4 w-4 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-clay-600" />
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-600">
                  {pillar.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
