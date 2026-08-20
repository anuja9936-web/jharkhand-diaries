import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Compass, MapPin, Sparkles, Tag, Users, Wallet } from 'lucide-react';
import { Button } from '../ui';

const STARTING_LOCATIONS = [
  'Ranchi (Capital)',
  'Jamshedpur',
  'Dhanbad',
  'Deoghar',
  'Hazaribagh',
  'Bokaro Steel City',
  'Outside Jharkhand (Patna / Kolkata / Delhi)',
];

const DURATIONS = [
  { label: 'Weekend Trip', value: '2-3 Days', days: 3 },
  { label: 'Short Break', value: '4-5 Days', days: 5 },
  { label: 'Grand Explorer', value: '6-8 Days', days: 7 },
];

const BUDGETS = ['Budget Conscious', 'Comfort & Heritage', 'Luxury Retreat'];

const TRAVEL_STYLES = ['Solo Explorer', 'Couple Getaway', 'Family Vacation', 'Group of Friends'];

const INTERESTS = [
  'Waterfalls & Nature',
  'Wildlife & Safaris',
  'Tribal Art & Murals',
  'Sacred Shrines',
  'Local Gastronomy',
  'Mountain Adventure',
];

export function HomePlannerSection() {
  const navigate = useNavigate();
  const [startLocation, setStartLocation] = useState(STARTING_LOCATIONS[0]);
  const [duration, setDuration] = useState(DURATIONS[0].value);
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [style, setStyle] = useState(TRAVEL_STYLES[1]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Waterfalls & Nature',
    'Tribal Art & Murals',
  ]);

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== item));
      }
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to tourist itinerary creation with query parameters or to the tourist planner
    navigate('/tourist/itinerary/new');
  };

  return (
    <section id="trip-planner" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl border border-ink-200/80 bg-white p-8 sm:p-12 shadow-xl">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-clay-100 px-3.5 py-1 text-xs font-bold text-clay-800">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PERSONALIZED TRIP PLANNER</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
            Your Journey. Your Way.
          </h2>
          <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
            Tell us where you're starting, how long you're travelling, what you love and your budget. Build a journey that fits you.
          </p>
        </div>

        {/* Interactive Planner Form */}
        <form onSubmit={handlePlanSubmit} className="mt-12 space-y-8 max-w-4xl mx-auto">
          {/* Step 1 & 2: Start Point & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-clay-700" />
                <span>Starting Location</span>
              </label>
              <select
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="w-full rounded-2xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm font-semibold text-ink-900 focus:border-clay-400 focus:bg-white focus:outline-none transition"
              >
                {STARTING_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-clay-700" />
                <span>Trip Duration</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    type="button"
                    onClick={() => setDuration(dur.value)}
                    className={[
                      'rounded-2xl border py-3 px-2 text-center text-xs font-bold transition-all',
                      duration === dur.value
                        ? 'border-ink-900 bg-ink-900 text-white shadow-xs'
                        : 'border-ink-200 bg-ink-50/50 text-ink-700 hover:bg-ink-100',
                    ].join(' ')}
                  >
                    {dur.value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3 & 4: Travel Style & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-clay-700" />
                <span>Travel Style</span>
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-2xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm font-semibold text-ink-900 focus:border-clay-400 focus:bg-white focus:outline-none transition"
              >
                {TRAVEL_STYLES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-clay-700" />
                <span>Budget Preference</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BUDGETS.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBudget(bg)}
                    className={[
                      'rounded-2xl border py-3 px-2 text-center text-xs font-bold transition-all truncate',
                      budget === bg
                        ? 'border-clay-700 bg-clay-700 text-white shadow-xs'
                        : 'border-ink-200 bg-ink-50/50 text-ink-700 hover:bg-ink-100',
                    ].join(' ')}
                  >
                    {bg.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 5: Interests Multiselect */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-clay-700" />
              <span>What do you love? (Select Interests)</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={[
                    'rounded-full px-4 py-2 text-xs font-bold transition-all',
                    selectedInterests.includes(interest)
                      ? 'bg-amber-400 text-ink-950 shadow-xs ring-2 ring-amber-400/50'
                      : 'border border-ink-200 bg-white text-ink-700 hover:bg-sand',
                  ].join(' ')}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Itinerary Preview Recommendation Snippet */}
          <div className="p-5 rounded-2xl bg-sand/60 border border-clay-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-clay-800">
                Suggested Route Outline ({duration})
              </span>
              <span className="text-xs font-semibold text-ink-600">
                Departing {startLocation.split(' ')[0]}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-ink-100 space-y-1">
                <span className="font-bold text-clay-700">Day 1-2:</span>
                <p className="font-semibold text-ink-900">Patratu Valley &amp; Dassam Falls</p>
                <p className="text-[11px] text-ink-500">Scenic drive, lakeside camping &amp; cascade walk</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-ink-100 space-y-1">
                <span className="font-bold text-clay-700">Day 3-4:</span>
                <p className="font-semibold text-ink-900">Netarhat Misty Pines &amp; Sunrises</p>
                <p className="text-[11px] text-ink-500">Highland eco-lodge &amp; tribal handicraft studio</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-ink-100 space-y-1">
                <span className="font-bold text-clay-700">Day 5+:</span>
                <p className="font-semibold text-ink-900">Betla Tiger Reserve Safari</p>
                <p className="text-[11px] text-ink-500">Forest tracking &amp; 16th-century Chero forts</p>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="text-center pt-2">
            <Button type="submit" size="lg" className="w-full sm:w-auto px-10">
              <Compass className="h-5 w-5" />
              <span>PLAN MY JOURNEY IN TRIP PLANNER</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
