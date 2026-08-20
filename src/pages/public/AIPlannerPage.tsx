import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookmarkPlus,
  Car,
  Compass,
  ExternalLink,
  Hotel,
  Info,
  MapPin,
  Map as MapIcon,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  generatePersonalizedItinerary,
  type GeneratedItinerary,
  type ItineraryGenerationInput,
} from '../../services/ai/aiService';
import { useAuth } from '../../hooks/useAuth';
import { createTrip, addDestinationToTrip } from '../../services/trips/tripService';
import { formatIndianCurrency } from '../../lib/utils';
import { Badge, Button } from '../../components/ui';

const INTEREST_OPTIONS = [
  { id: 'waterfall', label: 'Waterfalls & Gorges', emoji: '🌊' },
  { id: 'wildlife', label: 'Wildlife & Sanctuaries', emoji: '🐅' },
  { id: 'culture', label: 'Tribal Culture & Arts', emoji: '🥁' },
  { id: 'heritage', label: 'Historical Forts & Megaliths', emoji: '🏛️' },
  { id: 'religious', label: 'Sacred Temples & Shrines', emoji: '🛕' },
  { id: 'adventure', label: 'Mountain Passes & Treks', emoji: '⛺' },
  { id: 'eco', label: 'Eco Retreats & Lakes', emoji: '🌿' },
  { id: 'crafts', label: 'Sohrai Art & Handicrafts', emoji: '🎨' },
];

export function AIPlannerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState<ItineraryGenerationInput>({
    days: 3,
    startLocation: 'Ranchi',
    budgetTier: 'moderate',
    travellerType: 'couple',
    interests: ['waterfall', 'eco', 'culture'],
    travelIntensity: 'balanced',
  });

  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Initial load
  useEffect(() => {
    let alive = true;
    async function loadInitial() {
      setIsGenerating(true);
      const initial = await generatePersonalizedItinerary(input);
      if (alive) {
        setItinerary(initial);
        setIsGenerating(false);
      }
    }
    void loadInitial();
    return () => {
      alive = false;
    };
  }, []);

  const handleInterestToggle = (id: string) => {
    setInput((prev) => {
      const exists = prev.interests.includes(id);
      if (exists) {
        if (prev.interests.length === 1) return prev;
        return { ...prev, interests: prev.interests.filter((i) => i !== id) };
      }
      return { ...prev, interests: [...prev.interests, id] };
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaveStatus('idle');
    setSaveMessage('');

    try {
      const generated = await generatePersonalizedItinerary(input);
      setItinerary(generated);
    } catch (err) {
      console.error('[AI Planner] generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!itinerary) return;

    if (!user) {
      navigate('/login?redirect=/plan-trip');
      return;
    }

    setSaveStatus('saving');
    try {
      // 1. Create Trip record
      const newTrip = await createTrip({
        title: itinerary.title,
        budget: itinerary.estimatedTotalBudget.min,
        start_location: itinerary.startLocation,
        notes: itinerary.summary,
      });

      // 2. Add each day's primary destination
      for (const day of itinerary.days) {
        for (const item of day.schedule) {
          if (item.destination) {
            await addDestinationToTrip({
              trip_id: newTrip.id,
              destination_id: item.destination.id,
              day_number: day.dayNumber,
              notes: item.title,
            }).catch(() => {});
          }
        }
      }

      setSaveStatus('saved');
      setSaveMessage('Itinerary successfully saved to your Tourist Portal Trips!');
    } catch (err: any) {
      console.error('[AI Planner] Save trip error', err);
      setSaveStatus('error');
      setSaveMessage(err.message || 'Could not save trip to portal.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20 font-sans">
      {/* ── Page Header Banner ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-ink-200/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-600 hover:text-ink-950 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <span className="text-ink-300">/</span>
                <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-[11px] font-bold text-forest-900 border border-forest-300 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Johar AI Travel Assistant
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-bold text-ink-950">
                Personalized AI Itinerary Planner
              </h1>
              <p className="text-sm text-ink-600 max-w-2xl">
                Generate realistic, day-by-day travel itineraries backed by certified Jharkhand GIS destination data, local homestays, and verified transport routes.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button asChild variant="secondary" size="sm" className="text-xs font-bold">
                <Link to="/map">
                  <MapIcon className="h-3.5 w-3.5 mr-1.5 text-clay-700" />
                  <span>Interactive Map</span>
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="text-xs font-bold">
                <Link to="/explore">Explore Places</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* ── Left Column: Itinerary Configuration Form ────────────────────── */}
          <div className="bg-white rounded-3xl p-6 border border-ink-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-ink-200/80 pb-3">
              <h2 className="font-display text-base font-bold text-ink-950 flex items-center gap-2">
                <Compass className="h-4 w-4 text-clay-700" />
                <span>Trip Preferences</span>
              </h2>
              <span className="text-[11px] font-semibold text-ink-500">24 Districts Ready</span>
            </div>

            {/* 1. Duration (Days) */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-ink-800">
                <span>Trip Duration</span>
                <span className="text-clay-800 font-extrabold text-sm">{input.days} {input.days === 1 ? 'Day' : 'Days'}</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, days: num }))}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      input.days === num
                        ? 'bg-forest-900 text-white shadow-xs'
                        : 'bg-sand/60 text-ink-700 hover:bg-sand hover:text-ink-900 border border-ink-200/60'
                    }`}
                  >
                    {num}D
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Starting City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-800">Starting City / Gateway</label>
              <select
                value={input.startLocation}
                onChange={(e) => setInput((p) => ({ ...p, startLocation: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-xs font-bold text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
              >
                <option value="Ranchi">Ranchi (Birsa Munda Airport / Railway Station)</option>
                <option value="Jamshedpur">Jamshedpur (Tatanagar Junction)</option>
                <option value="Deoghar">Deoghar (Deoghar Airport / Baidyanath Dham)</option>
                <option value="Dhanbad">Dhanbad (Grand Chord Railway Hub)</option>
                <option value="Bokaro">Bokaro Steel City</option>
                <option value="Hazaribagh">Hazaribagh Road</option>
              </select>
            </div>

            {/* 3. Traveller Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-800">Who is Travelling?</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['solo', 'couple', 'family', 'friends', 'senior'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, travellerType: type }))}
                    className={`rounded-xl py-2 px-2 text-xs font-bold capitalize transition-all ${
                      input.travellerType === type
                        ? 'bg-clay-700 text-white shadow-xs'
                        : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Budget Tier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-800">Approximate Budget Tier</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'budget', label: 'Budget', desc: '< ₹1.5K/day' },
                  { id: 'moderate', label: 'Moderate', desc: '₹2.5K/day' },
                  { id: 'premium', label: 'Premium', desc: '₹4.5K+/day' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, budgetTier: tier.id as any }))}
                    className={`rounded-xl py-2 px-2 text-center transition-all ${
                      input.budgetTier === tier.id
                        ? 'bg-forest-900 text-white shadow-xs'
                        : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                    }`}
                  >
                    <div className="text-xs font-bold capitalize">{tier.label}</div>
                    <div className="text-[10px] opacity-80">{tier.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Select Interests */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-800">Key Interests</label>
              <div className="grid grid-cols-2 gap-2">
                {INTEREST_OPTIONS.map((opt) => {
                  const selected = input.interests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleInterestToggle(opt.id)}
                      className={`flex items-center gap-2 rounded-xl p-2 text-left text-xs font-semibold border transition-all ${
                        selected
                          ? 'border-amber-400 bg-amber-50/80 text-ink-950 font-bold shadow-2xs'
                          : 'border-ink-200/80 bg-white text-ink-600 hover:bg-sand/40'
                      }`}
                    >
                      <span className="text-sm">{opt.emoji}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Travel Intensity */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-800">Travel Pace &amp; Intensity</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'relaxed', label: 'Relaxed' },
                  { id: 'balanced', label: 'Balanced' },
                  { id: 'packed', label: 'Packed' },
                ].map((int) => (
                  <button
                    key={int.id}
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, travelIntensity: int.id as any }))}
                    className={`rounded-xl py-2 text-xs font-bold capitalize transition-all ${
                      input.travelIntensity === int.id
                        ? 'bg-amber-400 text-ink-950 shadow-xs'
                        : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                    }`}
                  >
                    {int.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-forest-900 hover:bg-forest-800 text-white font-bold py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{isGenerating ? 'Curating Optimal Circuit with AI...' : 'Generate AI Itinerary'}</span>
            </Button>
          </div>

          {/* ── Right Column: Generated Itinerary Showcase ───────────────────── */}
          <div className="space-y-6">
            {isGenerating && !itinerary && (
              <div className="bg-white rounded-3xl p-12 border border-ink-200 text-center space-y-4 shadow-sm animate-pulse">
                <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center">
                  <Sparkles className="h-6 w-6 animate-spin" />
                </div>
                <h3 className="font-display text-lg font-bold text-ink-950">
                  Johar AI is curating your personalized itinerary...
                </h3>
                <p className="text-xs text-ink-500 max-w-md mx-auto">
                  Synthesizing optimal routes, verified accommodations, and scenic viewpoints across Jharkhand.
                </p>
              </div>
            )}

            {itinerary && (
              <>
                {/* Itinerary Summary Header Card */}
                <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-ink-200/90 shadow-md space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-clay-100 text-clay-900 border border-clay-300 text-xs font-bold px-3 py-1">
                        {itinerary.daysCount} Days • {itinerary.travellerType.toUpperCase()}
                      </span>
                      <span className="rounded-full bg-forest-100 text-forest-900 border border-forest-300 text-xs font-bold px-3 py-1 capitalize">
                        {itinerary.travelIntensity} Pace
                      </span>
                      {itinerary.modelUsed && (
                        <span className="rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5">
                          ✦ {itinerary.modelUsed}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">
                        Estimated Budget
                      </p>
                      <p className="text-base sm:text-lg font-extrabold text-forest-900">
                        {formatIndianCurrency(itinerary.estimatedTotalBudget.min)} –{' '}
                        {formatIndianCurrency(itinerary.estimatedTotalBudget.max)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-950 leading-tight">
                      {itinerary.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
                      {itinerary.summary}
                    </p>
                  </div>

                  {/* Advisories banner if any */}
                  {itinerary.activeAdvisories.length > 0 && (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-950 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-amber-900">
                        <AlertCircle className="h-4 w-4 text-amber-700" />
                        <span>Active Tourism &amp; Weather Advisories</span>
                      </p>
                      <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5 pl-1">
                        {itinerary.activeAdvisories.map((adv, idx) => (
                          <li key={idx}>{adv}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink-200/70">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        onClick={handleSaveTrip}
                        disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                        className={`text-xs font-bold ${
                          saveStatus === 'saved'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-clay-700 hover:bg-clay-800 text-white'
                        }`}
                      >
                        <BookmarkPlus className="h-3.5 w-3.5 mr-1.5" />
                        <span>{saveStatus === 'saved' ? 'Saved to Portal' : 'Save to My Trips'}</span>
                      </Button>

                      <Button asChild variant="secondary" size="sm" className="text-xs font-bold">
                        <Link to={`/map?district=${itinerary.days[0]?.district || 'Ranchi'}`}>
                          <MapIcon className="h-3.5 w-3.5 mr-1.5 text-clay-700" />
                          <span>View on Map</span>
                        </Link>
                      </Button>
                    </div>

                    {saveStatus === 'saved' && (
                      <span className="text-xs text-forest-700 font-bold">
                        ✓ {saveMessage || 'Saved! View in'} <Link to="/tourist/itinerary" className="underline">My Trips</Link>
                      </span>
                    )}
                    {saveStatus === 'error' && (
                      <span className="text-xs text-red-600 font-bold">
                        {saveMessage}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day by Day Plan Cards */}
                <div className="space-y-6">
                  {itinerary.days.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-ink-200/90 shadow-sm space-y-5"
                    >
                      {/* Day Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-200/70 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="h-8 w-8 rounded-full bg-forest-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            {day.dayNumber}
                          </span>
                          <div>
                            <h3 className="font-display text-base sm:text-lg font-bold text-ink-950">
                              {day.title}
                            </h3>
                            <p className="text-xs text-ink-500 flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-clay-700" />
                              <span>{day.district} District Circuit</span>
                            </p>
                          </div>
                        </div>

                        <Badge variant="accent" className="text-xs">
                          Est. ~{formatIndianCurrency(day.dayBudgetEstimate)}
                        </Badge>
                      </div>

                      {/* Activities Schedule Grid */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-clay-700">
                          Recommended Timeline &amp; Highlights
                        </p>

                        <div className="space-y-2.5">
                          {day.schedule.map((item, sIdx) => (
                            <div
                              key={sIdx}
                              className="rounded-2xl border border-ink-200/70 bg-[#FFFDF9] p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="rounded-md bg-sand px-2 py-0.5 text-[10px] font-bold text-ink-800">
                                    {item.timeSlot}
                                  </span>
                                  <span className="text-[10px] text-ink-500 font-medium">
                                    • {item.durationHours} hrs
                                  </span>
                                </div>
                                <h4 className="font-bold text-ink-900 text-xs sm:text-sm">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-ink-600 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>

                              {item.destination && (
                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                  <Button
                                    asChild
                                    size="sm"
                                    variant="secondary"
                                    className="text-[11px] font-bold py-1 h-auto"
                                  >
                                    <Link to={`/destinations/${item.destination.slug}`}>
                                      <span>Explore</span>
                                      <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                  </Button>
                                  <Button
                                    asChild
                                    size="sm"
                                    variant="secondary"
                                    className="text-[11px] font-bold py-1 h-auto"
                                    title="View on Map"
                                  >
                                    <Link to={`/map?destination=${item.destination.slug}`}>
                                      <MapPin className="h-3 w-3 text-clay-700" />
                                    </Link>
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Stay & Transport for the Day */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-ink-200/70 text-xs">
                        {day.recommendedStay && (
                          <div className="rounded-2xl border border-ink-200/80 bg-sand/30 p-3 flex items-start gap-3">
                            <Hotel className="h-4 w-4 text-clay-700 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-ink-950 truncate">
                                {day.recommendedStay.name}
                              </p>
                              <p className="text-[11px] text-forest-700 font-semibold">
                                {day.recommendedStay.price ? formatIndianCurrency(day.recommendedStay.price) : 'Contact'} / night • {day.recommendedStay.district}
                              </p>
                            </div>
                            <Button asChild size="sm" variant="secondary" className="text-[10px] py-1 px-2 h-auto font-bold shrink-0">
                              <Link to={`/stays/${day.recommendedStay.id}`}>
                                View Stay
                              </Link>
                            </Button>
                          </div>
                        )}

                        {day.recommendedTransport && (
                          <div className="rounded-2xl border border-ink-200/80 bg-sand/30 p-3 flex items-start gap-3">
                            <Car className="h-4 w-4 text-forest-700 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-ink-950 truncate">
                                {day.recommendedTransport.name}
                              </p>
                              <p className="text-[11px] text-ink-600">
                                {day.recommendedTransport.price ? formatIndianCurrency(day.recommendedTransport.price) : 'Contact'} • Verified AC Vehicle
                              </p>
                            </div>
                            <Button asChild size="sm" variant="secondary" className="text-[10px] py-1 px-2 h-auto font-bold shrink-0">
                              <Link to={`/transport/${day.recommendedTransport.id}`}>
                                View Cab
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Day Local Tips */}
                      {day.localTips && (
                        <div className="rounded-2xl bg-forest-50/70 border border-forest-200/60 p-3 text-[11px] text-forest-950 space-y-1">
                          <p className="font-bold flex items-center gap-1.5 text-forest-900">
                            <Info className="h-3.5 w-3.5" />
                            <span>Curator Notes for Day {day.dayNumber}</span>
                          </p>
                          <ul className="list-disc list-inside text-forest-800 space-y-0.5">
                            {day.localTips.map((tip, tIdx) => (
                              <li key={tIdx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
