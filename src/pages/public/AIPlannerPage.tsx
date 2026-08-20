import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookmarkPlus,
  Calendar,
  Car,
  Compass,
  DollarSign,
  Hotel,
  Info,
  MapPin,
  Map as MapIcon,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  generatePersonalizedItinerary,
  type GeneratedItinerary,
  type ItineraryGenerationInput,
} from '../../services/ai/aiService';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../i18n';
import { createTrip, addDestinationToTrip } from '../../services/trips/tripService';
import { formatIndianCurrency } from '../../lib/utils';
import { Badge, Button, Input } from '../../components/ui';

const INTEREST_OPTIONS = [
  { id: 'waterfall', label: 'Waterfalls & Gorges', labelHi: 'जलप्रपात एवं झरने', emoji: '🌊' },
  { id: 'wildlife', label: 'Wildlife & Sanctuaries', labelHi: 'वन्यजीव एवं अभयारण्य', emoji: '🐅' },
  { id: 'culture', label: 'Tribal Culture & Arts', labelHi: 'आदिवासी संस्कृति एवं कला', emoji: '🥁' },
  { id: 'heritage', label: 'Historical Forts & Megaliths', labelHi: 'ऐतिहासिक किले एवं धरोहर', emoji: '🏛️' },
  { id: 'religious', label: 'Sacred Temples & Shrines', labelHi: 'पवित्र तीर्थ एवं मंदिर', emoji: '🛕' },
  { id: 'adventure', label: 'Mountain Passes & Treks', labelHi: 'पहाड़ी ट्रेक्स एवं रोमांच', emoji: '⛺' },
  { id: 'eco', label: 'Eco Retreats & Lakes', labelHi: 'प्रकृति एवं झीलें', emoji: '🌿' },
  { id: 'crafts', label: 'Sohrai Art & Handicrafts', labelHi: 'सोहराई कला एवं हस्तशिल्प', emoji: '🎨' },
  { id: 'food', label: 'Authentic Local Cuisine (Dhuska, Rugra)', labelHi: 'झारखंडी खानपान (धुस्का, रुगड़ा)', emoji: '🍲' },
];

export function AIPlannerPage() {
  const { user } = useAuth();
  const { language, t } = useTranslation();
  const navigate = useNavigate();

  const [input, setInput] = useState<ItineraryGenerationInput>({
    days: 3,
    startLocation: 'Ranchi',
    budgetTier: 'moderate',
    travellerType: 'couple',
    interests: ['waterfall', 'eco', 'culture'],
    travelIntensity: 'balanced',
    language,
  });

  const [customBudget, setCustomBudget] = useState<string>('');
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Sync language with input
  useEffect(() => {
    setInput((prev) => ({ ...prev, language }));
  }, [language]);

  // Initial load
  useEffect(() => {
    let alive = true;
    async function loadInitial() {
      setIsGenerating(true);
      const initial = await generatePersonalizedItinerary({
        ...input,
        language,
      });
      if (alive) {
        setItinerary(initial);
        setIsGenerating(false);
      }
    }
    void loadInitial();
    return () => {
      alive = false;
    };
  }, [language]);

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
      const customAmount = customBudget ? Number(customBudget) : undefined;
      const generated = await generatePersonalizedItinerary({
        ...input,
        customBudgetAmount: customAmount,
        language,
      });
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
      const newTrip = await createTrip({
        title: itinerary.title,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + itinerary.daysCount * 86400000).toISOString().slice(0, 10),
        budget: itinerary.estimatedTotalBudget.min,
        start_location: input.startLocation,
      });

      if (newTrip) {
        const destIds = new Set<string>();
        itinerary.days.forEach((day) => {
          day.schedule.forEach((slot) => {
            if (slot.destination?.id) {
              destIds.add(slot.destination.id);
            }
          });
        });

        let order = 0;
        for (const dId of destIds) {
          await addDestinationToTrip({
            trip_id: newTrip.id,
            destination_id: dId,
            visit_order: order++,
          });
        }

        setSaveStatus('saved');
        setSaveMessage(language === 'hi' ? 'यात्रा सफलतापूर्वक सहेजी गई!' : 'Trip saved to your Tourist Portal!');
      } else {
        setSaveStatus('error');
        setSaveMessage(language === 'hi' ? 'यात्रा सहेजने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to save trip. Please try again.');
      }
    } catch (err) {
      console.error('[AI Planner] save error', err);
      setSaveStatus('error');
      setSaveMessage('Error saving trip.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-ink-900 pb-20 selection:bg-clay-500/20 font-sans">
      {/* Top Banner */}
      <div className="bg-ink-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-ink-200/20">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs text-sand/80 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t('common.back', 'Back to Explore')}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-forest-900/80 px-3 py-1 text-xs font-semibold text-amber-400 border border-forest-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{language === 'hi' ? 'स्मार्ट एआई यात्रा योजक' : 'Smart AI Itinerary Engine'}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {t('ai.assistantTitle', 'Johar AI Personalized Trip Planner')}
              </h1>
              <p className="text-xs sm:text-sm text-ink-300 max-w-2xl">
                {language === 'hi'
                  ? 'अपनी प्राथमिकताओं, बजट एवं अवधि के अनुसार 24 जिलों के लिए व्यक्तिगत यात्रा कार्यक्रम तैयार करें।'
                  : 'Curate dynamic day-by-day itineraries across Jharkhand with verified GIS destinations, stays, travel times, and cultural experiences.'}
              </p>
            </div>

            {itinerary?.modelUsed && (
              <div className="self-start md:self-auto rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-right">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  AI Architecture
                </span>
                <span className="text-xs font-semibold text-white">
                  ✦ {itinerary.modelUsed}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Parameter Configuration Panel (4 cols) */}
          <div className="lg:col-span-4 bg-[#FFFDF9] rounded-3xl p-6 border border-ink-200/90 shadow-lg space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-ink-200/70 pb-3">
              <h2 className="font-display font-bold text-base text-ink-950 flex items-center gap-2">
                <Compass className="h-4 w-4 text-clay-700" />
                <span>{language === 'hi' ? 'यात्रा प्राथमिकताएं' : 'Trip Preferences'}</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setInput({
                    days: 3,
                    startLocation: 'Ranchi',
                    budgetTier: 'moderate',
                    travellerType: 'couple',
                    interests: ['waterfall', 'eco', 'culture'],
                    travelIntensity: 'balanced',
                    language,
                  });
                  setCustomBudget('');
                }}
                className="text-[11px] text-ink-500 hover:text-ink-800 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="h-3 w-3" />
                <span>{t('common.clear', 'Reset')}</span>
              </button>
            </div>

            {/* 1. Starting City Gateway */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-800 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-clay-600" />
                <span>{t('ai.startingFrom', 'Starting City / Gateway')}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Ranchi', 'Jamshedpur', 'Deoghar', 'Dhanbad', 'Bokaro', 'Latehar (Netarhat)'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, startLocation: city }))}
                    className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${
                      input.startLocation === city
                        ? 'bg-forest-900 text-white shadow-xs'
                        : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Duration Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5 text-clay-600" />
                <span>{t('ai.tripDuration', 'Trip Duration')}</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { days: 1, label: language === 'hi' ? '1 दिन' : '1 Day' },
                  { days: 2, label: language === 'hi' ? '2 दिन' : '2 Days' },
                  { days: 3, label: language === 'hi' ? '3 दिन' : '3 Days' },
                  { days: 5, label: language === 'hi' ? '5 दिन' : '5 Days' },
                ].map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, days: opt.days }))}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      input.days === opt.days
                        ? 'bg-forest-900 text-white shadow-xs'
                        : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Travellers Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Users className="h-3.5 w-3.5 text-clay-600" />
                <span>{t('ai.travellerType', 'Who is Travelling?')}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'solo', label: language === 'hi' ? 'एकल' : 'Solo' },
                  { id: 'couple', label: language === 'hi' ? 'युगल' : 'Couple' },
                  { id: 'family', label: language === 'hi' ? 'परिवार' : 'Family' },
                  { id: 'friends', label: language === 'hi' ? 'मित्र' : 'Friends' },
                  { id: 'senior', label: language === 'hi' ? 'वरिष्ठ नागरिक' : 'Seniors' },
                ].map((trav) => (
                  <button
                    key={trav.id}
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, travellerType: trav.id as any }))}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      input.travellerType === trav.id
                        ? 'bg-forest-900 text-white shadow-xs'
                        : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                    }`}
                  >
                    {trav.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Budget Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-800 flex items-center gap-1.5 uppercase tracking-wider">
                <DollarSign className="h-3.5 w-3.5 text-clay-600" />
                <span>{t('ai.budgetTier', 'Budget Tier')}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'budget', label: language === 'hi' ? 'किफायती' : 'Budget' },
                  { id: 'moderate', label: language === 'hi' ? 'मध्यम' : 'Moderate' },
                  { id: 'premium', label: language === 'hi' ? 'प्रीमियम' : 'Premium' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, budgetTier: b.id as any }))}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      input.budgetTier === b.id
                        ? 'bg-forest-900 text-white shadow-xs'
                        : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <div className="pt-1">
                <Input
                  type="number"
                  placeholder={language === 'hi' ? 'वैकल्पिक: कस्टम बजट राशि (₹)' : 'Optional: Custom budget ₹ (e.g. 8000)'}
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  className="text-xs bg-white h-9"
                />
              </div>
            </div>

            {/* 5. Key Interests */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-800 uppercase tracking-wider">
                {t('ai.interests', 'Key Interests')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((int) => {
                  const selected = input.interests.includes(int.id);
                  return (
                    <button
                      key={int.id}
                      type="button"
                      onClick={() => handleInterestToggle(int.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                        selected
                          ? 'bg-clay-700 text-white shadow-2xs'
                          : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                      }`}
                    >
                      <span>{int.emoji}</span>
                      <span>{language === 'hi' ? int.labelHi : int.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Generate Button */}
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-forest-900 hover:bg-forest-800 text-white font-bold py-3 rounded-2xl shadow-md text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{isGenerating ? t('ai.curatingItinerary', 'Curating Itinerary...') : t('ai.generateItinerary', 'Generate AI Itinerary')}</span>
            </Button>
          </div>

          {/* Right Column: Generated Itinerary Preview (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {isGenerating ? (
              <div className="bg-[#FFFDF9] rounded-3xl p-12 border border-ink-200/90 shadow-md text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-forest-900 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-ink-950">
                    {t('ai.curatingItinerary', 'Johar AI is Curating Your Jharkhand Journey')}
                  </h3>
                  <p className="text-xs text-ink-500 max-w-md mx-auto">
                    {language === 'hi'
                      ? '24 जिलों के भू-स्थानिक डेटा, झरनों, आवासों एवं मौसम अलर्ट का विश्लेषण किया जा रहा है...'
                      : 'Synthesizing verified 24-district destinations, travel times, eco-stays, and safety advisories with Groq Llama 3.3...'}
                  </p>
                </div>
              </div>
            ) : itinerary ? (
              <div className="space-y-6">
                {/* Header Summary Card */}
                <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-ink-200/90 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="accent" className="text-xs font-bold py-0.5">
                          {itinerary.daysCount} {language === 'hi' ? 'दिवसीय योजना' : 'Days Circuit'}
                        </Badge>
                        <Badge variant="neutral" className="text-xs font-semibold py-0.5">
                          {input.startLocation} Gateway
                        </Badge>
                        <Badge variant="neutral" className="text-xs font-semibold py-0.5 capitalize">
                          {itinerary.travellerType}
                        </Badge>
                      </div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-950">
                        {itinerary.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
                        {itinerary.summary}
                      </p>
                    </div>

                    {/* Total Budget Card */}
                    <div className="shrink-0 rounded-2xl bg-amber-50/80 border border-amber-300/80 p-4 text-center min-w-[170px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                        {t('ai.estimatedBudget', 'Estimated Total Budget')}
                      </span>
                      <span className="text-lg sm:text-xl font-display font-extrabold text-ink-950 block">
                        {formatIndianCurrency(itinerary.estimatedTotalBudget.min)} – {formatIndianCurrency(itinerary.estimatedTotalBudget.max)}
                      </span>
                      <span className="text-[10px] text-ink-500 font-medium">
                        {language === 'hi' ? 'आवास एवं स्थानीय परिवहन सहित' : 'Includes stays & transport'}
                      </span>
                    </div>
                  </div>

                  {/* Best Season & Notes Strip */}
                  {itinerary.bestSeason && (
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ink-200/70 text-xs text-forest-900 bg-forest-50/70 p-3 rounded-2xl">
                      <Info className="h-4 w-4 text-forest-700 shrink-0" />
                      <span><strong>{language === 'hi' ? 'उत्तम मौसम:' : 'Best Season:'}</strong> {itinerary.bestSeason}</span>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink-200/70">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        onClick={handleSaveTrip}
                        disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                        className="bg-forest-900 text-white hover:bg-forest-800 text-xs font-bold rounded-xl py-2 px-4 flex items-center gap-1.5 shadow-sm"
                      >
                        <BookmarkPlus className="h-4 w-4" />
                        <span>
                          {saveStatus === 'saving'
                            ? (language === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...')
                            : saveStatus === 'saved'
                              ? (language === 'hi' ? 'सहेजा गया ✓' : 'Saved to Trips ✓')
                              : t('ai.saveToMyTrips', 'Save to My Trips')}
                        </span>
                      </Button>

                      <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="text-xs font-bold rounded-xl py-2 px-3 flex items-center gap-1.5"
                      >
                        <Link to={`/map?district=${input.startLocation}`}>
                          <MapIcon className="h-3.5 w-3.5 text-clay-700" />
                          <span>{t('common.viewOnMap', 'View on Map')}</span>
                        </Link>
                      </Button>
                    </div>

                    {saveMessage && (
                      <span className={`text-xs font-semibold ${saveStatus === 'saved' ? 'text-emerald-700' : 'text-clay-700'}`}>
                        {saveMessage}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day by Day Cards */}
                <div className="space-y-6">
                  {itinerary.days.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border border-ink-200/90 shadow-md space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-200/80 pb-3">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-extrabold uppercase tracking-widest text-clay-700">
                            {language === 'hi' ? `दिन ${day.dayNumber}` : `Day ${day.dayNumber}`} • {day.district} District
                          </span>
                          <h3 className="font-display text-lg font-bold text-ink-950">
                            {day.title}
                          </h3>
                        </div>
                        <span className="self-start sm:self-auto rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink-800">
                          {language === 'hi' ? 'दैनिक अनुमान:' : 'Est. Day Cost:'} {formatIndianCurrency(day.dayBudgetEstimate)}
                        </span>
                      </div>

                      {/* Time Slots (Morning / Afternoon / Evening) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {day.schedule.map((activity, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-ink-200/80 bg-white p-4 space-y-2.5 flex flex-col justify-between shadow-2xs hover:border-clay-400 transition"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="rounded-full bg-forest-100 text-forest-900 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
                                  {activity.timeSlot}
                                </span>
                                {activity.approxTravelTime && (
                                  <span className="text-[10px] text-ink-500 font-medium">
                                    {activity.approxTravelTime}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-bold text-xs text-ink-950 line-clamp-2">
                                {activity.title}
                              </h4>
                              <p className="text-[11px] text-ink-600 leading-relaxed line-clamp-3">
                                {activity.description}
                              </p>

                              {activity.reason && (
                                <p className="text-[10px] text-clay-800 italic bg-sand/40 p-1.5 rounded-lg">
                                  💡 {activity.reason}
                                </p>
                              )}
                            </div>

                            {activity.destination && (
                              <div className="pt-2 border-t border-ink-100 flex items-center justify-between">
                                <span className="text-[10px] text-ink-500 font-medium truncate max-w-[120px]">
                                  {activity.destination.name}
                                </span>
                                <Button
                                  asChild
                                  size="sm"
                                  variant="secondary"
                                  className="text-[10px] py-1 px-2 h-auto font-bold shrink-0"
                                >
                                  <Link to={`/destinations/${activity.destination.slug}`}>
                                    {t('common.viewDetails', 'Details')}
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Recommended Stay & Transport for the Day */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {day.recommendedStay && (
                          <div className="rounded-2xl bg-amber-50/50 border border-amber-300/70 p-3 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                              <Hotel className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                                {language === 'hi' ? 'अनुशंसित आवास' : 'Recommended Stay'}
                              </span>
                              <p className="text-xs font-bold text-ink-950 truncate">
                                {day.recommendedStay.name}
                              </p>
                            </div>
                            <Button
                              asChild
                              size="sm"
                              variant="secondary"
                              className="text-[10px] py-1 px-2.5 h-auto font-bold shrink-0"
                            >
                              <Link to={`/stays/${day.recommendedStay.id}`}>
                                {language === 'hi' ? 'देखें' : 'View'}
                              </Link>
                            </Button>
                          </div>
                        )}

                        {day.recommendedTransport && (
                          <div className="rounded-2xl bg-emerald-50/50 border border-emerald-300/70 p-3 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center shrink-0">
                              <Car className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                                {language === 'hi' ? 'अनुशंसित परिवहन' : 'Transport Option'}
                              </span>
                              <p className="text-xs font-bold text-ink-950 truncate">
                                {day.recommendedTransport.name}
                              </p>
                            </div>
                            <Button
                              asChild
                              size="sm"
                              variant="secondary"
                              className="text-[10px] py-1 px-2.5 h-auto font-bold shrink-0"
                            >
                              <Link to="/transport">
                                {language === 'hi' ? 'बुक करें' : 'Book'}
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Local Tips */}
                      {day.localTips && day.localTips.length > 0 && (
                        <div className="text-[11px] text-ink-600 bg-sand/50 p-3 rounded-2xl border border-ink-200/60 space-y-1">
                          <span className="font-bold text-ink-800">
                            {language === 'hi' ? 'स्थानीय सुझाव:' : 'Curator Tips:'}
                          </span>
                          <ul className="list-disc list-inside space-y-0.5">
                            {day.localTips.map((tip, i) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Important Travel Notes & Advisories */}
                {itinerary.importantTravelNotes && itinerary.importantTravelNotes.length > 0 && (
                  <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-amber-300 bg-amber-50/30 space-y-3">
                    <h4 className="font-bold text-xs text-amber-950 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-700" />
                      <span>{t('ai.activeAdvisories', 'Important Travel Notes & Guidelines')}</span>
                    </h4>
                    <ul className="list-disc list-inside text-xs text-ink-700 space-y-1">
                      {itinerary.importantTravelNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
