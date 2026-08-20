import { useState } from 'react';
import { Compass, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSmartRecommendations } from '../../services/ai/aiService';
import { DestinationCard } from '../destinations/DestinationCard';
import { AddToTripModal } from '../destinations/AddToTripModal';
import type { Destination } from '../../types/destination';
import { Button } from '../ui';

const RECOMMENDATION_TAGS: Array<{
  id: 'weekend' | 'family' | 'eco' | 'culture' | 'adventure';
  label: string;
  emoji: string;
}> = [
  { id: 'weekend', label: 'Weekend Escapes', emoji: '✨' },
  { id: 'family', label: 'Family Friendly', emoji: '👨‍👩‍👧‍👦' },
  { id: 'eco', label: 'Eco & Nature Retreats', emoji: '🌿' },
  { id: 'culture', label: 'Cultural Immersion', emoji: '🥁' },
  { id: 'adventure', label: 'Adventure & Hills', emoji: '⛺' },
];

export function AISmartRecommendations({
  defaultTag = 'weekend',
}: {
  defaultTag?: 'weekend' | 'family' | 'eco' | 'culture' | 'adventure';
}) {
  const [activeTag, setActiveTag] = useState(defaultTag);
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
            <span>AI-Powered Recommendations</span>
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
              <span>{tag.label}</span>
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
            <p className="font-bold text-ink-950">Looking for a custom multi-day travel route?</p>
            <p className="text-ink-600">Let our AI planner curate a day-by-day itinerary tailored to your schedule.</p>
          </div>
        </div>

        <Button asChild size="sm" className="bg-forest-900 text-white hover:bg-forest-800 font-bold shrink-0">
          <Link to="/plan-trip">
            <span>Launch Itinerary Planner</span>
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
