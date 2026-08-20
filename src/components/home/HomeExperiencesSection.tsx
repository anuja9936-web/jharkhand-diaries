import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
import { Button } from '../ui';

interface Experience {
  id: string;
  title: string;
  category: string;
  host: string;
  duration: string;
  location: string;
  price: string;
  description: string;
  image: string;
}

const EXPERIENCES: Experience[] = [
  {
    id: 'e1',
    title: 'Sohrai & Khovar Master Painting Workshop',
    category: 'Art & Craft',
    host: 'Padmashree Awardee Master Artisans',
    duration: '3.5 Hours',
    location: 'Hazaribagh Heritage Village',
    price: '₹750 / person',
    description: 'Learn ancient comb-cutting and natural clay pigment techniques on handmade earthenware tiles to take home.',
    image: '/images/destinations/rajrappa.jpg',
  },
  {
    id: 'e2',
    title: 'Sunrise Forest Walk & Stargazing Camp',
    category: 'Nature & Adventure',
    host: 'Latehar Eco-Guides Collective',
    duration: 'Overnight (2 Days)',
    location: 'Netarhat Pine Ridge',
    price: '₹2,400 / person',
    description: 'Guided dawn trek through dew-drenched pine woods, campfire tribal storytelling, and dark-sky astronomy.',
    image: '/images/destinations/netarhat.jpg',
  },
  {
    id: 'e3',
    title: 'Patratu Reservoir Kayaking & Sunset Sail',
    category: 'Water Adventure',
    host: 'Certified Water Sports Instructors',
    duration: '2 Hours',
    location: 'Patratu Valley Dam',
    price: '₹950 / person',
    description: 'Paddle through crystal emerald waters surrounded by rolling hills as the sun sets over the reservoir.',
    image: '/images/destinations/patratu-valley.jpg',
  },
  {
    id: 'e4',
    title: 'Tribal Earthen Gastronomy & Foraging Tour',
    category: 'Culinary Heritage',
    host: 'Santhal Village Homestay Hosts',
    duration: '4 Hours',
    location: 'Saranda Forest Fringe',
    price: '₹1,100 / person',
    description: 'Forage wild forest herbs, pound organic rice flour on traditional Dheki, and cook Dhuska over wood fire.',
    image: '/images/destinations/dassam-falls.jpg',
  },
];

export function HomeExperiencesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-clay-100 px-3.5 py-1 text-xs font-bold text-clay-800">
            <Sparkles className="h-3.5 w-3.5" />
            <span>IMMERSIVE DISCOVERY</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
            Experiences That Connect You to Jharkhand
          </h2>
          <p className="text-sm sm:text-base text-ink-600">
            Join hands-on tribal craft workshops, guided biodiversity treks, and earthen cooking classes led by local community masters.
          </p>
        </div>

        <Button asChild className="shrink-0">
          <Link to="/experiences" className="inline-flex items-center gap-2">
            <span>VIEW ALL EXPERIENCES</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Grid of Experiences */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {EXPERIENCES.map((exp) => (
          <article
            key={exp.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
          >
            <div>
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden bg-ink-100">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-white/20">
                    {exp.category}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-white/90 font-medium">
                  <MapPin className="h-3 w-3 text-amber-400" />
                  <span>{exp.location}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-ink-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {exp.duration}
                  </span>
                  <span className="text-clay-700 font-bold">{exp.price}</span>
                </div>

                <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-clay-700 transition-colors leading-snug">
                  {exp.title}
                </h3>

                <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed">
                  {exp.description}
                </p>

                <p className="text-[11px] font-medium text-ink-400">
                  Host: <span className="text-ink-700">{exp.host}</span>
                </p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-5 pt-0 border-t border-ink-50 mt-2">
              <Link
                to="/experiences"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink-50 py-2 text-xs font-bold text-ink-900 hover:bg-clay-600 hover:text-white transition-all duration-200"
              >
                <span>Book Experience</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
