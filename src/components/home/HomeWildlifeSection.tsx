import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, TreePine } from 'lucide-react';
import { Button } from '../ui';

interface WildlifeSpot {
  id: string;
  name: string;
  district: string;
  species: string;
  description: string;
  bestTime: string;
  image: string;
}

const WILDLIFE_SPOTS: WildlifeSpot[] = [
  {
    id: 'betla',
    name: 'Betla National Park',
    district: 'Latehar & Palamu',
    species: 'Tigers, Asian Elephants, Gaurs, Leopards, Hornbills',
    description: 'One of India’s earliest Project Tiger reserves, featuring dense sal and bamboo canopies interspersed with 16th-century Chero dynasty ruins.',
    bestTime: 'November to April',
    image: '/images/destinations/betla-national-park.jpg',
  },
  {
    id: 'dalma',
    name: 'Dalma Wildlife Sanctuary',
    district: 'East Singhbhum',
    species: 'Elephant herds, Barking Deer, Sloth Bears, Giant Squirrels',
    description: 'A crucial migration corridor for wild Asiatic elephants overlooking the industrial steel city of Jamshedpur from elevated cloud-kissed ridges.',
    bestTime: 'October to March',
    image: '/images/destinations/dalma-hills.jpg',
  },
  {
    id: 'udhwa',
    name: 'Udhwa Lake Bird Sanctuary',
    district: 'Sahibganj',
    species: 'Brahminy Ducks, Jacanas, Siberian migratory waterfowl',
    description: 'The state’s only dedicated bird sanctuary, comprising twin natural oxbow lakes along the Ganges River welcoming thousands of winter migratory birds.',
    bestTime: 'November to February',
    image: '/images/destinations/patratu-valley.jpg',
  },
];

export function HomeWildlifeSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-3.5 py-1 text-xs font-bold text-forest-800">
            <TreePine className="h-3.5 w-3.5" />
            <span>PROTECTED ECOSYSTEMS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
            Into the Wild: Sanctuaries of Sal &amp; Stream
          </h2>
          <p className="text-sm sm:text-base text-ink-600">
            Encounter majestic elephant corridors, tiger reserves, and serene migratory wetland habitats protected by local forest communities.
          </p>
        </div>

        <Button asChild className="shrink-0">
          <Link to="/explore?category=wildlife" className="inline-flex items-center gap-2">
            <span>EXPLORE WILD SANCTUARIES</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Grid of Wildlife Sanctuaries */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-7">
        {WILDLIFE_SPOTS.map((spot) => (
          <div
            key={spot.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/90 bg-[#FFFDF9] shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
          >
            {/* Image Header */}
            <div className="relative h-64 w-full overflow-hidden bg-ink-900">
              <img
                src={spot.image}
                alt={spot.name}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />

              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-900/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-forest-200 border border-forest-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" /> Eco-Protected
                </span>
              </div>

              <div className="absolute bottom-3 left-4 text-xs font-semibold text-white/90">
                <span>{spot.district}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-ink-900 group-hover:text-forest-700 transition-colors">
                  {spot.name}
                </h3>
                <p className="text-xs font-semibold text-clay-700">
                  Fauna: {spot.species}
                </p>
                <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                  {spot.description}
                </p>
              </div>

              <div className="pt-4 border-t border-ink-100 flex items-center justify-between text-xs">
                <span className="text-ink-500">
                  Best Season: <strong className="text-ink-800">{spot.bestTime}</strong>
                </span>
                <Link
                  to="/explore?category=wildlife"
                  className="font-bold text-forest-700 hover:text-forest-800 inline-flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
