import { useState } from 'react';
import { ArrowLeft, Calendar, Info, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventItem {
  id: string;
  name: string;
  season: string;
  period: string;
  district: string;
  location: string;
  type: 'Tribal Festival' | 'Spiritual Pilgrimage' | 'Harvest Fair' | 'Dance & Music';
  significance: string;
  description: string;
  visitorEtiquette: string;
}

const EVENTS_DATA: EventItem[] = [
  {
    id: 'e1',
    name: 'State Sarhul Mahotsav',
    season: 'Spring',
    period: 'March - April (Chaitra Shukla Tritiya)',
    district: 'Ranchi, Gumla, Khunti',
    location: 'Sarna Sthan across all Tribal Villages',
    type: 'Tribal Festival',
    significance: 'Worship of the blossoming Sal flowers (Sarjom Baha) and Mother Earth’s renewal.',
    description: 'The premier tribal festival of Jharkhand celebrated by Oraon, Munda, and Ho communities. Village priests (Pahan) offer Sal blossoms to deities, followed by traditional processions with beating Mandar drums and community dancing.',
    visitorEtiquette: 'Visitors are welcomed warmly; dress respectfully and ask permission before entering sacred Sarna groves.',
  },
  {
    id: 'e2',
    name: 'Historic Shravani Mela Pilgrimage',
    season: 'Monsoon',
    period: 'July - August (Shravan Month)',
    district: 'Deoghar',
    location: 'Baidyanath Jyotirlinga Dham',
    type: 'Spiritual Pilgrimage',
    significance: 'Month-long sacred barefoot pilgrimage carrying holy Ganges water.',
    description: 'Millions of saffron-clad pilgrims (Kanwariyas) walk 105 km from Sultanganj to Deoghar to offer holy water on the Jyotirlinga, accompanied by continuous chants of "Bol Bam".',
    visitorEtiquette: 'Expect massive devotional gatherings; adhere to queue regulations and stay hydrated.',
  },
  {
    id: 'e3',
    name: 'Karma Puja & Harvest Celebration',
    season: 'Autumn',
    period: 'August - September (Bhadrapada Ekadashi)',
    district: 'Statewide / Chotanagpur Plateau',
    location: 'Village Akhra & Courtyards',
    type: 'Tribal Festival',
    significance: 'Celebration of sisterly affection, Karam tree worship, and fertility of crops.',
    description: 'Young sisters fast for the well-being and prosperity of their brothers. A branch of the sacred Karam tree is planted in the central village Akhra, around which youth dance throughout the night.',
    visitorEtiquette: 'Join the circle dance when invited by village elders with joy and reverence.',
  },
  {
    id: 'e4',
    name: 'Sohrai Cattle & Wall Painting Festival',
    season: 'Winter',
    period: 'October - November (Post-Diwali)',
    district: 'Hazaribagh, Dumka, Giridih',
    location: 'Mud Village Settlements',
    type: 'Harvest Fair',
    significance: 'Thanksgiving to agricultural cattle and painting of mud house murals.',
    description: 'Bulls and cows are bathed, anointed with vermilion and oil, and adorned with natural garlands. The entire village transforms into an open-air art gallery with freshly painted GI-tagged Sohrai earth art.',
    visitorEtiquette: 'Do not touch freshly painted wet mud murals; photography of exterior walls is widely appreciated.',
  },
  {
    id: 'e5',
    name: 'Tusu Parab & Makar Sankranti Mela',
    season: 'Winter',
    period: 'January (Poush Sankranti)',
    district: 'East Singhbhum, Saraikela, Ranchi',
    location: 'Subarnarekha & Kanchi Riverbanks',
    type: 'Harvest Fair',
    significance: 'Folk harvest celebration dedicated to Goddess Tusu with colorful Chaupal towers.',
    description: 'Unmarried maidens prepare vibrant bamboo and colored paper monuments (Chaupals) celebrating agricultural abundance, culminating in a ceremonial river immersion and fair.',
    visitorEtiquette: 'Enjoy traditional jaggery sweets like Pitha and Tilkut sold at festive riverbank stalls.',
  },
  {
    id: 'e6',
    name: 'Seraikela Chhau Spring Dance Mahotsav',
    season: 'Spring',
    period: 'April (Chaitra Parva)',
    district: 'Seraikela Kharsawan',
    location: 'Palace Grounds & Community Akhras',
    type: 'Dance & Music',
    significance: 'UNESCO Intangible Cultural Heritage masked martial arts performance.',
    description: 'Three nights of classical masked dance storytelling depicting episodes from Mahabharata, Ramayana, and nature folklore beneath moonlit skies.',
    visitorEtiquette: 'Photography is allowed; reserve seats early at the open-air pavilion.',
  },
];

const SEASONS = ['All', 'Spring', 'Monsoon', 'Autumn', 'Winter'] as const;

export function EventsPage() {
  const [activeSeason, setActiveSeason] = useState<string>('All');

  const filtered =
    activeSeason === 'All'
      ? EVENTS_DATA
      : EVENTS_DATA.filter((e) => e.season === activeSeason);

  return (
    <div className="min-h-screen bg-ink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ink-200">
          <div className="space-y-3 max-w-2xl">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-clay-700 hover:text-clay-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">
              CULTURAL CALENDAR
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink-900">
              Festivals &amp; Traditional Celebrations
            </h1>
            <p className="text-sm sm:text-base text-ink-600">
              Follow nature's seasons through blooming Sal flowers, masked martial dances, harvest fairs, and spiritual pilgrimages.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSeason(s)}
                className={[
                  'rounded-full px-4 py-2 text-xs font-bold transition-all',
                  activeSeason === s
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'bg-white text-ink-700 border border-ink-200 hover:bg-sand',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((ev) => (
            <article
              key={ev.id}
              className="rounded-3xl border border-ink-200/80 bg-white p-7 shadow-xs space-y-5 hover:border-clay-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-clay-100 px-3 py-1 text-xs font-bold text-clay-800">
                    {ev.type}
                  </span>
                  <span className="text-xs font-bold text-forest-700 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {ev.season} Season
                  </span>
                </div>

                <h2 className="font-display text-2xl font-bold text-ink-900">{ev.name}</h2>

                <div className="flex flex-wrap gap-3 text-xs text-ink-500 font-medium">
                  <span className="flex items-center gap-1 text-clay-700 font-semibold">
                    <MapPin className="h-3.5 w-3.5" /> {ev.location} ({ev.district})
                  </span>
                  <span>•</span>
                  <span>{ev.period}</span>
                </div>

                <p className="text-xs sm:text-sm text-ink-600 leading-relaxed font-medium">
                  {ev.significance}
                </p>

                <p className="text-xs text-ink-600 leading-relaxed">
                  {ev.description}
                </p>
              </div>

              {/* Etiquette Alert */}
              <div className="p-4 rounded-2xl bg-sand/50 border border-clay-200/80 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-clay-800 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" /> Traveler Etiquette:
                </span>
                <p className="text-xs text-ink-700 leading-relaxed">{ev.visitorEtiquette}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
