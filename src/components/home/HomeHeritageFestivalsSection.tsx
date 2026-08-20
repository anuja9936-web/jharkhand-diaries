import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Landmark, MapPin, Sparkles } from 'lucide-react';
import { Button } from '../ui';

interface HeritageSpot {
  id: string;
  name: string;
  location: string;
  century: string;
  description: string;
  image: string;
}

interface FestivalItem {
  id: string;
  name: string;
  season: string;
  significance: string;
  rituals: string;
}

const HERITAGE_SPOTS: HeritageSpot[] = [
  {
    id: 'baidyanath',
    name: 'Baidyanath Jyotirlinga Dham',
    location: 'Deoghar',
    century: 'Ancient Vedic Heritage',
    description: 'One of the twelve sacred Jyotirlingas of Lord Shiva and a Shakti Peetha, revered for the sacred Kamana Linga.',
    image: '/images/destinations/deoghar-baidyanath.jpg',
  },
  {
    id: 'rajrappa',
    name: 'Maa Chhinnamasta Temple',
    location: 'Rajrappa, Ramgarh',
    century: 'Tantric Shrine at Confluence',
    description: 'Ancient Shakti Peetha perched at the dramatic confluence of the Bhera and Damodar rivers.',
    image: '/images/destinations/rajrappa.jpg',
  },
  {
    id: 'jagannath',
    name: '17th-Century Jagannath Temple',
    location: 'Ranchi',
    century: 'Built in 1691 AD',
    description: 'Hilltop stone sanctuary erected by King Barkagarh Jagannathpur, offering expansive plateau views and the annual Rath Yatra.',
    image: '/images/destinations/jagannath-temple.jpg',
  },
];

const FESTIVALS: FestivalItem[] = [
  {
    id: 'sarhul',
    name: 'Sarhul Festival',
    season: 'Spring (Chaitra Month / March-April)',
    significance: 'Celebration of blossoming Sal tree flowers (Sarjom Baha) and marriage of Mother Earth with the Sun.',
    rituals: 'Pahan (priest) offers Sal blossoms at the sacred Sarna grove; community dances to traditional Mandar drums.',
  },
  {
    id: 'karma',
    name: 'Karma Festival',
    season: 'Autumn (Bhadrapada Month / August-September)',
    significance: 'Worship of the sacred Karam tree branch symbolizing fertility, fraternal bond, and agricultural abundance.',
    rituals: 'Young men and women plant the Karam branch in the courtyard, fasting and dancing through the night.',
  },
  {
    id: 'sohrai-fest',
    name: 'Sohrai Cattle & Harvest Festival',
    season: 'Winter (Post-Diwali / Kartik Amavasya)',
    significance: 'Thanksgiving to cattle and domestic animals for their labor in the agricultural cycle.',
    rituals: 'Houses are plastered with fresh mud and painted with stunning GI-tagged Sohrai earth art murals.',
  },
  {
    id: 'tusu',
    name: 'Tusu Parab & Makar Mela',
    season: 'Winter (Poush Sankranti / January)',
    significance: 'Harvest festival celebrated by young maidens honoring the folk goddess Tusu with vibrant chaupal structures.',
    rituals: 'Handmade colorful paper and bamboo towers are immersed in sacred rivers amidst community folk songs.',
  },
];

export function HomeHeritageFestivalsSection() {
  const [activeTab, setActiveTab] = useState<'heritage' | 'festivals'>('heritage');

  return (
    <section className="py-20 bg-ink-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/20">
              <Landmark className="h-3.5 w-3.5" />
              <span>TIMELESS HERITAGE &amp; CELEBRATIONS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Sacred Shrines &amp; Living Celebrations
            </h2>
            <p className="text-sm sm:text-base text-sand/80">
              Explore centuries-old spiritual sanctuaries alongside vibrant tribal festivals that follow nature's calendar.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="inline-flex rounded-2xl border border-white/15 bg-black/40 p-1 backdrop-blur-md shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('heritage')}
              className={[
                'rounded-xl px-5 py-2 text-xs font-bold transition-all duration-200 focus:outline-none',
                activeTab === 'heritage'
                  ? 'bg-amber-400 text-ink-950 shadow-md'
                  : 'text-white/80 hover:text-white',
              ].join(' ')}
            >
              Historic Shrines
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('festivals')}
              className={[
                'rounded-xl px-5 py-2 text-xs font-bold transition-all duration-200 focus:outline-none',
                activeTab === 'festivals'
                  ? 'bg-amber-400 text-ink-950 shadow-md'
                  : 'text-white/80 hover:text-white',
              ].join(' ')}
            >
              Tribal Festivals
            </button>
          </div>
        </div>

        {/* Heritage Tab Content */}
        {activeTab === 'heritage' && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-7 animate-in fade-in duration-300">
            {HERITAGE_SPOTS.map((spot) => (
              <article
                key={spot.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-2xl"
              >
                <div className="relative h-60 w-full overflow-hidden bg-ink-900">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-300 border border-white/10">
                      {spot.century}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-sand/80 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    <span>{spot.location}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {spot.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-sand/80 leading-relaxed">
                      {spot.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <Link
                      to="/explore?category=religious"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200"
                    >
                      <span>Explore Heritage Circuit</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Festivals Tab Content */}
        {activeTab === 'festivals' && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {FESTIVALS.map((festival) => (
              <div
                key={festival.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7 space-y-4 hover:border-amber-400/40 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
                    <Sparkles className="h-3.5 w-3.5" /> {festival.season}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white">
                  {festival.name}
                </h3>

                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
                  {festival.significance}
                </p>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Living Rituals:
                  </span>
                  <p className="text-xs text-sand/80 leading-relaxed">
                    {festival.rituals}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Link to Events Page */}
        <div className="mt-12 text-center">
          <Button variant="secondary" asChild>
            <Link to="/events" className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>VIEW FULL CULTURAL FESTIVAL CALENDAR</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
