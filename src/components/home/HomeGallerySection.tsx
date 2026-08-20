import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Maximize2, MapPin, X } from 'lucide-react';
import { Button } from '../ui';

interface GalleryItem {
  id: string;
  title: string;
  category: 'Nature' | 'Culture' | 'Food' | 'Adventure' | 'Wildlife' | 'People';
  location: string;
  image: string;
  caption: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Sunrise over Netarhat Pine Forest',
    category: 'Nature',
    location: 'Latehar, Jharkhand',
    image: '/images/destinations/netarhat.jpg',
    caption: 'Misty golden light breaking through the towering pine groves at dawn.',
  },
  {
    id: 'g2',
    title: 'Hundru Falls Subarnarekha Cascade',
    category: 'Adventure',
    location: 'Ranchi, Jharkhand',
    image: '/images/destinations/hundru-falls.jpg',
    caption: 'The majestic 98m waterfall carving dramatic paths across ancient Precambrian rocks.',
  },
  {
    id: 'g3',
    title: 'Elephant Herd in Dalma Wildlife Sanctuary',
    category: 'Wildlife',
    location: 'East Singhbhum, Jharkhand',
    image: '/images/destinations/dalma-hills.jpg',
    caption: 'Gentle giants traversing the sal tree canopy of the Dalma wildlife corridor.',
  },
  {
    id: 'g4',
    title: 'Baidyanath Dham Shravani Gathering',
    category: 'Culture',
    location: 'Deoghar, Jharkhand',
    image: '/images/destinations/deoghar-baidyanath.jpg',
    caption: 'Millions of saffron-clad pilgrims offering sacred Ganges water in devotion.',
  },
  {
    id: 'g5',
    title: 'Patratu Valley Hairpin Vistas',
    category: 'Nature',
    location: 'Ramgarh, Jharkhand',
    image: '/images/destinations/patratu-valley.jpg',
    caption: 'The serpentine hill road overlooking the expansive emerald reservoir.',
  },
  {
    id: 'g6',
    title: 'Dassam Falls Cascades in Full Monsoon Flow',
    category: 'Adventure',
    location: 'Ranchi, Jharkhand',
    image: '/images/destinations/dassam-falls.jpg',
    caption: 'Roaring spray forming a natural amphitheatre in the Chotanagpur wilderness.',
  },
];

const CATEGORIES = ['All', 'Nature', 'Culture', 'Food', 'Adventure', 'Wildlife', 'People'] as const;

export function HomeGallerySection() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const filteredItems =
    activeCategory === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section className="py-20 bg-ink-950 text-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-forest-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-400">
              JHARKHAND THROUGH THE LENS
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Visual Chronicles of the Land
            </h2>
            <p className="text-sm sm:text-base text-sand/80 max-w-xl">
              An editorial gallery celebrating natural wonders, tribal communities, forest wildlife, and cultural ceremonies.
            </p>
          </div>

          <Button variant="secondary" asChild className="shrink-0">
            <Link to="/gallery" className="inline-flex items-center gap-2">
              <span>View Full Gallery</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Category Chips */}
        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={[
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none',
                activeCategory === category
                  ? 'bg-amber-400 text-ink-950 shadow-md scale-105'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10',
              ].join(' ')}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Masonry / Dynamic Editorial Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className={[
                'group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-2xl',
                idx === 0 ? 'sm:col-span-2 lg:col-span-2' : '',
              ].join(' ')}
            >
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-ink-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-white/20">
                    {item.category}
                  </span>
                </div>

                {/* Zoom Icon Button */}
                <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/40 p-2 text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md hover:bg-white hover:text-ink-900">
                  <Maximize2 className="h-full w-full" />
                </div>

                {/* Bottom Caption Overlay */}
                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-sand/80 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    <span>{item.location}</span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-sand/70 line-clamp-2">{item.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-ink-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white transition hover:bg-white hover:text-ink-900 focus:outline-none"
              aria-label="Close photo preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative max-h-[65vh] w-full overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-ink-950 text-white space-y-2">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-ink-950">
                  {selectedPhoto.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-sand/80">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  {selectedPhoto.location}
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white">{selectedPhoto.title}</h3>
              <p className="text-sm text-sand/80 leading-relaxed">{selectedPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
