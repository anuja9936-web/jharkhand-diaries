import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Compass, MapPin, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface HeroSlide {
  name: string;
  district: string;
  image: string;
  tagline: string;
  category: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    name: 'Patratu Valley',
    district: 'Ramgarh',
    image: '/images/destinations/patratu-valley.jpg',
    tagline: 'Serpentine hillside roads & emerald reservoir panoramas',
    category: 'Scenic Valley',
  },
  {
    name: 'Dassam Falls',
    district: 'Ranchi',
    image: '/images/destinations/dassam-falls.jpg',
    tagline: 'Cascading natural splendour of the Kanchi River',
    category: 'Waterfall',
  },
  {
    name: 'Netarhat',
    district: 'Latehar',
    image: '/images/destinations/netarhat.jpg',
    tagline: 'Queen of Chotanagpur, misty pine hills & sunrises',
    category: 'Hill Station',
  },
  {
    name: 'Hundru Falls',
    district: 'Ranchi',
    image: '/images/destinations/hundru-falls.jpg',
    tagline: 'Majestic 98-metre plunge over Subarnarekha rock formations',
    category: 'Waterfall',
  },
  {
    name: 'Betla National Park',
    district: 'Latehar',
    image: '/images/destinations/betla-national-park.jpg',
    tagline: 'Primeval sal forests, wildlife sanctuaries & ancient forts',
    category: 'Wildlife & Forest',
  },
  {
    name: 'Baidyanath Dham',
    district: 'Deoghar',
    image: '/images/destinations/deoghar-baidyanath.jpg',
    tagline: 'Sacred Jyotirlinga shrine of timeless spiritual devotion',
    category: 'Sacred Heritage',
  },
  {
    name: 'Dalma Hills',
    district: 'East Singhbhum',
    image: '/images/destinations/dalma-hills.jpg',
    tagline: 'Misty elephant sanctuary & elevated trekking trails',
    category: 'Sanctuary',
  },
  {
    name: 'Jonha Falls',
    district: 'Ranchi',
    image: '/images/destinations/jonha-falls.jpg',
    tagline: 'Gautamdhara stepped waterfall amidst tranquil sacred woods',
    category: 'Waterfall',
  },
];

export function HeroCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Autoplay carousel transition
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden bg-ink-950 flex flex-col justify-between pt-16 sm:pt-20">
      {/* Background Image Carousel with Smooth Fade & Ken Burns zoom */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.name}
            className={[
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              idx === currentIndex ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          >
            <img
              src={slide.image}
              alt={slide.name}
              className={[
                'h-full w-full object-cover object-center transform transition-transform duration-[6000ms] ease-out',
                idx === currentIndex ? 'scale-105' : 'scale-100',
              ].join(' ')}
            />
          </div>
        ))}

        {/* Sophisticated Dark Gradient Overlays for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-transparent to-ink-950/80" />
      </div>

      {/* Spacer */}
      <div className="h-6 sm:h-10" />

      {/* Center Editorial Hero Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 py-8 text-center sm:px-6 lg:px-8">
        {/* Subtle Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 backdrop-blur-md mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">
            DISCOVER JHARKHAND
          </span>
        </div>

        {/* Main Cinematic Heading */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)] max-w-4xl leading-[1.1]">
          WHERE NATURE, CULTURE &amp; ADVENTURE COME ALIVE
        </h1>

        {/* Supporting Copy */}
        <p className="mt-5 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-sand/90 font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          Explore waterfalls, forests, heritage, cuisine, tribal art and unforgettable experiences across Jharkhand.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
          <Link
            to="/explore"
            className="group inline-flex items-center gap-2.5 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-bold text-ink-950 shadow-2xl transition-all duration-300 hover:bg-amber-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <Compass className="h-4 w-4 text-ink-900 transition-transform group-hover:rotate-45 duration-300" />
            <span>Explore Jharkhand</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 duration-200" />
          </Link>

          <a
            href="#trip-planner"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-white/50 active:scale-95 focus:outline-none"
          >
            <span>Plan Your Journey</span>
          </a>
        </div>

        {/* Premium Search Bar Interface */}
        <div className="mt-8 sm:mt-10 w-full max-w-2xl">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center rounded-2xl border border-white/20 bg-black/40 p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all focus-within:border-amber-400/60 focus-within:ring-2 focus-within:ring-amber-400/20"
          >
            <Search className="ml-3.5 h-5 w-5 text-amber-300/80 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, experiences, cuisine, tribal art..."
              className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/60 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-4 py-2 text-xs font-bold text-ink-950 transition hover:bg-white hover:scale-[1.02] active:scale-95"
            >
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar: Slide Info & Manual Controls */}
      <div className="relative z-10 w-full px-4 pb-6 pt-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Active Destination Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/50 px-4 py-1.5 text-xs text-white/90 shadow-lg backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold text-white">{currentSlide.name}</span>
            <span className="text-white/40">•</span>
            <span className="text-white/70">{currentSlide.district}</span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:inline text-amber-300/80 text-[11px] font-medium">{currentSlide.tagline}</span>
          </div>

          {/* Carousel Slide Indicators & Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/40 text-white/90 transition hover:bg-white/30 hover:text-white focus:outline-none"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Slide Dots */}
            <div className="flex items-center gap-1.5 px-2">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.name}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={[
                    'h-1.5 rounded-full transition-all duration-300 focus:outline-none',
                    idx === currentIndex
                      ? 'w-7 bg-amber-400 shadow-sm'
                      : 'w-2 bg-white/40 hover:bg-white/70',
                  ].join(' ')}
                  aria-label={`Jump to ${slide.name}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/40 text-white/90 transition hover:bg-white/30 hover:text-white focus:outline-none"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
