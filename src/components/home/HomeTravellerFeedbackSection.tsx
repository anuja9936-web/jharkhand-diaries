import { Link } from 'react-router-dom';
import { ArrowRight, Heart, MessageSquare, Quote, Star } from 'lucide-react';
import { Button } from '../ui';

interface TravellerStory {
  id: string;
  author: string;
  location: string;
  trip: string;
  quote: string;
  rating: number;
}

const TRAVELLER_STORIES: TravellerStory[] = [
  {
    id: 't1',
    author: 'Priya Mukherjee',
    location: 'Kolkata, West Bengal',
    trip: 'Netarhat & Betla 4-Day Eco Tour',
    quote: 'Watching the sunrise over Netarhat pine trees and hearing local village elders share Santhal folklore by the campfire made this the most authentic vacation of our lives.',
    rating: 5,
  },
  {
    id: 't2',
    author: 'Arjun & Neha Verma',
    location: 'Bengaluru, Karnataka',
    trip: 'Patratu Valley & Dassam Falls Weekend',
    quote: 'The smooth hillside roads of Patratu overlooking the lake are breathtaking. We met master artisans in Hazaribagh who taught us Sohrai painting — pure magic!',
    rating: 5,
  },
  {
    id: 't3',
    author: 'David Chen',
    location: 'Singapore',
    trip: 'Baidyanath Dham & Heritage Circuit',
    quote: 'The spiritual devotion at Deoghar coupled with the mouth-watering Dhuska and local warmth makes Jharkhand an undiscovered gem of India.',
    rating: 5,
  },
];

export function HomeTravellerFeedbackSection() {
  return (
    <section className="py-20 bg-sand/30 border-y border-ink-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Traveller Reflections Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-clay-100 px-3.5 py-1 text-xs font-bold text-clay-800">
            <Heart className="h-3.5 w-3.5" />
            <span>TRAVELLER VOICES</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
            Memories Carved in the Plateau
          </h2>
          <p className="text-sm sm:text-base text-ink-600">
            Authentic reflections from travellers who explored the waterfalls, craft villages, and sacred shrines of Jharkhand.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {TRAVELLER_STORIES.map((story) => (
            <div
              key={story.id}
              className="relative flex flex-col justify-between rounded-3xl border border-ink-200/80 bg-white p-7 shadow-xs hover:border-clay-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                <Quote className="h-8 w-8 text-clay-300" />
                <div className="flex items-center gap-1">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-ink-700 leading-relaxed italic">
                  "{story.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-ink-100 space-y-0.5">
                <p className="font-display text-sm font-bold text-ink-900">{story.author}</p>
                <p className="text-[11px] font-semibold text-clay-700">{story.trip}</p>
                <p className="text-[11px] text-ink-400">{story.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback CTA Card */}
        <div className="rounded-3xl bg-ink-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300">
              <MessageSquare className="h-4 w-4" />
              <span>COMMUNITY CO-CREATION</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Your Journey Can Shape the Next One.
            </h3>
            <p className="text-xs sm:text-sm text-sand/80 leading-relaxed">
              Have you recently explored a hidden waterfall, tasted an unforgettable local meal, or stayed at a village homestay? Tell us about your journey.
            </p>
          </div>

          <Button variant="primary" size="lg" asChild className="shrink-0 bg-amber-400 text-ink-950 hover:bg-amber-300 font-bold">
            <Link to="/feedback" className="inline-flex items-center gap-2">
              <span>SHARE FEEDBACK</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
