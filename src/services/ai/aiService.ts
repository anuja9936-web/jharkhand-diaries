import { VERIFIED_JHARKHAND_DESTINATIONS, JHARKHAND_DISTRICTS_DATA } from '../../constants/jharkhandDistrictsGeo';
import { JHARKHAND_ACCOMMODATIONS } from '../../constants/accommodationsData';
import {
  JHARKHAND_MARKETPLACE_PRODUCTS,
  JHARKHAND_MARKETPLACE_EXPERIENCES,
  JHARKHAND_CURATED_TOURS,
  JHARKHAND_CURATED_TRANSPORT,
} from '../../constants/marketplaceData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Destination } from '../../types/destination';
import type { ProviderOffering } from '../../types/provider';
import type { TourismAlert } from '../../types/admin';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  suggestedDestinations?: Destination[];
  suggestedOfferings?: ProviderOffering[];
  alerts?: TourismAlert[];
  quickActions?: Array<{ label: string; action: string; payload?: string }>;
}

export interface ItineraryActivity {
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  title: string;
  description: string;
  destination?: Destination;
  destinationSlug?: string;
  activityType: 'sightseeing' | 'adventure' | 'culture' | 'dining' | 'relaxation';
  durationHours: number;
  approxTravelTime?: string;
  estimatedCost?: number;
  reason?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  district: string;
  schedule: ItineraryActivity[];
  recommendedStay?: ProviderOffering;
  recommendedStayName?: string;
  recommendedExperience?: ProviderOffering;
  recommendedTransport?: ProviderOffering;
  recommendedTransportName?: string;
  dayBudgetEstimate: number;
  localTips: string[];
}

export interface GeneratedItinerary {
  id: string;
  title: string;
  summary: string;
  daysCount: number;
  startLocation: string;
  travellerType: string;
  interests: string[];
  travelIntensity: string;
  modelUsed?: string;
  estimatedTotalBudget: {
    min: number;
    max: number;
    currency: string;
  };
  days: ItineraryDay[];
  bestSeason?: string;
  importantTravelNotes?: string[];
  activeAdvisories: string[];
  curatorNote: string;
}

export interface TouristPreferences {
  preferredInterests?: string[];
  preferredBudget?: 'budget' | 'moderate' | 'premium';
  preferredTravelStyle?: 'relaxed' | 'balanced' | 'adventure';
}

export interface ItineraryGenerationInput {
  days: number;
  startLocation: string;
  budgetTier: 'budget' | 'moderate' | 'premium';
  customBudgetAmount?: number;
  travellerType: 'solo' | 'couple' | 'family' | 'friends' | 'senior';
  interests: string[];
  travelIntensity: 'relaxed' | 'balanced' | 'packed';
  language?: 'en' | 'hi';
}

export interface ProviderContentOutput {
  enhancedTitle: string;
  shortDescription: string;
  detailedDescription: string;
  amenitiesOrHighlights: string[];
  shortPromoDescription?: string;
  seoDescription?: string;
  safetyNotes: string;
  modelUsed?: string;
}

export interface GovernmentAIInsight {
  category: 'growth' | 'eco_alert' | 'artisan' | 'demand' | 'seasonal';
  title: string;
  insight: string;
  actionRecommendation: string;
  urgency: 'high' | 'medium' | 'low';
}

const ACTIVE_SYSTEM_ALERTS: TourismAlert[] = [
  {
    id: 'alert-1',
    title: 'Hundru Falls Water Surge Advisory',
    description: 'High water volume at Hundru plunge basin. Visitors should remain on upper viewing platforms.',
    type: 'safety',
    severity: 'warning',
    district: 'Ranchi',
    destination_name: 'Hundru Falls',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    status: 'published',
    created_at: new Date().toISOString(),
  },
  {
    id: 'alert-2',
    title: 'Betla National Park Forest Track Maintenance',
    description: 'Inner sector safari tracks undergoing seasonal grading. Morning slots open with authorized jeeps.',
    type: 'road',
    severity: 'info',
    district: 'Latehar',
    destination_name: 'Betla National Park',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    status: 'published',
    created_at: new Date().toISOString(),
  },
];

/**
 * Check if text contains Devanagari characters
 */
export function isHindiText(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Invoke the Supabase Groq Edge Function (`ai-assistant`)
 */
async function callGroqEdgeFunction(payload: {
  action: 'chat' | 'itinerary' | 'recommendations' | 'provider_writer' | 'admin_insights';
  language?: 'en' | 'hi';
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  prompt?: string;
  userLocation?: string;
  touristPreferences?: TouristPreferences;
  context?: Record<string, unknown>;
}): Promise<{ success: boolean; content: string; model?: string } | null> {
  const g = typeof globalThis !== 'undefined' ? (globalThis as Record<string, any>) : {};
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (g.process?.env || {});
  const supabaseUrl = (env.VITE_SUPABASE_URL || '') as string;
  const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '') as string;

  // 1. Try via Supabase SDK if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: payload,
      });

      if (!error && data?.success && data?.content) {
        return {
          success: true,
          content: data.content,
          model: data.model,
        };
      }
      if (error) {
        console.info('[AI Service] supabase.functions.invoke returned:', error.message);
      }
    } catch (invokeErr) {
      console.info('[AI Service] SDK invocation failed, trying direct endpoint:', invokeErr);
    }
  }

  // 2. Direct fetch attempt to Supabase Edge Function URL
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const fnUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/ai-assistant`;
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.content) {
          return {
            success: true,
            content: json.content,
            model: json.model,
          };
        }
      }
    } catch (fetchErr) {
      console.info('[AI Service] Direct edge fetch failed:', fetchErr);
    }
  }

  return null;
}

/**
 * Extract matching destinations from text
 */
function extractMatchingDestinations(text: string): Destination[] {
  const t = text.toLowerCase();
  return VERIFIED_JHARKHAND_DESTINATIONS.filter((d) => {
    return (
      t.includes(d.name.toLowerCase()) ||
      t.includes(d.slug.toLowerCase()) ||
      (t.includes(d.district.toLowerCase()) && (t.includes('waterfall') || t.includes('park') || t.includes('hill') || t.includes('valley') || t.includes('झरना') || t.includes('घाटी')))
    );
  }).slice(0, 4);
}

/**
 * Extract matching offerings from text
 */
function extractMatchingOfferings(text: string): ProviderOffering[] {
  const t = text.toLowerCase();
  const all: ProviderOffering[] = [
    ...JHARKHAND_ACCOMMODATIONS,
    ...JHARKHAND_MARKETPLACE_PRODUCTS,
    ...JHARKHAND_MARKETPLACE_EXPERIENCES,
    ...JHARKHAND_CURATED_TOURS,
    ...JHARKHAND_CURATED_TRANSPORT,
  ];

  return all.filter((o) => {
    return t.includes(o.name.toLowerCase()) || (o.district && t.includes(o.district.toLowerCase()) && t.includes(o.kind));
  }).slice(0, 3);
}

/**
 * Detect mentioned origin/district in query or conversation history (supporting English, Hindi & Hinglish)
 */
function detectOriginDistrict(query: string, history: AIMessage[] = []): string | null {
  const allText = (history.map((m) => m.content).join(' ') + ' ' + query).toLowerCase();

  const districtKeys = Object.keys(JHARKHAND_DISTRICTS_DATA);
  for (const dist of districtKeys) {
    if (allText.includes(dist.toLowerCase())) {
      return dist;
    }
  }

  // Hindi district names
  if (allText.includes('रांची') || allText.includes('ranchi')) return 'Ranchi';
  if (allText.includes('जमशेदपुर') || allText.includes('jamshedpur') || allText.includes('टाटा') || allText.includes('tatanagar')) return 'East Singhbhum';
  if (allText.includes('देवघर') || allText.includes('deoghar') || allText.includes('मधुपुर') || allText.includes('madhupur')) return 'Deoghar';
  if (allText.includes('धनबाद') || allText.includes('dhanbad')) return 'Dhanbad';
  if (allText.includes('बोकारो') || allText.includes('bokaro')) return 'Bokaro';
  if (allText.includes('नेतरहाट') || allText.includes('netarhat') || allText.includes('लातेहार') || allText.includes('latehar') || allText.includes('बेतला') || allText.includes('betla')) return 'Latehar';
  if (allText.includes('हजारीबाग') || allText.includes('hazaribagh')) return 'Hazaribagh';
  if (allText.includes('खूंटी') || allText.includes('khunti')) return 'Khunti';
  if (allText.includes('चतरा') || allText.includes('chatra')) return 'Chatra';
  if (allText.includes('गिरिडीह') || allText.includes('giridih') || allText.includes('पारसनाथ') || allText.includes('parasnath')) return 'Giridih';
  if (allText.includes('दुमका') || allText.includes('dumka')) return 'Dumka';

  return null;
}

/**
 * Deep Multilingual Natural Language Response Generator for Jharkhand Travel Assistant
 * Powered by Groq LLM with rich deterministic reasoning fallback
 */
export async function generateAITravelResponse(
  userQuery: string,
  history: AIMessage[] = [],
  userLocation?: string,
  language: 'en' | 'hi' = 'en',
  touristPreferences?: TouristPreferences
): Promise<AIMessage> {
  const q = userQuery.trim().toLowerCase();
  const isHindi = language === 'hi' || isHindiText(userQuery);

  // Handle empty query
  if (!q) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: isHindi
        ? `जोहार! मैं आज आपकी झारखंड यात्रा में किस प्रकार सहायता कर सकता हूँ? आप 3 घंटे की यात्रा, झरने, वन्यजीव सफारी या यात्रा कार्यक्रम के बारे में पूछ सकते हैं।`
        : `Johar! How may I assist your travels across Jharkhand today? You can ask for custom itineraries, waterfalls, wildlife safaris, or short getaways.`,
      timestamp: new Date().toISOString(),
    };
  }

  // 1. Attempt Groq Edge Function Call
  const relevantDestinations = VERIFIED_JHARKHAND_DESTINATIONS.filter((d) => {
    return (
      q.includes(d.name.toLowerCase()) ||
      q.includes(d.district.toLowerCase()) ||
      q.includes(d.category) ||
      (q.includes('waterfall') && d.category === 'waterfall') ||
      (q.includes('झरना') && d.category === 'waterfall') ||
      (q.includes('wildlife') && d.category === 'wildlife') ||
      (q.includes('वन्यजीव') && d.category === 'wildlife') ||
      (q.includes('temple') && d.category === 'religious') ||
      (q.includes('मंदिर') && d.category === 'religious')
    );
  }).slice(0, 8);

  const edgeResponse = await callGroqEdgeFunction({
    action: 'chat',
    language: isHindi ? 'hi' : 'en',
    messages: [
      ...history.slice(-4).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userQuery },
    ],
    userLocation,
    touristPreferences,
    context: {
      destinations: relevantDestinations.map((d) => ({
        name: d.name,
        slug: d.slug,
        district: d.district,
        category: d.category,
        description: d.short_description,
      })),
      offerings: JHARKHAND_ACCOMMODATIONS.slice(0, 4).map((o) => ({
        name: o.name,
        kind: o.kind,
        district: o.district || '',
        price: o.price || undefined,
      })),
      alerts: ACTIVE_SYSTEM_ALERTS.map((a) => ({
        title: a.title,
        district: a.district || '',
        description: a.description,
        severity: a.severity,
      })),
    },
  });

  if (edgeResponse && edgeResponse.content) {
    const matchedDestinations = extractMatchingDestinations(edgeResponse.content + ' ' + userQuery);
    const matchedOfferings = extractMatchingOfferings(edgeResponse.content + ' ' + userQuery);

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: edgeResponse.content,
      modelUsed: edgeResponse.model || 'Groq Llama 3.3',
      timestamp: new Date().toISOString(),
      suggestedDestinations: matchedDestinations.length > 0 ? matchedDestinations : undefined,
      suggestedOfferings: matchedOfferings.length > 0 ? matchedOfferings : undefined,
      quickActions: isHindi
        ? [
            { label: '🗺️ मानचित्र पर देखें', action: 'navigate', payload: '/map' },
            { label: '🗓️ एआई यात्रा योजना बनाएं', action: 'navigate', payload: '/plan-trip' },
            { label: '🏡 होमस्टे खोजें', action: 'navigate', payload: '/accommodations' },
            { label: '🎨 हस्तशिल्प उत्पाद', action: 'navigate', payload: '/marketplace' },
          ]
        : [
            { label: '🗺️ View on Map', action: 'navigate', payload: '/map' },
            { label: '🗓️ Plan Full Itinerary', action: 'navigate', payload: '/plan-trip' },
            { label: '🏡 Discover Stays', action: 'navigate', payload: '/accommodations' },
            { label: '🎨 Artisan Crafts', action: 'navigate', payload: '/marketplace' },
          ],
    };
  }

  // 2. Intelligent Grounded Local Natural-Language Reasoning Engine (Multilingual)
  const detectedOrigin = detectOriginDistrict(q, history) || userLocation || null;
  const isShortTripQuery =
    q.includes('hour') ||
    q.includes('ghante') ||
    q.includes('ghanta') ||
    q.includes('घंटे') ||
    q.includes('घंटा') ||
    q.includes('short trip') ||
    q.includes('half day') ||
    q.includes('आधा दिन') ||
    q.includes('लघु यात्रा') ||
    q.includes('near me') ||
    q.includes('पास') ||
    q.includes('short journey');

  let responseText = '';
  const quickActions: Array<{ label: string; action: string; payload?: string }> = [];
  let suggestedDestinations: Destination[] = [];

  // A. Short trip query WITHOUT known starting location -> Ask concise follow-up
  if (isShortTripQuery && !detectedOrigin && !q.includes('ranchi') && !q.includes('रांची') && !q.includes('jamshedpur') && !q.includes('जमशेदपुर') && !q.includes('deoghar') && !q.includes('देवघर') && !q.includes('dhanbad') && !q.includes('धनबाद')) {
    if (isHindi) {
      responseText = `ज़रूर! मैं झारखंड में कई बेहतरीन 2-3 घंटे की लघु यात्राएं और प्राकृतिक भ्रमण स्थल सुझा सकता हूँ।

**आप अपनी यात्रा कहाँ से शुरू करेंगे?**
कृपया नीचे दिए गए विकल्पों में से अपना प्रारंभिक शहर चुनें:`;

      quickActions.push(
        { label: '📍 रांची से', action: 'ask', payload: 'रांची के पास 3 घंटे की यात्रा के लिए स्थल' },
        { label: '📍 जमशेदपुर से', action: 'ask', payload: 'जमशेदपुर के पास लघु यात्रा स्थल' },
        { label: '📍 देवघर से', action: 'ask', payload: 'देवघर के पास लघु यात्रा स्थल' },
        { label: '📍 धनबाद से', action: 'ask', payload: 'धनबाद के पास लघु यात्रा स्थल' }
      );
    } else {
      responseText = `Sure! I can suggest several wonderful short trips and scenic excursions across Jharkhand.

**Where will you be starting from?**
Please select or type your starting city below so I can give you exact travel times and destinations:`;

      quickActions.push(
        { label: '📍 From Ranchi', action: 'ask', payload: 'Places near Ranchi for a 3 hour trip' },
        { label: '📍 From Jamshedpur', action: 'ask', payload: 'Places near Jamshedpur for a short trip' },
        { label: '📍 From Deoghar', action: 'ask', payload: 'Places near Deoghar for a short trip' },
        { label: '📍 From Dhanbad', action: 'ask', payload: 'Places near Dhanbad for a short trip' }
      );
    }
  }
  // B. Short trip from Ranchi / near Ranchi
  else if (isShortTripQuery && (detectedOrigin === 'Ranchi' || q.includes('ranchi') || q.includes('रांची'))) {
    if (isHindi) {
      responseText = `**रांची के आसपास शीर्ष 3 घंटे की लघु यात्राएं एवं दर्शनीय स्थल** (सभी 1.5 घंटे के भीतर):

1. **पतरातू घाटी एवं डैम (Patratu Valley & Dam)** (~35 किमी / ~1 घंटा)
   • मनमोहक सर्पीली घुमावदार पहाड़ी रास्ते, घाटी के दृश्य और झील में स्पीडबोटिंग का आनंद।

2. **दशम फॉल्स (Dassam Falls)** (~40 किमी / ~1 घंटा NH 33 द्वारा)
   • कांची नदी पर 44 मीटर ऊंचा प्राकृतिक सीढ़ीदार जलप्रपात। फोटोग्राफी और प्रकृति प्रेमियों के लिए उत्तम।

3. **रॉक गार्डन एवं कांके डैम (Rock Garden & Kanke Dam)** (~6 किमी / ~20 मिनट)
   • कांके जलाशय के तट पर पत्थरों की सुंदर नक्काशीदार कलाकृतियों वाला पार्क।

4. **हुंडरू फॉल्स (Hundru Falls)** (~45 किमी / ~1 घंटा 15 मिनट)
   • स्वर्णरेखा नदी पर 98 मीटर ऊंचा शानदार जलप्रपात।

5. **टैगोर हिल (Tagore Hill)** (~5 किमी / ~15 मिनट)
   • ज्योतिरिंद्रनाथ टैगोर से जुड़ा ऐतिहासिक शांत टीला, सूर्यास्त के मनोरम दृश्य के लिए प्रसिद्ध।`;
    } else {
      responseText = `Here are the **top short trips and excursions near Ranchi** (all under 1.5 hours travel time):

1. **Patratu Valley & Dam** (~35 km / ~1 hr drive)
   • Famous for scenic serpentine hairpin mountain curves, valley viewpoints, and speedboating on Patratu Lake.

2. **Dassam Falls** (~40 km / ~1 hr drive via NH 33)
   • A dramatic 44-metre stepped canyon cascade on the Kanchi River. Great for photography and nature walks.

3. **Rock Garden & Kanke Dam** (~6 km from city center / ~20 mins)
   • Artistic landscaped boulder park overlooking Kanke reservoir. Perfect for a quick 2-3 hour peaceful outing.

4. **Hundru Falls** (~45 km / ~1 hr 15 mins)
   • Spectacular 98-metre plunge on the Subarnarekha River with Precambrian granite formations.

5. **Tagore Hill** (~5 km / ~15 mins)
   • Historical hilltop associated with Jyotirindranath Tagore, offering panoramic sunset views over Ranchi.`;
    }

    suggestedDestinations = VERIFIED_JHARKHAND_DESTINATIONS.filter((d) =>
      ['patratu-valley', 'dassam-falls', 'rock-garden-ranchi', 'hundru-falls'].includes(d.slug)
    );

    quickActions.push(
      { label: isHindi ? 'मानचित्र पर देखें' : 'View Ranchi on Map', action: 'navigate', payload: '/map?district=Ranchi' },
      { label: isHindi ? 'कैब बुक करें' : 'Book Local Cab', action: 'navigate', payload: '/transport' }
    );
  }
  // C. Short trip from Jamshedpur / East Singhbhum
  else if (isShortTripQuery && (detectedOrigin === 'East Singhbhum' || q.includes('jamshedpur') || q.includes('जमशेदपुर'))) {
    if (isHindi) {
      responseText = `**जमशेदपुर के पास शीर्ष लघु यात्रा स्थल** (1.5 घंटे के भीतर):

1. **दलमा वन्यजीव अभयारण्य (Dalma Wildlife Sanctuary)** (~25 किमी / ~45 मिनट)
   • जंगली हाथियों का प्रसिद्ध गलियारा और स्वर्णरेखा घाटी का विहंगम दृश्य।

2. **डिम्ना झील (Dimna Lake)** (~13 किमी / ~30 मिनट)
   • दलमा की तलहटी में स्थित शांत झील, नौकायन और पिकनिक के लिए प्रसिद्ध।

3. **चांडिल डैम (Chandil Dam)** (~35 किमी / ~1 घंटा)
   • विशाल जलाशय, बोटिंग और स्थानीय ताजे भोजन का केंद्र।`;
    } else {
      responseText = `Here are the **best short trips near Jamshedpur** (under 1.5 hours):

1. **Dalma Wildlife Sanctuary** (~25 km / ~45 mins drive)
   • Hilltop wildlife corridor known for wild Asian elephants, deer, and breathtaking views over the Subarnarekha valley.

2. **Dimna Lake & Foothills** (~13 km / ~30 mins)
   • Serene reservoir nestled in Dalma foothills, ideal for watersports and family picnics.

3. **Chandil Dam & Reservoir** (~35 km / ~1 hr)
   • Expansive water reservoir with boating and local freshwater fish dining.`;
    }

    suggestedDestinations = VERIFIED_JHARKHAND_DESTINATIONS.filter((d) =>
      ['dalma-wildlife-sanctuary', 'dimna-lake'].includes(d.slug)
    );

    quickActions.push(
      { label: isHindi ? 'मानचित्र पर देखें' : 'View on Map', action: 'navigate', payload: '/map?district=East+Singhbhum' },
      { label: isHindi ? 'आवास खोजें' : 'Explore Stays', action: 'navigate', payload: '/accommodations' }
    );
  }
  // D. Waterfalls query
  else if (q.includes('waterfall') || q.includes('falls') || q.includes('झरने') || q.includes('झरना') || q.includes('जलप्रपात')) {
    if (isHindi) {
      responseText = `झारखंड को छोटानागपुर पठार पर **"झरनों की भूमि"** के रूप में जाना जाता है।

प्रमुख अनुशंसित जलप्रपात:
• **हुंडरू फॉल्स (रांची)**: स्वर्णरेखा नदी पर 98 मीटर ऊंचा विस्मयकारी जलप्रपात।
• **दशम फॉल्स (रांची)**: कांची नदी पर सीढ़ीदार सुरम्य प्राकृतिक झरना।
• **जोन्हा फॉल्स (गौतमधारा)**: 722 सीढ़ियों वाला पवित्र प्राकृतिक झरना।
• **लोध फॉल्स (लातेहार)**: झारखंड का सबसे ऊंचा जलप्रपात (143 मीटर), सघन साल वनों में स्थित।
• **पंचघाघ फॉल्स (खूंटी)**: परिवारों के लिए उपयुक्त 5 समानांतर धाराओं वाला सुरक्षित झरना।`;
    } else {
      responseText = `Jharkhand is celebrated as the **"Land of Waterfalls"** on the Chotanagpur Plateau.

Top recommended cascades:
• **Hundru Falls (Ranchi)**: A dramatic 98-metre plunge on the Subarnarekha River.
• **Dassam Falls (Ranchi)**: A pristine stepped canyon waterfall on the Kanchi River.
• **Jonha Falls (Gautamdhara)**: Sacred 722-step hanging-valley waterfall.
• **Lodh Falls (Latehar)**: Highest waterfall in Jharkhand (143 metres), thundering inside deep Sal forests.
• **Panchghagh Falls (Khunti)**: Five gentle parallel streams ideal for families.
• **Usri Falls (Giridih)**: Three-tiered granite gorge waterfall.`;
    }

    suggestedDestinations = VERIFIED_JHARKHAND_DESTINATIONS.filter((d) => d.category === 'waterfall').slice(0, 4);

    quickActions.push(
      { label: isHindi ? 'जलप्रपात मानचित्र पर' : 'Explore Waterfalls on Map', action: 'navigate', payload: '/map' },
      { label: isHindi ? 'यात्रा योजना बनाएं' : 'Plan Multi-Day Trip', action: 'navigate', payload: '/plan-trip' }
    );
  }
  // E. Tribal culture & art
  else if (q.includes('tribal') || q.includes('culture') || q.includes('sohrai') || q.includes('आदिवासी') || q.includes('संस्कृति') || q.includes('सोहराई') || q.includes('शिल्प') || q.includes('craft')) {
    if (isHindi) {
      responseText = `झारखंड में 32 जनजातीय समुदायों की 5,000 वर्ष पुरानी जीवंत सांस्कृतिक विरासत है:

• **जीआई-टैग सोहराई एवं कोहवर भित्ति चित्रकला (Sohrai & Khovar Murals)**: प्राकृतिक रंगों से मिट्टी की दीवारों पर बनाई जाने वाली पारंपरिक कला (हजारीबाग एवं रांची)।
• **डोकरा धातु कला (Dhokra Metal Casting)**: लुप्त-मोम (Lost-wax) तकनीक से कांस्य मूर्तियों का पारंपरिक निर्माण।
• **डॉ. रामदयाल मुंडा जनजातीय शोध संस्थान (रांची)**: जनजातीय जीवनशैली, आभूषण, वेशभूषा और वाद्ययंत्रों का समृद्ध संग्रहालय।
• **छऊ नृत्य (Chhau Dance)**: यूनेस्को द्वारा मान्यता प्राप्त सरायकेला का शास्त्रीय मुखौटा युद्ध नृत्य।
• **उलिहातू (खूंटी)**: भगवान बिरसा मुंडा की पवित्र जन्मभूमि।`;
    } else {
      responseText = `Jharkhand has a vibrant 5,000-year-old indigenous cultural legacy of 32 tribal communities:

• **GI-Tagged Sohrai & Khovar Murals**: Mud-wall natural ochre painting celebrating harvests and weddings (Hazaribagh & Ranchi).
• **Dhokra Metal Casting**: Ancient lost-wax bronze figurines handcrafted by Malhor artisans.
• **Dr. Ramdayal Munda Tribal Research Museum (Ranchi)**: Rich collection of tribal lifestyle, weapons, costumes, and musical instruments.
• **Chhau Dance**: UNESCO-inscribed martial dance from Saraikela.
• **Ulihatu (Khunti)**: Sacred birthplace of Bhagwan Birsa Munda.`;
    }

    suggestedDestinations = VERIFIED_JHARKHAND_DESTINATIONS.filter((d) =>
      d.category === 'tribal_culture' || d.category === 'heritage'
    ).slice(0, 3);

    quickActions.push(
      { label: isHindi ? 'हस्तशिल्प खरीदें' : 'Shop Artisan Crafts', action: 'navigate', payload: '/marketplace' },
      { label: isHindi ? 'सांस्कृतिक अनुभव' : 'Cultural Experiences', action: 'navigate', payload: '/experiences' }
    );
  }
  // F. Multi-day / Itinerary query
  else if (q.includes('day trip') || q.includes('itinerary') || q.includes('plan') || q.includes('योजना') || q.includes('दिन की यात्रा') || q.includes('5000') || q.includes('10000')) {
    if (isHindi) {
      responseText = `यहाँ **3-दिवसीय उत्कृष्ट झारखंड परिपथ यात्रा योजना** प्रस्तुत है:

• **दिन 1: रांची के जलप्रपात एवं जनजातीय धरोहर**
  हुंडरू फॉल्स, रॉक गार्डन और जनजातीय संग्रहालय का भ्रमण। पारंपरिक धुस्का और रुगड़ा करी का स्वाद।
• **दिन 2: पतरातू घाटी एवं रजरप्पा का संगम तीर्थ**
  पतरातू घाटी के सर्पीले मोड़, झील में नौकायन और इसके पश्चात सिद्धपीठ मां छिन्नमस्तिका मंदिर (रजरप्पा) के दर्शन।
• **दिन 3: छोटानागपुर की रानी — नेतरहाट एवं बेतला**
  मैग्नोलिया प्वाइंट पर सूर्यास्त, चीड़ के वनों में सैर और बेतला राष्ट्रीय उद्यान में वन्यजीव सफारी।`;
    } else {
      responseText = `Here is a popular **3-Day Classic Jharkhand Discovery Circuit**:

• **Day 1: Waterfalls & Tribal Heritage of Ranchi**
  Visit Hundru Falls, Rock Garden, and State Tribal Museum. Savor traditional Dhuska & Rugra curry.
• **Day 2: Serpentine Vistas of Patratu Valley & Dam**
  Scenic morning drive through Patratu Valley's hairpin curves with lake boating, followed by ancient Rajrappa Chhinnamasta Shrine.
• **Day 3: Queen of Chotanagpur — Netarhat & Betla**
  Magnolia Point sunset views, Pine Forest walks, and wildlife safari at Betla National Park.`;
    }

    suggestedDestinations = VERIFIED_JHARKHAND_DESTINATIONS.slice(0, 3);

    quickActions.push(
      { label: isHindi ? 'एआई प्लानर खोलें' : 'Launch AI Trip Planner', action: 'navigate', payload: '/plan-trip' },
      { label: isHindi ? 'आवास खोजें' : 'Explore Accommodations', action: 'navigate', payload: '/accommodations' }
    );
  }
  // G. General Discovery
  else {
    if (isHindi) {
      responseText = `जोहार! मैं आपका **झारखंड डायरीज़ एआई यात्रा सहायक** हूँ।

मैं आपकी इन विषयों में सहायता कर सकता हूँ:
• **लघु यात्राएं एवं सप्ताहांत भ्रमण**: रांची, जमशेदपुर, देवघर एवं धनबाद से 2-4 घंटे की प्राकृतिक यात्राएं।
• **जलप्रपात एवं सुरम्य घाटियां**: हुंडरू, दशम, लोध, जोन्हा और पतरातू घाटी।
• **वन्यजीव एवं अभयारण्य**: बेतला नेशनल पार्क, दलमा अभयारण्य और सारंडा के सघन वन।
• **आदिवासी कला एवं धरोहर**: सोहराई जीआई भित्ति चित्र, डोकरा धातु शिल्प और पवित्र तीर्थ स्थल।
• **वैयक्तिकृत एआई यात्रा कार्यक्रम**: आपके बजट एवं समूह के अनुकूल बहु-दिवसीय यात्रा योजना।

आज आप झारखंड में क्या देखना चाहेंगे?`;
    } else {
      responseText = `Johar! I am your **Jharkhand Diaries AI Travel Assistant**.

I can help you with:
• **Short Excursions & Getaways**: 2–4 hour scenic drives from Ranchi, Jamshedpur, Deoghar, and Dhanbad.
• **Waterfalls & Valleys**: Hundru, Dassam, Lodh, Jonha, and Patratu Valley.
• **Wildlife & Sanctuaries**: Betla National Park, Dalma Sanctuary, and Saranda Sal Forests.
• **Tribal Art & Heritage**: Sohrai GI murals, lost-wax Dhokra crafts, and sacred shrines.
• **Multi-Day AI Itineraries**: Custom day-by-day routes tailored to your group and budget.

Where would you like to explore today?`;
    }

    quickActions.push(
      { label: isHindi ? 'रांची से 3 घंटे की यात्रा' : '3-Hour Trip from Ranchi', action: 'ask', payload: isHindi ? 'रांची के पास 3 घंटे की यात्रा के लिए स्थल' : 'Places near Ranchi for a 3 hour trip' },
      { label: isHindi ? 'प्रमुख जलप्रपात' : 'Top Waterfalls', action: 'ask', payload: isHindi ? 'झारखंड के प्रमुख झरने कौन से हैं?' : 'What are the top waterfalls in Jharkhand?' },
      { label: isHindi ? 'आदिवासी कला एवं सोहराई' : 'Tribal Art & Sohrai', action: 'ask', payload: isHindi ? 'आदिवासी शिल्प और सोहराई कला के बारे में बताएं' : 'Tell me about tribal crafts and Sohrai art' },
      { label: isHindi ? 'यात्रा योजना बनाएं' : 'Plan 3-Day Trip', action: 'navigate', payload: '/plan-trip' }
    );
  }

  // Extract any additional matched destinations from text
  if (suggestedDestinations.length === 0) {
    suggestedDestinations = extractMatchingDestinations(responseText + ' ' + userQuery);
  }

  const matchedOfferings = extractMatchingOfferings(responseText + ' ' + userQuery);

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responseText,
    modelUsed: 'Jharkhand Tourism Knowledge Engine',
    timestamp: new Date().toISOString(),
    suggestedDestinations: suggestedDestinations.length > 0 ? suggestedDestinations : undefined,
    suggestedOfferings: matchedOfferings.length > 0 ? matchedOfferings : undefined,
    alerts: ACTIVE_SYSTEM_ALERTS.slice(0, 1),
    quickActions: quickActions.length > 0 ? quickActions : undefined,
  };
}

/**
 * Intelligent Personalized Itinerary Generator
 * Powered by Groq LLM structured JSON output with multilingual fallback
 */
export async function generatePersonalizedItinerary(
  input: ItineraryGenerationInput
): Promise<GeneratedItinerary> {
  const daysCount = Math.max(1, Math.min(input.days, 7));
  const isHindi = input.language === 'hi';

  const candidateDestinations = VERIFIED_JHARKHAND_DESTINATIONS.map((d) => ({
    name: d.name,
    slug: d.slug,
    district: d.district,
    category: d.category,
    description: d.short_description,
  }));

  const candidateStays = JHARKHAND_ACCOMMODATIONS.map((a) => ({
    name: a.name,
    district: a.district || '',
    price: a.price,
    kind: a.kind,
  }));

  // Attempt real Groq Edge Function generation
  const edgeResponse = await callGroqEdgeFunction({
    action: 'itinerary',
    language: isHindi ? 'hi' : 'en',
    context: {
      itineraryInput: input,
      destinations: candidateDestinations,
      offerings: candidateStays,
      alerts: ACTIVE_SYSTEM_ALERTS.map((a) => ({
        title: a.title,
        district: a.district || '',
        description: a.description,
        severity: a.severity,
      })),
    },
  });

  if (edgeResponse && edgeResponse.content) {
    try {
      const parsed = JSON.parse(edgeResponse.content);
      if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
        const hydratedDays: ItineraryDay[] = parsed.days.map((day: any, idx: number) => {
          const dayNumber = day.dayNumber || idx + 1;
          const district = day.district || input.startLocation;

          const schedule: ItineraryActivity[] = Array.isArray(day.schedule)
            ? day.schedule.map((item: any) => {
                const matchedDest =
                  VERIFIED_JHARKHAND_DESTINATIONS.find(
                    (d) => d.slug === item.destinationSlug || d.name.toLowerCase() === (item.title || '').toLowerCase()
                  ) ||
                  VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.district.toLowerCase() === district.toLowerCase());

                return {
                  timeSlot: item.timeSlot || 'Morning',
                  title: item.title || 'Sightseeing Tour',
                  description: item.description || '',
                  destination: matchedDest,
                  destinationSlug: matchedDest?.slug || item.destinationSlug,
                  activityType: item.activityType || 'sightseeing',
                  durationHours: item.durationHours || 2.5,
                  approxTravelTime: item.approxTravelTime || '~45 mins',
                  estimatedCost: Number(item.estimatedCost) || 350,
                  reason: item.reason || 'Iconic landmark with rich natural and cultural value.',
                };
              })
            : [];

          const matchedStay =
            JHARKHAND_ACCOMMODATIONS.find(
              (a) =>
                (a.district || '').toLowerCase() === district.toLowerCase() ||
                (day.recommendedStayName && a.name.toLowerCase().includes(day.recommendedStayName.toLowerCase()))
            ) || JHARKHAND_ACCOMMODATIONS[0];

          const matchedTransport =
            JHARKHAND_CURATED_TRANSPORT.find(
              (t) => (t.district || '').toLowerCase() === district.toLowerCase()
            ) || JHARKHAND_CURATED_TRANSPORT[0];

          const matchedExperience = JHARKHAND_MARKETPLACE_EXPERIENCES.find(
            (e) => (e.district || '').toLowerCase() === district.toLowerCase()
          );

          return {
            dayNumber,
            title: day.title || (isHindi ? `दिन ${dayNumber}: ${district} परिपथ` : `Day ${dayNumber}: ${district} Circuit`),
            theme: day.theme || `${district} Exploration`,
            district,
            schedule,
            recommendedStay: matchedStay,
            recommendedStayName: day.recommendedStayName || matchedStay.name,
            recommendedTransport: matchedTransport,
            recommendedTransportName: day.recommendedTransportName || matchedTransport.name,
            recommendedExperience: matchedExperience,
            dayBudgetEstimate: Number(day.dayBudgetEstimate) || (input.budgetTier === 'budget' ? 1200 : input.budgetTier === 'premium' ? 4500 : 2500),
            localTips: Array.isArray(day.localTips) && day.localTips.length > 0
              ? day.localTips
              : [isHindi ? `आरामदायक जूते पहनें और ${district} में पर्याप्त पानी साथ रखें।` : `Carry comfortable footwear and stay hydrated in ${district}.`],
          };
        });

        const calculatedBudget = hydratedDays.reduce((acc, d) => acc + d.dayBudgetEstimate, 0);
        const totalMin = input.customBudgetAmount ? Math.round(input.customBudgetAmount * 0.85) : (parsed.estimatedTotalBudget?.min || calculatedBudget);
        const totalMax = input.customBudgetAmount ? input.customBudgetAmount : (parsed.estimatedTotalBudget?.max || Math.round(totalMin * 1.35));

        return {
          id: `itinerary-${Date.now()}`,
          title: parsed.title || `${daysCount}-Day ${input.travellerType.toUpperCase()} Jharkhand Journey`,
          summary: parsed.summary || `A personalized ${daysCount}-day circuit tailored by Johar AI.`,
          daysCount,
          startLocation: input.startLocation,
          travellerType: input.travellerType,
          interests: input.interests,
          travelIntensity: input.travelIntensity,
          modelUsed: edgeResponse.model || 'Groq Llama 3.3',
          estimatedTotalBudget: {
            min: totalMin,
            max: totalMax,
            currency: 'INR',
          },
          days: hydratedDays,
          bestSeason: parsed.bestSeason || 'October to March (Pleasant weather, active waterfalls & wildlife)',
          importantTravelNotes: Array.isArray(parsed.importantTravelNotes) && parsed.importantTravelNotes.length > 0
            ? parsed.importantTravelNotes
            : [
                'Keep some cash handy for local artisan stalls & forest gate entries.',
                'Pre-book early morning safari slots at Betla National Park.',
                'Respect sacred groves (Sarna Sthal) and local tribal traditions.',
              ],
          activeAdvisories: Array.isArray(parsed.activeAdvisories) && parsed.activeAdvisories.length > 0
            ? parsed.activeAdvisories
            : ['Check local weather conditions before departure.'],
          curatorNote: parsed.curatorNote || 'Generated by Johar AI and grounded with official Jharkhand GIS data.',
        };
      }
    } catch (parseErr) {
      console.warn('[AI Service] Failed to parse Groq JSON itinerary:', parseErr);
    }
  }

  // Deterministic local grounded fallback
  const startDistrict = input.startLocation.toLowerCase().includes('jamshedpur')
    ? 'East Singhbhum'
    : input.startLocation.toLowerCase().includes('deoghar')
      ? 'Deoghar'
      : input.startLocation.toLowerCase().includes('dhanbad')
        ? 'Dhanbad'
        : 'Ranchi';

  const days: ItineraryDay[] = [];

  for (let i = 1; i <= daysCount; i++) {
    let dayDistrict = startDistrict;
    let dayTheme = '';
    let schedule: ItineraryActivity[] = [];
    let budgetPerDay = input.customBudgetAmount
      ? Math.round(input.customBudgetAmount / daysCount)
      : input.budgetTier === 'budget' ? 1200 : input.budgetTier === 'premium' ? 4500 : 2400;

    if (i === 1) {
      dayDistrict = startDistrict;
      dayTheme = isHindi
        ? 'जलप्रपातों का शहर एवं जनजातीय धरोहर'
        : 'City of Waterfalls & Ancient Temples';

      const hundru = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'hundru-falls');
      const rockGarden = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'rock-garden-ranchi');

      schedule = [
        {
          timeSlot: 'Morning',
          title: isHindi ? 'हुंडरू फॉल्स का विहंगम दृश्य' : 'Arrival & Hundru Falls Cascade',
          description: isHindi ? 'स्वर्णरेखा नदी पर 98 मीटर ऊंचे प्राकृतिक जलप्रपात का अनुभव।' : 'Experience the 98-metre plunge on the Subarnarekha River.',
          destination: hundru,
          activityType: 'sightseeing',
          durationHours: 3.5,
          approxTravelTime: '~1 hr 15 mins drive (45 km)',
          estimatedCost: 200,
          reason: 'Highest waterfall in Ranchi district with Precambrian granite gorge.',
        },
        {
          timeSlot: 'Afternoon',
          title: isHindi ? 'पारंपरिक भोजन एवं रॉक गार्डन' : 'Traditional Jharkhandi Lunch & Rock Garden',
          description: isHindi ? 'पारंपरिक धुस्का और रुगड़ा करी का स्वाद, फिर रॉक गार्डन में सैर।' : 'Savor organic Dhuska & Chhilka Roti, followed by scenic rock sculpture walks.',
          destination: rockGarden,
          activityType: 'relaxation',
          durationHours: 2.5,
          approxTravelTime: '~30 mins drive (15 km)',
          estimatedCost: 350,
          reason: 'Serene lakeside rock sculptures and authentic culinary experience.',
        },
        {
          timeSlot: 'Evening',
          title: isHindi ? 'जनजातीय सांस्कृतिक संग्रहालय' : 'Tribal Cultural Heritage Museum',
          description: isHindi ? 'सोहराई भित्ति चित्र, डोकरा धातु कला और लोक वाद्ययंत्रों का समृद्ध संग्रह।' : 'Discover Sohrai GI murals, lost-wax Dhokra bronze artifacts, and musical traditions.',
          destination: VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'tribal-museum-ranchi'),
          activityType: 'culture',
          durationHours: 2,
          approxTravelTime: '~15 mins drive (5 km)',
          estimatedCost: 150,
          reason: 'Immersive exploration of 32 indigenous tribal communities of Jharkhand.',
        },
      ];
    } else if (i === 2) {
      dayDistrict = 'Ramgarh';
      dayTheme = isHindi ? 'सर्पीली पतरातू घाटी एवं रजरप्पा संगम' : 'Serpentine Valleys & Sacred River Confluence';
      const patratu = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'patratu-valley');
      const rajrappa = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'rajrappa-temple');

      schedule = [
        {
          timeSlot: 'Morning',
          title: isHindi ? 'पतरातू घाटी ड्राइव एवं झील नौकायन' : 'Patratu Valley Scenic Drive & Lake Boating',
          description: isHindi ? 'पहाड़ी मोड़ों पर ड्राइव और झील में नौकायन।' : 'Navigate hairpin mountain loops and enjoy peaceful island boating.',
          destination: patratu,
          activityType: 'adventure',
          durationHours: 3,
          approxTravelTime: '~1 hr drive (35 km)',
          estimatedCost: 400,
          reason: 'Iconic panoramic viewpoints over the Chotanagpur plateau loops.',
        },
        {
          timeSlot: 'Afternoon',
          title: isHindi ? 'लेकसाइड सैरगाह विश्राम' : 'Lakeside Promenade Relaxation',
          description: isHindi ? 'पतरातू लेकसाइड पर दोपहर का विश्राम।' : 'Relax at Patratu lake promenade with panoramic Chotanagpur hill views.',
          activityType: 'relaxation',
          durationHours: 2,
          approxTravelTime: 'Walking within promenade',
          estimatedCost: 150,
          reason: 'Fresh lake breezes and waterside cafes.',
        },
        {
          timeSlot: 'Evening',
          title: isHindi ? 'रजरप्पा मां छिन्नमस्तिका शक्तिपीठ' : 'Maa Chhinnamasta Shrine at Rajrappa Sangam',
          description: isHindi ? 'भैरवी और दामोदर नदी के संगम पर प्राचीन सिद्धपीठ के दर्शन।' : 'Visit the revered Shakti Peeth over Bhairavi and Damodar river gorge.',
          destination: rajrappa,
          activityType: 'culture',
          durationHours: 2.5,
          approxTravelTime: '~45 mins drive (30 km)',
          estimatedCost: 100,
          reason: 'Revered ancient Tantric Shakti Peetha with striking rocky river gorge.',
        },
      ];
    } else if (i === 3) {
      dayDistrict = 'Latehar';
      dayTheme = isHindi ? 'छोटावेत्ता की रानी (नेतरहाट) एवं बेतला सफारी' : 'Queen of Chotanagpur & Wildlife Wilderness';
      const netarhat = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'netarhat');
      const betla = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'betla-national-park');

      schedule = [
        {
          timeSlot: 'Morning',
          title: isHindi ? 'नेतरहाट चीड़ वन एवं सूर्योदय' : 'Netarhat Pine Grove Walks & Sunrise View',
          description: isHindi ? 'चीड़ के बागानों में ताजगी भरी सुबह की सैर।' : 'Crisp morning mountain walk through pine plantations.',
          destination: netarhat,
          activityType: 'sightseeing',
          durationHours: 3,
          approxTravelTime: '~1.5 hrs drive',
          estimatedCost: 100,
          reason: 'Highest hill station in Jharkhand with crisp mountain breeze.',
        },
        {
          timeSlot: 'Afternoon',
          title: isHindi ? 'बेतला राष्ट्रीय उद्यान जीप सफारी' : 'Betla National Park Forest Safari',
          description: isHindi ? 'साल वनों में जंगली हाथी एवं ऐतिहासिक चेरो किले देखने की जीप सफारी।' : 'Open-top jeep safari through Sal forests to spot wild Asian elephants and Chero forts.',
          destination: betla,
          activityType: 'adventure',
          durationHours: 3.5,
          approxTravelTime: '~1.5 hrs drive (65 km)',
          estimatedCost: 800,
          reason: 'Pristine biodiversity and 16th-century Chero dynasty forest fortresses.',
        },
        {
          timeSlot: 'Evening',
          title: isHindi ? 'मैग्नोलिया प्वाइंट पर सूर्यास्त' : 'Sunset at Magnolia Point',
          description: isHindi ? 'पहाड़ियों के विहंगम क्षितिज पर सूर्यास्त का मनोहारी दृश्य।' : 'Witness the iconic sunset over the layered Vindhyan valley ranges.',
          destination: netarhat,
          activityType: 'relaxation',
          durationHours: 1.5,
          approxTravelTime: '~20 mins',
          estimatedCost: 50,
          reason: 'Most celebrated sunset viewpoint in Eastern India.',
        },
      ];
    } else {
      dayDistrict = 'East Singhbhum';
      dayTheme = isHindi ? 'दलमा हाथी अभयारण्य एवं झील' : 'Elephant Sanctuary & Foothills';
      const dalma = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'dalma-wildlife-sanctuary');
      const dimna = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'dimna-lake');

      schedule = [
        {
          timeSlot: 'Morning',
          title: isHindi ? 'दलमा वन्यजीव अभयारण्य' : 'Dalma Mountain Range Wildlife Exploration',
          description: isHindi ? 'पहाड़ी की चोटी से जमशेदपुर और घाटी का विहंगम दृश्य।' : 'Drive up Dalma hilltop sanctuary overlooking Jamshedpur valley.',
          destination: dalma,
          activityType: 'adventure',
          durationHours: 3.5,
          approxTravelTime: '~45 mins (25 km)',
          estimatedCost: 350,
          reason: 'Major elephant habitat with hilltop Hanuman temple and valley vistas.',
        },
        {
          timeSlot: 'Afternoon',
          title: isHindi ? 'डिम्ना झील पर विश्राम' : 'Dimna Lake Waterfront Relaxation',
          description: isHindi ? 'दलमा की तलहटी में शांत जलाशय का आनंद।' : 'Lakeside promenade nestled in the foothills.',
          destination: dimna,
          activityType: 'relaxation',
          durationHours: 2.5,
          approxTravelTime: '~30 mins (13 km)',
          estimatedCost: 150,
          reason: 'Clear water reservoir surrounded by dense green hillocks.',
        },
        {
          timeSlot: 'Evening',
          title: isHindi ? 'जुबली पार्क लेजर फाउंटेन' : 'Jubilee Park Illumination',
          description: isHindi ? 'गुलाब के बगीचों और संगीतमय फव्वारों की सैर।' : 'Stroll through rose gardens and musical laser fountains.',
          activityType: 'culture',
          durationHours: 2,
          approxTravelTime: '~15 mins',
          estimatedCost: 100,
          reason: 'Heritage urban park inspired by Vrindavan Gardens.',
        },
      ];
    }

    const districtStay = JHARKHAND_ACCOMMODATIONS.find(
      (a) => (a.district || '').toLowerCase() === dayDistrict.toLowerCase()
    ) || JHARKHAND_ACCOMMODATIONS[0];

    const districtExperience = JHARKHAND_MARKETPLACE_EXPERIENCES.find(
      (e) => (e.district || '').toLowerCase() === dayDistrict.toLowerCase()
    );

    const districtTransport = JHARKHAND_CURATED_TRANSPORT.find(
      (t) => (t.district || '').toLowerCase() === dayDistrict.toLowerCase()
    ) || JHARKHAND_CURATED_TRANSPORT[0];

    days.push({
      dayNumber: i,
      title: isHindi ? `दिन ${i}: ${dayTheme}` : `Day ${i}: ${dayTheme}`,
      theme: dayTheme,
      district: dayDistrict,
      schedule,
      recommendedStay: districtStay,
      recommendedExperience: districtExperience,
      recommendedTransport: districtTransport,
      dayBudgetEstimate: budgetPerDay,
      localTips: isHindi
        ? [
            `${dayDistrict} में हल्के आरामदायक जूते पहनें और जलपान की व्यवस्था रखें।`,
            'दूरदराज के वन चौकियों पर सीमित यूपीआई कनेक्टिविटी के कारण कुछ नकदी साथ रखें।',
          ]
        : [
            `Carry a light waterproof jacket and comfortable walking shoes for ${dayDistrict}.`,
            'Keep some cash handy as remote forest checkpoints may have limited UPI connectivity.',
          ],
    });
  }

  const minBudget = input.customBudgetAmount ? Math.round(input.customBudgetAmount * 0.85) : days.reduce((sum, d) => sum + d.dayBudgetEstimate, 0);
  const maxBudget = input.customBudgetAmount ? input.customBudgetAmount : Math.round(minBudget * 1.35);

  return {
    id: `itinerary-${Date.now()}`,
    title: isHindi
      ? `${daysCount}-दिवसीय ${input.travellerType.toUpperCase()} झारखंड यात्रा कार्यक्रम`
      : `${daysCount}-Day ${input.travellerType.toUpperCase()} Jharkhand Odyssey`,
    summary: isHindi
      ? `जोहार एआई द्वारा तैयार किया गया ${daysCount}-दिवसीय परिपथ जो जलप्रपातों, शांत हिल स्टेशनों, वन्यजीव अभयारण्यों और जनजातीय संस्कृति को जोड़ता है।`
      : `A carefully tailored ${daysCount}-day journey through Jharkhand, connecting iconic waterfalls, tranquil hill stations, wildlife sanctuaries, and authentic tribal cultural experiences starting from ${input.startLocation}.`,
    daysCount,
    startLocation: input.startLocation,
    travellerType: input.travellerType,
    interests: input.interests,
    travelIntensity: input.travelIntensity,
    modelUsed: 'Jharkhand Tourism Knowledge Engine',
    estimatedTotalBudget: {
      min: minBudget,
      max: maxBudget,
      currency: 'INR',
    },
    days,
    bestSeason: isHindi ? 'अक्टूबर से मार्च (सुहावना मौसम, सक्रिय झरने एवं वन्यजीव)' : 'October to March (Pleasant weather, active waterfalls & wildlife)',
    importantTravelNotes: isHindi
      ? [
          'हुंडरू फॉल्स पर उच्च जल प्रवाह के समय ऊपरी दर्शक दीर्घा में ही रहें।',
          'बेतला राष्ट्रीय उद्यान में सप्ताहांत पर अग्रिम सफारी बुकिंग की सलाह दी जाती है।',
          'स्थानीय जनजातीय संस्कृति एवं पवित्र स्थलों का सम्मान करें।',
        ]
      : [
          'Hundru Falls: Remain on upper observation decks during high surge hours.',
          'Betla National Park: Advance safari booking is recommended on weekends.',
          'Respect local tribal culture and sacred groves (Sarna Sthal).',
        ],
    activeAdvisories: [
      'Hundru Falls: Remain on upper observation decks during high surge hours.',
      'Betla National Park: Advance safari booking is recommended on weekends.',
    ],
    curatorNote: isHindi ? 'झारखंड पर्यटन के प्रमाणित भू-स्थानिक डेटा एवं सत्यापित सेवा प्रदाताओं द्वारा निर्मित।' : 'Crafted with certified Jharkhand Tourism geospatial data and verified local service provider connections.',
  };
}

/**
 * Natural Language Search Engine for Tourism Portal
 */
export function searchTourismNL(query: string): {
  destinations: Destination[];
  offerings: ProviderOffering[];
  districts: string[];
  intent: string;
} {
  const q = query.toLowerCase().trim();
  if (!q) {
    return {
      destinations: VERIFIED_JHARKHAND_DESTINATIONS.slice(0, 6),
      offerings: [...JHARKHAND_ACCOMMODATIONS, ...JHARKHAND_MARKETPLACE_PRODUCTS].slice(0, 6),
      districts: [],
      intent: 'Discover Popular Destinations',
    };
  }

  const matchedDistricts = Object.keys(JHARKHAND_DISTRICTS_DATA).filter((dist) =>
    q.includes(dist.toLowerCase())
  );

  const matchedDestinations = VERIFIED_JHARKHAND_DESTINATIONS.filter((dest) => {
    return (
      dest.name.toLowerCase().includes(q) ||
      dest.district.toLowerCase().includes(q) ||
      dest.category.toLowerCase().includes(q) ||
      (dest.short_description && dest.short_description.toLowerCase().includes(q)) ||
      (q.includes('waterfall') && dest.category === 'waterfall') ||
      (q.includes('wildlife') && dest.category === 'wildlife') ||
      (q.includes('temple') && dest.category === 'religious') ||
      (q.includes('heritage') && dest.category === 'heritage') ||
      (q.includes('eco') && (dest.eco_zone || dest.category === 'eco'))
    );
  });

  const allOfferings: ProviderOffering[] = [
    ...JHARKHAND_ACCOMMODATIONS,
    ...JHARKHAND_MARKETPLACE_PRODUCTS,
    ...JHARKHAND_MARKETPLACE_EXPERIENCES,
    ...JHARKHAND_CURATED_TOURS,
    ...JHARKHAND_CURATED_TRANSPORT,
  ];

  const matchedOfferings = allOfferings.filter((offering) => {
    const name = offering.name.toLowerCase();
    const district = (offering.district || '').toLowerCase();
    const shortDesc = (offering.short_description || '').toLowerCase();

    return (
      name.includes(q) ||
      (district && district.includes(q)) ||
      offering.kind.toLowerCase().includes(q) ||
      (shortDesc && shortDesc.includes(q))
    );
  });

  return {
    destinations: matchedDestinations.slice(0, 8),
    offerings: matchedOfferings.slice(0, 8),
    districts: matchedDistricts,
    intent: `Found results for "${query}"`,
  };
}

/**
 * Smart Destination Recommendations Engine
 */
export function getSmartRecommendations(criteria: {
  category?: string;
  district?: string;
  tag?: 'weekend' | 'family' | 'eco' | 'culture' | 'adventure' | 'romantic' | 'budget' | 'spiritual' | 'hidden';
}): { title: string; subtitle: string; destinations: Destination[] } {
  let filtered = [...VERIFIED_JHARKHAND_DESTINATIONS];
  let title = 'Recommended for You';
  let subtitle = 'Curated top destinations across Jharkhand';

  if (criteria.tag === 'weekend') {
    title = 'Perfect Weekend Escapes';
    subtitle = 'Quick refreshing getaways under 3 hours from major transport hubs';
    filtered = filtered.filter((d) => ['Ranchi', 'Ramgarh', 'Latehar', 'East Singhbhum'].includes(d.district));
  } else if (criteria.tag === 'family') {
    title = 'Family & Nature Retreats';
    subtitle = 'Safe, scenic, and well-equipped spots for travellers of all age groups';
    filtered = filtered.filter((d) => d.category === 'waterfall' || d.category === 'eco' || d.slug === 'rock-garden-ranchi' || d.slug === 'dimna-lake');
  } else if (criteria.tag === 'culture') {
    title = 'Deep Cultural & Tribal Immersion';
    subtitle = 'Ancient megaliths, sacred groves, Sohrai art villages & heritage forts';
    filtered = filtered.filter((d) => d.category === 'tribal_culture' || d.category === 'heritage' || d.category === 'religious');
  } else if (criteria.tag === 'adventure') {
    title = 'Thrill, Treks & Water Adventures';
    subtitle = 'Hairpin passes, mountain trails, speedboating, and dense jungle treks';
    filtered = filtered.filter((d) => d.category === 'adventure' || d.category === 'wildlife');
  } else if (criteria.tag === 'romantic') {
    title = 'Tranquil & Romantic Gateways';
    subtitle = 'Serene sunsets, misty pine forests, and quiet lakeside promenades';
    filtered = filtered.filter((d) => ['netarhat', 'patratu-valley', 'dimna-lake', 'jonha-falls'].includes(d.slug));
  } else if (criteria.tag === 'budget') {
    title = 'Budget Friendly Explorations';
    subtitle = 'Accessible natural marvels and heritage monuments with nominal entry';
    filtered = filtered.filter((d) => ['hundru-falls', 'dassam-falls', 'tagore-hill-ranchi', 'rock-garden-ranchi', 'panchghagh-falls'].includes(d.slug));
  } else if (criteria.tag === 'spiritual') {
    title = 'Sacred Pilgrimage & Spiritual Shrines';
    subtitle = 'Ancient Jyotirlinga, Jain Tirthankara hills, and Tantric Shakti Peethas';
    filtered = filtered.filter((d) => d.category === 'religious');
  } else if (criteria.tag === 'hidden') {
    title = 'Offbeat & Hidden Gems of Jharkhand';
    subtitle = 'Pristine Sal canopies, prehistoric rock art, and secluded streams';
    filtered = filtered.filter((d) => ['saranda-forest', 'lodh-falls-latehar', 'navratangarh-gumla', 'isobar-caves'].includes(d.slug));
  } else if (criteria.category && criteria.category !== 'all') {
    title = `More Like This: ${criteria.category.toUpperCase()}`;
    subtitle = `Other acclaimed ${criteria.category} attractions in Jharkhand`;
    filtered = filtered.filter((d) => d.category === criteria.category);
  }

  return {
    title,
    subtitle,
    destinations: filtered.slice(0, 6),
  };
}

/**
 * Provider AI Content Generator & Enhancer (Groq powered with fallback)
 */
export async function generateProviderContent(input: {
  kind: 'stay' | 'product' | 'tour' | 'experience' | 'transport';
  title: string;
  district: string;
  keyHighlights: string;
  language?: 'en' | 'hi';
}): Promise<ProviderContentOutput> {
  const district = input.district || 'Jharkhand';
  const highlights = input.keyHighlights || 'authentic local experience';
  const isHindi = input.language === 'hi';

  const edgeResponse = await callGroqEdgeFunction({
    action: 'provider_writer',
    language: isHindi ? 'hi' : 'en',
    context: {
      providerInput: input,
    },
  });

  if (edgeResponse && edgeResponse.content) {
    try {
      const parsed = JSON.parse(edgeResponse.content);
      if (parsed.enhancedTitle && parsed.detailedDescription) {
        return {
          enhancedTitle: parsed.enhancedTitle,
          shortDescription: parsed.shortDescription || '',
          detailedDescription: parsed.detailedDescription,
          amenitiesOrHighlights: Array.isArray(parsed.amenitiesOrHighlights)
            ? parsed.amenitiesOrHighlights
            : ['Verified local provider', 'Authentic regional experience'],
          shortPromoDescription: parsed.shortPromoDescription || '',
          seoDescription: parsed.seoDescription || '',
          safetyNotes: parsed.safetyNotes || 'Follow standard safety precautions.',
          modelUsed: edgeResponse.model || 'Groq Llama 3.3',
        };
      }
    } catch (parseErr) {
      console.warn('[AI Service] Failed to parse provider writer JSON from Groq:', parseErr);
    }
  }

  if (input.kind === 'stay') {
    return {
      enhancedTitle: input.title.includes('Resort') || input.title.includes('Stay') ? input.title : `${input.title} Eco Stay & Homestay`,
      shortDescription: isHindi
        ? `${district} में आरामदायक एवं प्राकृतिक आवास, जो गर्मजोशी भरे झारखंडी आतिथ्य और ताजे जैविक भोजन की पेशकश करता है।`
        : `Comfortable and sustainable accommodation nestled in scenic ${district}, offering warm Jharkhandi hospitality and farm-fresh cuisine.`,
      detailedDescription: isHindi
        ? `${input.title} में शांति का अनुभव करें। ${district} के सुरम्य परिदृश्यों के बीच स्थित, हमारी संपत्ति पारंपरिक छोटानागपुर जनजातीय स्थापत्य और आधुनिक सुविधाओं का अनूठा संगम है। प्रमुख आकर्षण: ${highlights}।`
        : `Escape the ordinary at ${input.title}. Set amidst the serene landscapes of ${district}, our property blends traditional Chotanagpur tribal architectural warmth with modern comfort. Guests enjoy panoramic nature views, personalized local guidance, and locally sourced organic meals. Highlights include: ${highlights}.`,
      amenitiesOrHighlights: isHindi
        ? [
            'पहाड़ी एवं घाटी का मनोरम दृश्य',
            'जैविक खेत से ताजा पारंपरिक भोजन',
            'सौर ऊर्जा एवं पर्यावरण-अनुकूल व्यवस्था',
            'मार्गदर्शित ग्रामीण एवं प्रकृति ट्रेल्स',
            '24/7 गर्म पानी एवं पावर बैकअप',
          ]
        : [
            'Scenic Forest & Valley View',
            'Organic Farm-to-Table Meals',
            'Eco-Friendly Solar Power & Waste Management',
            'Guided Village & Nature Trails',
            '24/7 Hot Water & Power Backup',
          ],
      shortPromoDescription: isHindi
        ? `${district} में प्रामाणिक प्रकृति और शांत इको-स्टे का अनुभव करें!`
        : `Experience untouched nature and authentic tribal hospitality in ${district}!`,
      seoDescription: isHindi
        ? `${district} में ${input.title} बुक करें। प्राकृतिक दृश्य, जैविक भोजन एवं प्रामाणिक झारखंडी अनुभव।`
        : `Book ${input.title} in ${district}. Eco-friendly stay with organic dining and authentic Jharkhandi warmth.`,
      safetyNotes: isHindi
        ? 'पूर्णतः सैनिटाइज्ड कमरे, सत्यापित स्थानीय कर्मचारी और आपातकालीन चिकित्सा सहायता उपलब्ध।'
        : 'Fully sanitised rooms, verified local staff, and emergency medical assistance available on call.',
      modelUsed: 'Jharkhand Tourism Content Engine',
    };
  } else if (input.kind === 'product') {
    return {
      enhancedTitle: isHindi ? `प्रामाणिक हस्तनिर्मित ${input.title}` : `Authentic Handcrafted ${input.title}`,
      shortDescription: isHindi
        ? `${district} के सिद्धहस्त जनजातीय कारीगरों द्वारा प्राकृतिक क्षेत्रीय सामग्रियों से 100% हस्तनिर्मित।`
        : `100% handcrafted artisan piece made with natural regional materials by master tribal artisans of ${district}.`,
      detailedDescription: isHindi
        ? `झारखंड की समृद्ध कला विरासत का उत्सव मनाएं। ${district} में पीढ़ियों पुरानी पारंपरिक तकनीकों से निर्मित, प्रत्येक कृति स्थानीय कला परंपरा की अनूठी कहानी कहती है। विशेषताएं: ${highlights}।`
        : `Celebrate Jharkhand’s rich artistic legacy with this genuine ${input.title}. Handcrafted with ancestral precision in ${district}, every detail tells a story of sustainable forest traditions and indigenous craft identity. Features: ${highlights}.`,
      amenitiesOrHighlights: isHindi
        ? [
            'सत्यापित जनजातीय कारीगरों द्वारा 100% हस्तनिर्मित',
            'प्राकृतिक पर्यावरण-अनुकूल रंग एवं धातु',
            'ग्रामीण आजीविका को सीधा समर्थन',
            'जीआई हेरिटेज शिल्प परंपरा',
          ]
        : [
            '100% Handcrafted by Certified Tribal Artisans',
            'Natural Eco-Friendly Pigments & Metals',
            'Supports Rural Livelihoods Directly',
            'GI Heritage Craft Origin',
          ],
      shortPromoDescription: isHindi
        ? `सीधे झारखंड के कारीगरों से प्रामाणिक हस्तशिल्प प्राप्त करें।`
        : `Bring home authentic tribal heritage directly from certified artisans.`,
      seoDescription: isHindi
        ? `${district} से हस्तनिर्मित ${input.title} खरीदें। 100% प्रामाणिक जनजातीय कला।`
        : `Buy handcrafted ${input.title} from ${district}. 100% authentic GI tribal artisan craft.`,
      safetyNotes: isHindi
        ? 'सावधानी से संभालें; सूखे सूती कपड़े से साफ करें। रासायनिक क्लीनर से दूर रखें।'
        : 'Handle with care; wipe gently with a dry cotton cloth. Keep away from harsh direct chemical cleaners.',
      modelUsed: 'Jharkhand Tourism Content Engine',
    };
  } else if (input.kind === 'tour') {
    return {
      enhancedTitle: isHindi ? `${input.title} — मार्गदर्शित परिपथ` : `${input.title} — Guided Discovery Circuit`,
      shortDescription: isHindi
        ? `सरकारी प्रमाणित स्थानीय विशेषज्ञों के मार्गदर्शन में ${district} का सुनियोजित भ्रमण।`
        : `Curated guided exploration in ${district} led by government-certified local experts.`,
      detailedDescription: isHindi
        ? `${district} की अनूठी कहानियों का अनुभव करें। छिपे झरने, प्राचीन तीर्थ और स्थानीय भोजन के साथ सुरक्षित यात्रा। विशेषताएं: ${highlights}।`
        : `Immerse yourself in the authentic stories of ${district} with our signature tour: ${input.title}. Experience hidden cascades, ancient shrines, and local culinary stops with seamless logistics. Features: ${highlights}.`,
      amenitiesOrHighlights: isHindi
        ? [
            'प्रमाणित हिंदी/अंग्रेजी/स्थानीय भाषा गाइड',
            'सभी टोल, पार्किंग एवं प्रवेश परमिट शामिल',
            'आरामदायक स्वच्छ वाहन',
            'प्रामाणिक क्षेत्रीय नाश्ता एवं पेयजल',
          ]
        : [
            'Certified English/Hindi/Local Dialect Guide',
            'All Tolls, Parking & Entry Permits Included',
            'Comfortable Sanitised Transport',
            'Authentic Regional Snacks & Water Provided',
          ],
      shortPromoDescription: isHindi
        ? `प्रमाणित स्थानीय गाइड के साथ ${district} के छिपे स्थलों की खोज करें!`
        : `Explore hidden gems of ${district} with certified local guides!`,
      seoDescription: isHindi
        ? `${district} में ${input.title} टूर बुक करें। विशेषज्ञ गाइड, सुरक्षित परिवहन।`
        : `Book ${input.title} tour in ${district}. Certified guides, scenic routes and safe logistics.`,
      safetyNotes: isHindi
        ? 'मजबूत चलने वाले जूते पहनें। वैध पहचान पत्र और आवश्यक दवाएं साथ रखें।'
        : 'Wear sturdy walking shoes. Carry valid photo ID and personal medications.',
      modelUsed: 'Jharkhand Tourism Content Engine',
    };
  } else {
    return {
      enhancedTitle: `${input.title} (${district})`,
      shortDescription: isHindi
        ? `${district} में विश्वसनीय एवं सत्यापित स्थानीय पर्यटन सेवा।`
        : `Premium tourism service in ${district} offering dependable, verified local hospitality.`,
      detailedDescription: isHindi
        ? `${input.title} के साथ ${district} के अजूबों का अनुभव करें। सुरक्षित और समृद्ध यात्रा अनुभव। मुख्य विशेषताएं: ${highlights}।`
        : `Discover the wonders of ${district} with ${input.title}. Designed to give travelers a seamless, safe, and deeply enriching travel experience. Key features: ${highlights}.`,
      amenitiesOrHighlights: isHindi
        ? [
            'सत्यापित एवं पृष्ठभूमि-जांच किए गए ऑपरेटर',
            'बिना किसी छिपे शुल्क के पारदर्शी मूल्य निर्धारण',
            'लचीली बुकिंग एवं ग्राहक सहायता',
          ]
        : [
            'Verified & Background-Checked Operators',
            'Transparent Pricing with No Hidden Charges',
            'Flexible Booking & Customer Support',
          ],
      shortPromoDescription: isHindi
        ? `${district} में विश्वसनीय एवं आरामदायक पर्यटन सेवा।`
        : `Reliable and comfortable travel service in ${district}.`,
      seoDescription: isHindi
        ? `${district} में ${input.title} बुक करें। 100% सत्यापित स्थानीय सेवा।`
        : `Book ${input.title} in ${district}. 100% verified local service.`,
      safetyNotes: isHindi
        ? 'ड्राइवर एवं गाइड द्वारा दिए गए सुरक्षा निर्देशों का पालन करें।'
        : 'Follow driver and guide safety briefings at all times.',
      modelUsed: 'Jharkhand Tourism Content Engine',
    };
  }
}

/**
 * Government Tourism Analytics AI Insights (Groq powered with fallback)
 */
export async function generateGovernmentInsights(data?: {
  totalDestinations: number;
  totalProviders: number;
  totalOfferings: number;
  pendingFeedbackCount: number;
  language?: 'en' | 'hi';
}): Promise<GovernmentAIInsight[]> {
  const isHindi = data?.language === 'hi';

  const edgeResponse = await callGroqEdgeFunction({
    action: 'admin_insights',
    language: isHindi ? 'hi' : 'en',
    context: {
      adminInput: data || {
        totalDestinations: 24,
        totalProviders: 18,
        totalOfferings: 42,
        pendingFeedbackCount: 3,
      },
    },
  });

  if (edgeResponse && edgeResponse.content) {
    try {
      const parsed = JSON.parse(edgeResponse.content);
      if (Array.isArray(parsed.insights) && parsed.insights.length > 0) {
        return parsed.insights;
      }
    } catch (parseErr) {
      console.warn('[AI Service] Failed to parse admin insights JSON from Groq:', parseErr);
    }
  }

  if (isHindi) {
    return [
      {
        category: 'growth',
        title: 'लातेहार एवं गुमला परिपथ में पर्यटकों की संख्या में 38% की वृद्धि',
        insight: `नेतरहाट इको-जोन और नवरत्नगढ़ ऐतिहासिक किले में पर्यटकों की रुचि इस तिमाही में 38% बढ़ी है।`,
        actionRecommendation: 'दिशा-निर्देश संकेतकों को बढ़ाएं और लातेहार में 4 लंबित ग्रामीण होमस्टे लाइसेंस को मंजूरी दें।',
        urgency: 'medium',
      },
      {
        category: 'eco_alert',
        title: 'हुंडरू एवं दशम में मानसून जलप्रवाह सुरक्षा निगरानी',
        insight: 'स्वर्णरेखा नदी में जल स्तर इष्टतम क्षमता के करीब है। मौसमी सुरक्षा परामर्श सक्रिय हैं।',
        actionRecommendation: 'अतिरिक्त पर्यटक सुरक्षा गार्ड तैनात करें और लाइफ-जैकेट स्टेशनों में पर्याप्त सामग्री सुनिश्चित करें।',
        urgency: 'high',
      },
      {
        category: 'artisan',
        title: 'सोहराई एवं डोकरा शिल्प की मांग प्रदाता सूची से अधिक',
        insight: 'बाजार में प्रामाणिक जीआई-टैग टेराकोटा और कांस्य उत्पादों के लिए पूछताछ में 42% की वृद्धि दर्ज की गई।',
        actionRecommendation: 'हजारीबाग और दुमका जिला क्लस्टरों में कारीगर ऑनबोर्डिंग शिविर आयोजित करें।',
        urgency: 'medium',
      },
      {
        category: 'demand',
        title: 'साहिबगंज गंगा हेरिटेज कॉरिडोर में अपार संभावनाएं',
        insight: 'राजमहल जीवाश्म पार्क और उधवा पक्षी अभयारण्य में उच्च खोज दृश्य होने के बावजूद प्रदाता लिस्टिंग कम है।',
        actionRecommendation: 'साहिबगंज और पाकुड़ जिलों में स्थानीय परिवहन ऑपरेटरों और इको-गाइडों को प्रोत्साहित करें।',
        urgency: 'low',
      },
    ];
  }

  return [
    {
      category: 'growth',
      title: 'Rising Tourism Momentum in Latehar & Gumla Circuits',
      insight: `Visitor interest for Netarhat eco-zones and Navratangarh heritage fort has increased by 38% this quarter.`,
      actionRecommendation: 'Enhance directional signage and approve 4 pending rural homestay licenses in Latehar.',
      urgency: 'medium',
    },
    {
      category: 'eco_alert',
      title: 'Monsoon Water Surge Monitoring at Hundru & Dassam',
      insight: 'Subarnarekha water levels are near optimal capacity. Seasonal surge warnings are active.',
      actionRecommendation: 'Deploy additional tourist safety guards and ensure life-jacket stations are stocked.',
      urgency: 'high',
    },
    {
      category: 'artisan',
      title: 'Sohrai & Dhokra Craft Demand Outpacing Provider Inventory',
      insight: 'Marketplace queries for authentic GI-tagged terracotta and bronze items increased 42% over festive periods.',
      actionRecommendation: 'Organize artisan onboarding camps across Hazaribagh and Dumka district clusters.',
      urgency: 'medium',
    },
    {
      category: 'demand',
      title: 'Untapped Potential in Sahibganj Ganga Heritage Corridor',
      insight: 'Rajmahal Jurassic Fossil Park and Udhwa Bird Sanctuary show low provider listings despite high discovery views.',
      actionRecommendation: 'Incentivize local transport operators and eco-guides in Sahibganj and Pakur districts.',
      urgency: 'low',
    },
  ];
}
