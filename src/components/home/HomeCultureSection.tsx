import { Link } from 'react-router-dom';
import { ArrowRight, Music, Sparkles, Users, TreePine } from 'lucide-react';
import { CULTURE_IMAGES } from '../../constants/contentImages';

interface CulturalPillar {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Music;
  image: string;
}

const CULTURAL_PILLARS: CulturalPillar[] = [
  {
    id: 'chhau-dance',
    title: 'Seraikela Chhau Mask Dance',
    subtitle: 'UNESCO Intangible Cultural Heritage',
    description: 'A stylized martial masked dance combining graceful movements, mythic heroism, and rhythmic percussion that brings epics alive under open moonlight.',
    icon: Sparkles,
    image: CULTURE_IMAGES.CHHAU_DANCE,
  },
  {
    id: 'sarna-dharam',
    title: 'Sarna: Sacred Forest Worship',
    subtitle: 'Harmony with Nature & Ancestors',
    description: 'Centred on reverence for nature and sacred Sal tree groves (Jaher Sthan), reflecting an ancient philosophy where earth, wildlife, and community coexist as one.',
    icon: TreePine,
    image: CULTURE_IMAGES.SARNA_WORSHIP,
  },
  {
    id: 'mandar-nagara',
    title: 'Mandar & Nagara Rhythms',
    subtitle: 'The Heartbeat of the Plateau',
    description: 'Earthen percussion instruments crafted from clay and leather that guide celebratory circle dances, community festivals, and agricultural harvest songs.',
    icon: Music,
    image: CULTURE_IMAGES.MANDAR_DRUMS,
  },
  {
    id: 'johar-spirit',
    title: 'Johar: The Living Greeting',
    subtitle: 'Village Hospitality & Community Life',
    description: '"Johar" represents deep respect, equality, and reverence for all living beings — welcoming travelers with pure spring water, marua roti, and warm smiles.',
    icon: Users,
    image: '/images/destinations/patratu-valley.jpg',
  },
];

export function HomeCultureSection() {
  return (
    <section id="culture" className="py-20 bg-[#F7F3EC] border-y border-ink-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-3.5 py-1 text-xs font-bold text-forest-900 border border-forest-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>LIVING ANCESTRAL HERITAGE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
            Experience the Culture: Rhythms of Earth &amp; Spirit
          </h2>
          <p className="text-sm sm:text-base text-ink-700 leading-relaxed">
            Discover a land where ancient traditions are not museum exhibits, but a vibrant daily celebration of nature, community, and musical expression.
          </p>
        </div>

        {/* 4 Feature Columns / Asymmetric Layout */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CULTURAL_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="group relative flex flex-col justify-between rounded-3xl border border-ink-200/90 bg-[#FFFDF9] p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 p-3 text-ink-900 transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-300">
                  <pillar.icon className="h-full w-full" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-clay-700">
                  {pillar.subtitle}
                </p>
                <h3 className="font-display text-xl font-bold text-ink-900 group-hover:text-clay-700 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-ink-100">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-1 text-xs font-bold text-clay-700 hover:text-clay-800 transition-colors"
                >
                  <span>See Cultural Calendar</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
