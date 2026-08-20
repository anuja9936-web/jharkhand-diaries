import { useState } from 'react';
import { ArrowLeft, MapPin, Maximize2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GalleryPhoto {
  id: string;
  title: string;
  category: 'Nature' | 'Culture' | 'Food' | 'Adventure' | 'Wildlife' | 'People';
  district: string;
  location: string;
  image: string;
  caption: string;
}

const FULL_GALLERY: GalleryPhoto[] = [
  {
    id: 'g1',
    title: 'Sunrise over Netarhat Pine Canopy',
    category: 'Nature',
    district: 'Latehar',
    location: 'Netarhat Highlands',
    image: '/images/destinations/netarhat.jpg',
    caption: 'Golden morning light filtering through mist-wrapped pine plantations on the Queen of Chotanagpur.',
  },
  {
    id: 'g2',
    title: 'Hundru Falls 98m Subarnarekha Plunge',
    category: 'Adventure',
    district: 'Ranchi',
    location: 'Hundru Falls',
    image: '/images/destinations/hundru-falls.jpg',
    caption: 'The highest cascade in the Ranchi plateau carving through dramatic Precambrian granite beds.',
  },
  {
    id: 'g3',
    title: 'Wild Elephant Herd in Dalma Reserve',
    category: 'Wildlife',
    district: 'East Singhbhum',
    location: 'Dalma Hills',
    image: '/images/destinations/dalma-hills.jpg',
    caption: 'Majestic Asiatic elephants navigating the ancient seasonal migration corridor amidst Sal forest.',
  },
  {
    id: 'g4',
    title: 'Baidyanath Jyotirlinga Dham Saffron Assembly',
    category: 'Culture',
    district: 'Deoghar',
    location: 'Deoghar Old Town',
    image: '/images/destinations/deoghar-baidyanath.jpg',
    caption: 'Devotees and pilgrims carrying holy Ganges water during the sacred Shravani festival.',
  },
  {
    id: 'g5',
    title: 'Patratu Valley Serpentine Road Panoramas',
    category: 'Nature',
    district: 'Ramgarh',
    location: 'Patratu Ghat',
    image: '/images/destinations/patratu-valley.jpg',
    caption: 'Hairpin turns descending into the emerald reservoir basin framed by lush Chotanagpur hill ranges.',
  },
  {
    id: 'g6',
    title: 'Dassam Falls Monsoon Amphitheatre',
    category: 'Adventure',
    district: 'Ranchi',
    location: 'Kanchi River Basin',
    image: '/images/destinations/dassam-falls.jpg',
    caption: 'Roaring white waters of the Kanchi river creating natural mist rainbows over the gorge.',
  },
  {
    id: 'g7',
    title: 'Palamu Tiger Reserve Sal Canopy',
    category: 'Wildlife',
    district: 'Latehar',
    location: 'Betla National Park',
    image: '/images/destinations/betla-national-park.jpg',
    caption: 'Historic 16th-century Chero dynasty fort ruins nestled inside the dense, biodiverse core forest.',
  },
  {
    id: 'g8',
    title: '17th-Century Jagannath Hilltop Sanctuary',
    category: 'Culture',
    district: 'Ranchi',
    location: 'Jagannathpur Hill',
    image: '/images/destinations/jagannath-temple.jpg',
    caption: 'Historical hilltop architectural landmark established in 1691 offering sweeping city views.',
  },
  {
    id: 'g9',
    title: 'Maa Chhinnamasta River Confluence Gorge',
    category: 'Culture',
    district: 'Ramgarh',
    location: 'Rajrappa Confluence',
    image: '/images/destinations/rajrappa.jpg',
    caption: 'Sacred meeting point of Bhera and Damodar rivers cutting through ancient rocky plateaus.',
  },
  {
    id: 'g10',
    title: 'Gautamdhara Stepped Rock Terraces',
    category: 'Nature',
    district: 'Ranchi',
    location: 'Jonha Falls',
    image: '/images/destinations/jonha-falls.jpg',
    caption: 'Peaceful tiered waters flowing down over 700 rock-carved steps surrounded by holy groves.',
  },
];

const CATEGORIES = ['All', 'Nature', 'Culture', 'Food', 'Adventure', 'Wildlife', 'People'] as const;

export function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const filteredPhotos =
    activeCategory === 'All'
      ? FULL_GALLERY
      : FULL_GALLERY.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-ink-950 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-400">
              JHARKHAND THROUGH THE LENS
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Photo &amp; Visual Gallery
            </h1>
            <p className="text-sm sm:text-base text-sand/80">
              An immersive photographic expedition across the ancient forests, roaring cascades, living tribal heritage, and wildlife sanctuaries of Jharkhand.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={[
                  'rounded-full px-4 py-2 text-xs font-bold transition-all focus:outline-none',
                  activeCategory === cat
                    ? 'bg-amber-400 text-ink-950 shadow-md scale-105'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10',
                ].join(' ')}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:shadow-2xl"
            >
              <div className="relative h-72 w-full overflow-hidden bg-ink-900">
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Top Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-300 border border-white/15">
                    {photo.category}
                  </span>
                </div>

                {/* Corner Zoom Icon */}
                <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/40 p-2 text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md hover:bg-white hover:text-ink-900">
                  <Maximize2 className="h-full w-full" />
                </div>

                {/* Bottom Caption Overlay */}
                <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{photo.location} ({photo.district})</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-amber-200 transition-colors leading-snug">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-sand/70 line-clamp-2">{photo.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-ink-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white transition hover:bg-white hover:text-ink-900 focus:outline-none"
              aria-label="Close photo lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative max-h-[70vh] w-full overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-ink-950 text-white space-y-2">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-ink-950">
                  {selectedPhoto.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-sand/80">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  {selectedPhoto.location} • {selectedPhoto.district} District
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white">{selectedPhoto.title}</h2>
              <p className="text-sm text-sand/80 leading-relaxed">{selectedPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
