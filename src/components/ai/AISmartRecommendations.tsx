import { useState } from 'react';
import { Compass, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSmartRecommendations } from '../../services/ai/aiService';
import { DestinationCard } from '../destinations/DestinationCard';
import { AddToTripModal } from '../destinations/AddToTripModal';
import { useTranslation } from '../../i18n';
import type { Destination } from '../../types/destination';
import { Button } from '../ui';

type RecTag = 'weekend' | 'family' | 'romantic' | 'budget' | 'eco' | 'culture' | 'adventure' | 'spiritual' | 'hidden';

const RECOMMENDATION_TAGS: Array<{
  id: RecTag;
  labelEn: string;
  labelHi: string;
  emoji: string;
}> = [
  { id: 'weekend', labelEn: 'Weekend Escapes', labelHi: 'सप्ताहांत भ्रमण', emoji: '✨' },
  { id: 'family', labelEn: 'Family Friendly', labelHi: 'पारिवारिक पर्यटन', emoji: '👨‍👩‍👧‍👦' },
  { id: 'romantic', labelEn: 'Romantic Gateways', labelHi: 'शांति एवं मनोरम', emoji: '🌄' },
  { id: 'budget', labelEn: 'Budget Travel', labelHi: 'किफायती यात्रा', emoji: '💰' },
  { id: 'eco', labelEn: 'Eco & Lakes', labelHi: 'प्रकृति एवं झीलें', emoji: '🌿' },
  { id: 'culture', labelEn: 'Tribal Culture', labelHi: 'आदिवासी संस्कृति', emoji: '🥁' },
  { id: 'adventure', labelEn: 'Adventure & Treks', labelHi: 'रोमांच एवं ट्रेक', emoji: '⛺' },
  { id: 'spiritual', labelEn: 'Spiritual & Sacred', labelHi: 'आध्यात्मिक एवं तीर्थ', emoji: '🛕' },
  { id: 'hidden', labelEn: 'Hidden Gems', labelHi: 'अनदेखे स्थल', emoji: '💎' },
];

export function AISmartRecommendations({
  defaultTag = 'weekend',
}: {
  defaultTag?: RecTag;
}) {
  const { language } = useTranslation();
  const [activeTag, setActiveTag] = useState<RecTag>(defaultTag);
  const [tripModalDestination, setTripModalDestination] = useState<Destination | null>(null);

  const recommendation = getSmartRecommendations({ tag: activeTag });

  return (
    <section className="space-y-6">
      {/* Add To Trip Modal */}
      {tripModalDestination && (
        <AddToTripModal
          destinationId={tripModalDestination.id}
          destinationName={tripModalDestination.name}
          onClose={() => setTripModalDestination(null)}
        />
      )}

      {/* Header & Tag Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-forest-800">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>{language === 'hi' ? 'एआई स्मार्ट सिफारिशें' : 'AI-Powered Recommendations'}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-950">
            {recommendation.title}
          </h2>
          <p className="text-xs sm:text-sm text-ink-600">
            {recommendation.subtitle}
          </p>
        </div>

        {/* Filter Tag Pills */}
        <div className="flex flex-wrap gap-1.5">
          {RECOMMENDATION_TAGS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setActiveTag(tag.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                activeTag === tag.id
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'bg-sand/70 text-ink-700 hover:bg-sand border border-ink-200/80'
              }`}
            >
              <span className="mr-1">{tag.emoji}</span>
              <span>{language === 'hi' ? tag.labelHi : tag.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Destination Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendation.destinations.map((dest) => (
          <DestinationCard
            key={dest.id}
            destination={dest}
            onAddToTrip={(d) => setTripModalDestination(d)}
          />
        ))}
      </div>

      {/* Footer link to AI planner */}
      <div className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-ink-950">
              {language === 'hi'
                ? 'क्या आप बहु-दिवसीय यात्रा कार्यक्रम बनाना चाहते हैं?'
                : 'Looking for a custom multi-day travel route?'}
            </p>
            <p className="text-ink-600">
              {language === 'hi'
                ? 'जोहार एआई प्लानर से अपनी पसंद के अनुसार व्यक्तिगत दिन-प्रतिदिन कार्यक्रम तैयार करें।'
                : 'Let our AI planner curate a day-by-day itinerary tailored to your schedule.'}
            </p>
          </div>
        </div>

        <Button asChild size="sm" className="bg-forest-900 text-white hover:bg-forest-800 font-bold shrink-0">
          <Link to="/plan-trip">
            <span>{language === 'hi' ? 'यात्रा प्लानर खोलें' : 'Launch Itinerary Planner'}</span>
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
