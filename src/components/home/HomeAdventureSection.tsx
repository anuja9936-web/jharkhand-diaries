import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Footprints,
  Mountain,
  Navigation,
  Tent,
  Waves,
} from 'lucide-react';
import { Button } from '../ui';

interface AdventureActivity {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  location: string;
  description: string;
  icon: typeof Mountain;
  image: string;
}

const ADVENTURES: AdventureActivity[] = [
  {
    id: 'a1',
    title: 'Parasnath Peak & Shikharji Trek',
    category: 'Mountain Trekking',
    difficulty: 'Challenging',
    location: 'Giridih District (1,365m Peak)',
    description: 'Trek to the highest point in Jharkhand through dense sal forests and sacred mountain ridges.',
    icon: Mountain,
    image: '/images/destinations/patratu-valley.jpg',
  },
  {
    id: 'a2',
    title: 'Stargazing & Camping by Patratu Lake',
    category: 'Wild Camping',
    difficulty: 'Easy',
    location: 'Patratu Reservoir, Ramgarh',
    description: 'Camp on the peaceful shores surrounded by mist-capped hills and luminous star-filled night skies.',
    icon: Tent,
    image: '/images/destinations/patratu-valley.jpg',
  },
  {
    id: 'a3',
    title: 'Subarnarekha Gorge & Waterfall Hiking',
    category: 'Gorge Hiking',
    difficulty: 'Moderate',
    location: 'Hundru & Dassam Falls, Ranchi',
    description: 'Scramble ancient granite rock beds carved by roaring cascades over millions of years.',
    icon: Waves,
    image: '/images/destinations/hundru-falls.jpg',
  },
  {
    id: 'a4',
    title: 'Dalma Ridge Elephant Corridor Trail',
    category: 'Forest Trekking',
    difficulty: 'Moderate',
    location: 'Dalma Hills, Jamshedpur',
    description: 'Ascend misty woodland trails with panoramic vistas over the Subarnarekha river basin.',
    icon: Footprints,
    image: '/images/destinations/dalma-hills.jpg',
  },
  {
    id: 'a5',
    title: 'Serpentine Ghat Cycling Expedition',
    category: 'Bikepacking',
    difficulty: 'Moderate',
    location: 'Netarhat & Ramgarh Valleys',
    description: 'Ride through pine forest hairpin bends with cool plateau elevation and breathtaking sunset views.',
    icon: Navigation,
    image: '/images/destinations/netarhat.jpg',
  },
  {
    id: 'a6',
    title: 'Palamu Tiger Reserve Deep Safari',
    category: 'Wildlife Safari',
    difficulty: 'Easy',
    location: 'Betla National Park',
    description: 'Open-top 4x4 forest tracking through primeval elephant, gaur, and leopard habitats.',
    icon: Compass,
    image: '/images/destinations/betla-national-park.jpg',
  },
];

export function HomeAdventureSection() {
  return (
    <section className="py-20 bg-ink-950 text-white relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-clay-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-forest-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-clay-500/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
              <Mountain className="h-3.5 w-3.5" />
              <span>OUTDOOR THRILLS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Adventure Awaits in the Wild Heartland
            </h2>
            <p className="text-sm sm:text-base text-sand/80">
              From highest plateau peaks and wild canyon descents to peaceful lake camping under the stars.
            </p>
          </div>

          <Button variant="secondary" asChild className="shrink-0">
            <Link to="/experiences" className="inline-flex items-center gap-2">
              <span>EXPLORE ALL EXPERIENCES</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Adventure Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ADVENTURES.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-2xl"
            >
              <div className="space-y-4">
                {/* Top Badge & Difficulty */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-amber-300 border border-white/10">
                    <item.icon className="h-3.5 w-3.5" />
                    <span>{item.category}</span>
                  </span>

                  <span
                    className={[
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      item.difficulty === 'Easy'
                        ? 'bg-forest-500/20 text-forest-300 border border-forest-500/30'
                        : item.difficulty === 'Moderate'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-clay-500/20 text-clay-300 border border-clay-500/30',
                    ].join(' ')}
                  >
                    {item.difficulty}
                  </span>
                </div>

                {/* Title & Location */}
                <div>
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-medium text-amber-200/80 mt-1">
                    {item.location}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-sand/80 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Card Action Link */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-sand/60">Guided &amp; Self-paced</span>
                <Link
                  to="/experiences"
                  className="font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 group/btn"
                >
                  <span>Book / Learn More</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
