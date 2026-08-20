import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Compass, MapPin, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DESTINATION_IMAGES } from '../../constants/contentImages';

interface HeroSlide {
  name: string;
  district: string;
  image: string;
  themeTitle: string;
  tagline: string;
  category: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    name: 'Dassam Falls',
    district: 'Ranchi',
    image: DESTINATION_IMAGES.DASSAM_FALLS,
    themeTitle: "Discover Jharkhand's Roaring Waterfalls",
    tagline: 'Cascading natural splendour of the Kanchi River',
    category: 'Waterfalls & Cascades',
  },
  {
    name: 'Patratu Valley',
    district: 'Ramgarh',
    image: DESTINATION_IMAGES.PATRATU_VALLEY,
    themeTitle: 'Where Serpentine Hills Meet the Horizon',
    tagline: 'Winding scenic roads & emerald reservoir vistas',
    category: 'Scenic Valley',
  },
  {
    name: 'Netarhat',
    district: 'Latehar',
    image: DESTINATION_IMAGES.NETARHAT,
    themeTitle: 'Misty Pine Hills & Golden Sunrise Decks',
    tagline: 'The Queen of Chotanagpur plateau breezes',
    category: 'Hill Station',
  },
  {
    name: 'Betla National Park',
    district: 'Latehar',
    image: DESTINATION_IMAGES.BETLA_NATIONAL_PARK,
    themeTitle: 'Into the Wild: Primeval Sal Forests',
    tagline: 'Tiger reserve corridors and ancient 16th-century Chero forts',
    category: 'Wildlife & Sanctuaries',
  },
  {
    name: 'Baidyanath Dham',
    district: 'Deoghar',
    image: DESTINATION_IMAGES.DEOGHAR_BAIDYANATH,
    themeTitle: 'Living Spiritual Heritage & Sacred Shrines',
    tagline: 'Sacred Jyotirlinga sanctuary of timeless devotion',
    category: 'Sacred Heritage',
  },
  {
    name: 'Hundru Falls',
    district: 'Ranchi',
    image: DESTINATION_IMAGES.HUNDRU_FALLS,
    themeTitle: 'Dramatic 98-Metre Natural Canyon Plunge',
    tagline: 'Subarnarekha River carving ancient Precambrian rocks',
    category: 'Geological Wonders',
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
    }, 5000);

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
    <section className="relative min-h-[94vh] w-full overflow-hidden bg-ink-950 flex flex-col justify-between pt-16 sm:pt-20">
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
                'h-full w-full object-cover object-center transform transition-transform duration-[6500ms] ease-out',
                idx === currentIndex ? 'scale-105' : 'scale-100',
              ].join(' ')}
            />
          </div>
        ))}

        {/* Localized text-area gradient ONLY — image stays bright everywhere else */}
        {/* Bottom band: helps lower badge/controls readability */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/55 via-black/20 to-transparent pointer-events-none" />
        {/* Left edge: subtle gradient for center text block on darker compositions */}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Spacer */}
      <div className="h-6 sm:h-10" />

      {/* Center Editorial Hero Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 py-8 text-center sm:px-6 lg:px-8">
        {/* Subtle Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/60 px-4 py-1.5 backdrop-blur-md mb-5 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">
            DISCOVER JHARKHAND
          </span>
        </div>

        {/* Dynamic Theme Heading */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] max-w-4xl leading-[1.1]">
          {currentSlide.themeTitle}
        </h1>

        {/* Supporting Copy */}
        <p className="mt-5 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-sand/90 font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
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
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/50 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-white/50 active:scale-95 focus:outline-none"
          >
            <span>Plan Your Journey</span>
          </a>
        </div>

        {/* Premium Search Bar Interface */}
        <div className="mt-8 sm:mt-10 w-full max-w-2xl">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center rounded-2xl border border-white/25 bg-black/50 p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all focus-within:border-amber-400/70 focus-within:ring-2 focus-within:ring-amber-400/30"
          >
            <Search className="ml-3.5 h-5 w-5 text-amber-300 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, experiences, cuisine, tribal art..."
              className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-sand/70 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-ink-950 transition hover:bg-amber-300 hover:scale-[1.02] active:scale-95"
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
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/60 px-4 py-1.5 text-xs text-white shadow-lg backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold text-white">{currentSlide.name}</span>
            <span className="text-white/40">•</span>
            <span className="text-sand/80">{currentSlide.district} District</span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:inline text-amber-300 text-[11px] font-semibold">{currentSlide.category}</span>
          </div>

          {/* Carousel Slide Indicators & Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/50 text-white transition hover:bg-white/30 hover:text-white focus:outline-none"
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
              className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/50 text-white transition hover:bg-white/30 hover:text-white focus:outline-none"
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
