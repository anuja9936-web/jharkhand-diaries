import { Link } from 'react-router-dom';
import { ArrowRight, Palette, Store, Award } from 'lucide-react';
import { Button } from '../ui';

interface CraftItem {
  id: string;
  name: string;
  tagline: string;
  giTag?: boolean;
  community: string;
  description: string;
  materials: string;
  image: string;
}

const CRAFTS: CraftItem[] = [
  {
    id: 'sohrai',
    name: 'Sohrai Wall Murals',
    tagline: 'Celebration of fertility, nature & cattle',
    giTag: true,
    community: 'Kurmi, Santhal, Oraon, Munda artisans (Hazaribagh)',
    description: 'Ancient ceremonial painting drawn with chewed twigs and rags using four natural earthen clay pigments — white (Charak matti), red (Geru), yellow (Nagri), and black (Manghi).',
    materials: 'Natural Earthen Earth Pigments, Mud Walls',
    image: '/images/destinations/rajrappa.jpg',
  },
  {
    id: 'khovar',
    name: 'Khovar Bridal Art',
    tagline: 'Sacred wedding chamber comb-art',
    giTag: true,
    community: 'Birhor, Prajapati & tribal women of Hazaribagh',
    description: 'Intricate sgraffito art created by applying a base coat of black manganese earth, overlaying it with creamy white kaolin clay, and scraping patterns using broken combs or fingertips.',
    materials: 'Black Clay, Kaolin White Clay, Bamboo Combs',
    image: '/images/destinations/netarhat.jpg',
  },
  {
    id: 'dokra',
    name: 'Dokra Brass Metal Casting',
    tagline: '4,000-year-old lost-wax bell metal art',
    giTag: false,
    community: 'Malhar & Dhokra brassmiths (Dumka, Hazaribagh)',
    description: 'An ancient non-ferrous lost-wax casting technique crafting exquisite figurative sculptures of deities, tribal musicians, elephants, and jewellery with rustic timeless charm.',
    materials: 'Beeswax, Clay Core, Recycled Brass & Bell Metal',
    image: '/images/destinations/deoghar-baidyanath.jpg',
  },
  {
    id: 'bamboo-craft',
    name: 'Bamboo & Forest Woodcraft',
    tagline: 'Sustainable utilitarian art',
    giTag: false,
    community: 'Mahli tribe & forest woodcrafters',
    description: 'Hand-woven multipurpose baskets, grain sieves, fishing traps, and decorative lanterns fashioned skillfully from indigenous forest bamboo species.',
    materials: 'Wild Plateau Bamboo, Natural Forest Dyes',
    image: '/images/destinations/betla-national-park.jpg',
  },
  {
    id: 'tussar-silk',
    name: 'Kuchai Tussar Silk',
    tagline: 'Organic wild golden cocoons',
    giTag: true,
    community: 'Seraikela Kharsawan indigenous sericulturists',
    description: 'Ethically harvested wild silk spun from cocoons nurtured on local Sal and Asan forest canopies, celebrated globally for its natural rich golden sheen and breathable texture.',
    materials: 'Wild Forest Tussar Cocoons, Handlooms',
    image: '/images/destinations/patratu-valley.jpg',
  },
  {
    id: 'tribal-jewellery',
    name: 'Hasli & Tarpat Tribal Silver',
    tagline: 'Heritage body ornaments',
    giTag: false,
    community: 'Santhal & Ho silversmiths',
    description: 'Sturdy, geometric neck collars (Hasli), ear ornaments (Tarpat), and anklets inspired by sacred sacred geometry and nature motifs.',
    materials: 'Silver, White Metal, Cotton Thread',
    image: '/images/destinations/hundru-falls.jpg',
  },
];

export function HomeArtCraftsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-ink-900">
            <Palette className="h-3.5 w-3.5 text-clay-700" />
            <span>INDIGENOUS CRAFTSMANSHIP</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
            Stories Made by Hand
          </h2>
          <p className="text-sm sm:text-base text-ink-600">
            Celebrate GI-tagged wall murals, ancient lost-wax metal castings, and hand-woven wild tussar silk directly from master artisans.
          </p>
        </div>

        <Button asChild className="shrink-0">
          <Link to="/marketplace" className="inline-flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>EXPLORE ARTISAN MARKETPLACE</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Grid of Crafts */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {CRAFTS.map((craft) => (
          <article
            key={craft.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/90 bg-[#FFFDF9] p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400 hover:shadow-xl"
          >
            <div className="space-y-3">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                {craft.giTag ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 border border-amber-300">
                    <Award className="h-3 w-3 text-amber-700" /> GI Tagged Heritage
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-bold text-ink-700">
                    Living Craft
                  </span>
                )}
                <span className="text-[11px] font-semibold text-ink-500 truncate max-w-[150px]">
                  {craft.community.split('(')[0]}
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="font-display text-2xl font-bold text-ink-900 group-hover:text-clay-700 transition-colors">
                  {craft.name}
                </h3>
                <p className="text-xs font-medium text-clay-700 italic mt-0.5">
                  "{craft.tagline}"
                </p>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                {craft.description}
              </p>
            </div>

            {/* Footer Information */}
            <div className="mt-6 pt-4 border-t border-ink-100 space-y-2 text-xs">
              <div className="flex justify-between items-center text-ink-500">
                <span className="font-semibold text-ink-700">Materials:</span>
                <span className="text-right truncate ml-2">{craft.materials}</span>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Link
                  to="/marketplace"
                  className="font-bold text-clay-700 hover:text-clay-900 inline-flex items-center gap-1 group/link text-xs"
                >
                  <span>Discover Artisans &amp; Workshops</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
