import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '../ui';

interface BlogSummary {
  id: string;
  title: string;
  category: string;
  readTime: string;
  author: string;
  date: string;
  excerpt: string;
  image: string;
}

interface EventSummary {
  id: string;
  title: string;
  dates: string;
  location: string;
  tag: string;
  description: string;
}

const BLOGS: BlogSummary[] = [
  {
    id: 'b1',
    title: 'Chasing the Roaring Waterfalls of the Chotanagpur Plateau',
    category: 'Nature & Trails',
    readTime: '5 min read',
    author: 'Jharkhand Travel Collective',
    date: 'Monsoon Explorer',
    excerpt: 'From the 98-metre Hundru plunge to the sacred stepped pools of Jonha, discover the geological wonders of ancient granite rivers.',
    image: '/images/destinations/hundru-falls.jpg',
  },
  {
    id: 'b2',
    title: 'The Living Canvas: How Tribal Women Keep Sohrai Murals Alive',
    category: 'Art & Heritage',
    readTime: '7 min read',
    author: 'Cultural Heritage Desk',
    date: 'Harvest Traditions',
    excerpt: 'An intimate journey through Hazaribagh mud villages where natural ochre, white clay, and mangrove pigments narrate centuries of animal reverence.',
    image: '/images/destinations/rajrappa.jpg',
  },
  {
    id: 'b3',
    title: 'A Weekend in Netarhat: Pine Woods, Chalets and Cloud Vistas',
    category: 'Weekend Escapes',
    readTime: '4 min read',
    author: 'Mountain Guides Guild',
    date: 'Autumn Guides',
    excerpt: 'Escape into the cool, tranquil highlands of Latehar with panoramic sunrise decks, colonial heritage chalets, and organic village honey.',
    image: '/images/destinations/netarhat.jpg',
  },
];

const EVENTS: EventSummary[] = [
  {
    id: 'ev1',
    title: 'State Sarhul Mahotsav',
    dates: 'March - April (Spring)',
    location: 'Ranchi, Gumla & Khunti',
    tag: 'Statewide Holiday',
    description: 'The grand spring worship of blooming Sal blossoms with traditional procession, Mandar drums, and community feast.',
  },
  {
    id: 'ev2',
    title: 'Historic Shravani Mela Pilgrimage',
    dates: 'July - August (Shravan Month)',
    location: 'Deoghar Baidyanath Dham',
    tag: 'Spiritual Concourse',
    description: 'Millions of Kanwariyas undertake the sacred 105 km walking pilgrimage from Sultanganj to offer holy Ganga water at the Jyotirlinga.',
  },
];

export function HomeStoriesEventsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      {/* 1. Stories / Blogs Section */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sand px-3.5 py-1 text-xs font-bold text-ink-900 border border-ink-200">
              <BookOpen className="h-3.5 w-3.5 text-clay-700" />
              <span>TRAVEL JOURNAL &amp; LORE</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
              Stories from Jharkhand
            </h2>
            <p className="text-sm sm:text-base text-ink-600">
              Editorial essays, road trip itineraries, and cultural chronicles penned by local explorers and historians.
            </p>
          </div>

          <Button asChild className="shrink-0">
            <Link to="/blogs" className="inline-flex items-center gap-2">
              <span>READ ALL STORIES</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Blogs Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-7">
          {BLOGS.map((blog) => (
            <article
              key={blog.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-ink-100">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-amber-300 border border-white/20">
                      {blog.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
                    <span>{blog.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {blog.readTime}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-ink-900 group-hover:text-clay-700 transition-colors leading-snug">
                    <Link to="/blogs">{blog.title}</Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed line-clamp-3">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-ink-50 flex items-center justify-between text-xs">
                <span className="text-ink-400 font-medium">{blog.author}</span>
                <Link
                  to="/blogs"
                  className="font-bold text-clay-700 hover:text-clay-900 inline-flex items-center gap-1"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 2. Events / Festival Highlights */}
      <div className="rounded-3xl bg-sand/40 border border-ink-200/80 p-8 sm:p-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">
              CULTURAL CALENDAR
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
              What's Happening in Jharkhand
            </h3>
          </div>
          <Button variant="secondary" asChild className="shrink-0">
            <Link to="/events" className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>FULL EVENT SCHEDULE</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EVENTS.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl bg-white p-6 border border-ink-200 shadow-xs space-y-3 hover:border-clay-400 transition"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-clay-100 px-3 py-0.5 text-xs font-bold text-clay-800">
                  {ev.tag}
                </span>
                <span className="text-xs font-semibold text-ink-500">{ev.dates}</span>
              </div>
              <h4 className="font-display text-xl font-bold text-ink-900">{ev.title}</h4>
              <p className="text-xs text-ink-600 leading-relaxed">{ev.description}</p>
              <p className="text-[11px] font-semibold text-clay-700 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {ev.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
