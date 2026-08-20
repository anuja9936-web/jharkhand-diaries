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

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  district: string;
  schedule: Array<{
    timeSlot: 'Morning' | 'Afternoon' | 'Evening';
    title: string;
    description: string;
    destination?: Destination;
    destinationSlug?: string;
    activityType: 'sightseeing' | 'adventure' | 'culture' | 'dining' | 'relaxation';
    durationHours: number;
  }>;
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
  activeAdvisories: string[];
  curatorNote: string;
}

export interface ItineraryGenerationInput {
  days: number;
  startLocation: string;
  budgetTier: 'budget' | 'moderate' | 'premium';
  travellerType: 'solo' | 'couple' | 'family' | 'friends' | 'senior';
  interests: string[];
  travelIntensity: 'relaxed' | 'balanced' | 'packed';
}

export interface ProviderContentOutput {
  enhancedTitle: string;
  shortDescription: string;
  detailedDescription: string;
  amenitiesOrHighlights: string[];
  safetyNotes: string;
  modelUsed?: string;
}

export interface GovernmentAIInsight {
  category: 'growth' | 'eco_alert' | 'artisan' | 'demand';
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
 * Invoke the Supabase Groq Edge Function (`ai-assistant`)
 */
async function callGroqEdgeFunction(payload: {
  action: 'chat' | 'itinerary' | 'recommendations' | 'provider_writer' | 'admin_insights';
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  prompt?: string;
  context?: Record<string, unknown>;
}): Promise<{ success: boolean; content: string; model?: string } | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: payload,
    });

    if (error) {
      console.warn('[AI Service] Supabase Edge Function error:', error.message);
      return null;
    }

    if (data?.success && data?.content) {
      return {
        success: true,
        content: data.content,
        model: data.model,
      };
    }

    return null;
  } catch (invokeErr) {
    console.warn('[AI Service] Failed to reach ai-assistant Edge Function, using grounded fallback:', invokeErr);
    return null;
  }
}

/**
 * Extract matching destinations from free-form text or context
 */
function extractMatchingDestinations(text: string): Destination[] {
  const t = text.toLowerCase();
  return VERIFIED_JHARKHAND_DESTINATIONS.filter((d) => {
    return (
      t.includes(d.name.toLowerCase()) ||
      t.includes(d.slug.toLowerCase()) ||
      (t.includes(d.district.toLowerCase()) && (t.includes('waterfall') || t.includes('park') || t.includes('hill')))
    );
  }).slice(0, 4);
}

/**
 * Extract matching offerings from free-form text
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
 * Intelligent natural language response generator for Jharkhand Travel Assistant
 * Powered by Groq via Supabase Edge Function with local grounded fallback
 */
export async function generateAITravelResponse(
  userQuery: string,
  history: AIMessage[] = []
): Promise<AIMessage> {
  const queryLower = userQuery.toLowerCase();

  // Prepare grounded context to send to Groq
  const relevantDestinations = VERIFIED_JHARKHAND_DESTINATIONS.filter((d) => {
    return (
      queryLower.includes(d.name.toLowerCase()) ||
      queryLower.includes(d.district.toLowerCase()) ||
      queryLower.includes(d.category) ||
      (queryLower.includes('waterfall') && d.category === 'waterfall') ||
      (queryLower.includes('wildlife') && d.category === 'wildlife') ||
      (queryLower.includes('temple') && d.category === 'religious')
    );
  }).slice(0, 8);

  const relevantOfferings = [
    ...JHARKHAND_ACCOMMODATIONS,
    ...JHARKHAND_MARKETPLACE_PRODUCTS,
  ].filter((o) => {
    return (
      queryLower.includes(o.name.toLowerCase()) ||
      (o.district && queryLower.includes(o.district.toLowerCase())) ||
      queryLower.includes(o.kind)
    );
  }).slice(0, 6);

  const relevantAlerts = ACTIVE_SYSTEM_ALERTS.filter((alert) => {
    const alertDist = (alert.district || '').toLowerCase();
    return (
      (alertDist && queryLower.includes(alertDist)) ||
      (alert.destination_name && queryLower.includes(alert.destination_name.toLowerCase()))
    );
  });

  // Attempt real Groq Edge Function call
  const edgeResponse = await callGroqEdgeFunction({
    action: 'chat',
    messages: [
      ...history.slice(-4).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userQuery },
    ],
    context: {
      destinations: relevantDestinations.map((d) => ({
        name: d.name,
        slug: d.slug,
        district: d.district,
        category: d.category,
        description: d.short_description,
      })),
      offerings: relevantOfferings.map((o) => ({
        name: o.name,
        kind: o.kind,
        district: o.district || '',
        price: o.price || undefined,
      })),
      alerts: relevantAlerts.map((a) => ({
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
      alerts: relevantAlerts.length > 0 ? relevantAlerts : undefined,
      quickActions: [
        { label: '🗺️ View on Map', action: 'navigate', payload: '/map' },
        { label: '🗓️ Plan Full Itinerary', action: 'navigate', payload: '/plan-trip' },
        { label: '🏡 Discover Stays', action: 'navigate', payload: '/accommodations' },
        { label: '🎨 Artisan Crafts', action: 'navigate', payload: '/marketplace' },
      ],
    };
  }

  // Fallback to grounded local knowledge engine if Edge Function is offline
  let responseText = '';
  const quickActions: Array<{ label: string; action: string; payload?: string }> = [];

  if (queryLower.includes('waterfall')) {
    responseText = `Jharkhand is celebrated as the **"Land of Waterfalls"** on the Chotanagpur Plateau.

Top recommended cascades:
• **Hundru Falls (Ranchi)**: A dramatic 98-metre plunge on the Subarnarekha River.
• **Dassam Falls (Ranchi)**: A pristine stepped canyon waterfall on the Kanchi River.
• **Jonha Falls (Gautamdhara)**: Sacred 722-step hanging-valley waterfall.
• **Lodh Falls (Latehar)**: The highest waterfall in Jharkhand (143 metres), thundering inside deep Sal forests.
• **Panchghagh Falls (Khunti)**: Five gentle parallel streams ideal for families.`;

    quickActions.push(
      { label: 'View on Map', action: 'navigate', payload: '/map?district=Ranchi' },
      { label: 'Plan 2-Day Waterfall Trip', action: 'plan', payload: 'waterfalls' }
    );
  } else if (queryLower.includes('3 day') || queryLower.includes('3-day') || queryLower.includes('itinerary') || queryLower.includes('plan')) {
    responseText = `Here is a popular **3-Day Classic Jharkhand Discovery Circuit**:

• **Day 1: Waterfalls & Tribal Heritage of Ranchi**
  Visit Hundru Falls, Rock Garden, and the State Tribal Museum. Savor traditional Dhuska & Rugra curry.
• **Day 2: Serpentine Vistas of Patratu Valley & Dam**
  Scenic morning drive through Patratu Valley's hairpin curves with lake boating, followed by ancient Rajrappa Chhinnamasta Shrine.
• **Day 3: Queen of Chotanagpur — Netarhat & Betla**
  Magnolia Point sunset views, Pine Forest walks, and wildlife safari at Betla National Park.`;

    quickActions.push(
      { label: 'Generate Full AI Itinerary', action: 'navigate', payload: '/plan-trip' },
      { label: 'Explore Accommodations', action: 'navigate', payload: '/accommodations' }
    );
  } else if (queryLower.includes('tribal') || queryLower.includes('craft') || queryLower.includes('sohrai') || queryLower.includes('art')) {
    responseText = `Jharkhand has a vibrant 5,000-year-old indigenous cultural legacy of 32 tribal communities:

• **GI-Tagged Sohrai & Khovar Murals**: Traditional mud-wall painting created with natural ochres, celebrating harvests and matrimony (Hazaribagh & Ranchi).
• **Dhokra Metal Casting**: Ancient lost-wax bronze figurines handcrafted by Malhor artisans.
• **Chhau Dance**: UNESCO-inscribed martial mask dance from Saraikela.
• **Tribal Living Heritage**: Visit Dr. Ramdayal Munda Tribal Museum in Ranchi and Ulihatu (Birsa Munda’s birthplace).`;

    quickActions.push(
      { label: 'Shop Artisan Crafts', action: 'navigate', payload: '/marketplace' },
      { label: 'Cultural Experiences', action: 'navigate', payload: '/experiences' }
    );
  } else if (queryLower.includes('wildlife') || queryLower.includes('nature') || queryLower.includes('forest') || queryLower.includes('eco')) {
    responseText = `For wildlife and pristine eco-tourism, Jharkhand offers incredible biodiversity:

• **Betla National Park (Latehar)**: One of India’s earliest Project Tiger reserves, home to Asian elephants, leopards, and historic Chero forts.
• **Dalma Wildlife Sanctuary (East Singhbhum)**: Major hilltop elephant corridor overlooking Jamshedpur and Subarnarekha valley.
• **Saranda Forest (West Singhbhum)**: Asia’s densest virgin Sal tree canopy, known as the "Land of Seven Hundred Hills".
• **Udhwa Lake Sanctuary (Sahibganj)**: Migratory bird paradise on the holy Ganga river bend.`;

    quickActions.push(
      { label: 'Explore Wildlife on Map', action: 'navigate', payload: '/map?district=Latehar' },
      { label: 'Eco Homestays', action: 'navigate', payload: '/accommodations' }
    );
  } else {
    responseText = `Johar! I am your **Jharkhand Diaries AI Travel Assistant**.

I can help you with:
• **Curating custom itineraries** across 24 districts (1 to 7 days).
• **Finding waterfalls, wildlife reserves, and scenic valleys**.
• **Discovering authentic Sohrai art, Dhokra crafts, and tribal homestays**.
• **Navigating sacred pilgrimage circuits** (Baidyanath Dham, Parasnath, Rajrappa).
• **Checking active safety advisories and seasonal weather tips**.

How may I assist your journey through Jharkhand today?`;

    quickActions.push(
      { label: 'Top Waterfalls', action: 'ask', payload: 'What are the top waterfalls in Jharkhand?' },
      { label: '3-Day Trip Plan', action: 'ask', payload: 'Give me a 3-day itinerary for Jharkhand' },
      { label: 'Tribal Art & Crafts', action: 'ask', payload: 'Tell me about tribal crafts and Sohrai art' },
      { label: 'Wildlife Sanctuaries', action: 'ask', payload: 'Where can I see wildlife in Jharkhand?' }
    );
  }

  const fallbackDestinations = extractMatchingDestinations(userQuery);
  const fallbackOfferings = extractMatchingOfferings(userQuery);

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responseText,
    modelUsed: 'Jharkhand Tourism Knowledge Engine',
    timestamp: new Date().toISOString(),
    suggestedDestinations: fallbackDestinations.length > 0 ? fallbackDestinations : undefined,
    suggestedOfferings: fallbackOfferings.length > 0 ? fallbackOfferings : undefined,
    alerts: relevantAlerts.length > 0 ? relevantAlerts : undefined,
    quickActions: quickActions.length > 0 ? quickActions : undefined,
  };
}

/**
 * Intelligent Personalized Itinerary Generator
 * Powered by Groq LLM structured JSON output with fallback
 */
export async function generatePersonalizedItinerary(
  input: ItineraryGenerationInput
): Promise<GeneratedItinerary> {
  const daysCount = Math.max(1, Math.min(input.days, 7));

  // Prepare context data for LLM
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
        // Hydrate real Destination records and Provider offerings
        const hydratedDays: ItineraryDay[] = parsed.days.map((day: any, idx: number) => {
          const dayNumber = day.dayNumber || idx + 1;
          const district = day.district || input.startLocation;

          const schedule = Array.isArray(day.schedule)
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
            title: day.title || `Day ${dayNumber}: ${district} Circuit`,
            theme: day.theme || `${district} Exploration`,
            district,
            schedule,
            recommendedStay: matchedStay,
            recommendedStayName: day.recommendedStayName || matchedStay.name,
            recommendedTransport: matchedTransport,
            recommendedTransportName: day.recommendedTransportName || matchedTransport.name,
            recommendedExperience: matchedExperience,
            dayBudgetEstimate: Number(day.dayBudgetEstimate) || 2500,
            localTips: Array.isArray(day.localTips) && day.localTips.length > 0
              ? day.localTips
              : [`Carry comfortable footwear and stay hydrated in ${district}.`],
          };
        });

        const totalMin =
          parsed.estimatedTotalBudget?.min ||
          hydratedDays.reduce((acc, d) => acc + d.dayBudgetEstimate, 0);
        const totalMax = parsed.estimatedTotalBudget?.max || Math.round(totalMin * 1.35);

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
          activeAdvisories: Array.isArray(parsed.activeAdvisories) && parsed.activeAdvisories.length > 0
            ? parsed.activeAdvisories
            : ['Check local weather conditions before departure.'],
          curatorNote: parsed.curatorNote || 'Generated by Johar AI and grounded with official Jharkhand GIS data.',
        };
      }
    } catch (parseErr) {
      console.warn('[AI Service] Failed to parse Groq JSON itinerary, falling back to rule engine:', parseErr);
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
    let schedule: ItineraryDay['schedule'] = [];
    let budgetPerDay = input.budgetTier === 'budget' ? 1200 : input.budgetTier === 'premium' ? 4500 : 2400;

    if (i === 1) {
      dayDistrict = startDistrict;
      dayTheme = startDistrict === 'Ranchi' ? 'City of Waterfalls & Ancient Temples' : `${startDistrict} Discovery`;

      const hundru = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'hundru-falls');
      const rockGarden = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'rock-garden-ranchi');

      schedule = [
        {
          timeSlot: 'Morning',
          title: 'Arrival & Hundru Falls Cascade',
          description: 'Experience the 98-metre plunge on the Subarnarekha River.',
          destination: hundru,
          activityType: 'sightseeing',
          durationHours: 3.5,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Traditional Jharkhandi Lunch & Rock Garden',
          description: 'Savor organic Dhuska & Chhilka Roti, followed by scenic rock sculpture walks.',
          destination: rockGarden,
          activityType: 'relaxation',
          durationHours: 2.5,
        },
        {
          timeSlot: 'Evening',
          title: 'Tribal Cultural Heritage Museum',
          description: 'Discover Sohrai GI murals, lost-wax Dhokra bronze artifacts, and musical traditions.',
          destination: VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'tribal-museum-ranchi'),
          activityType: 'culture',
          durationHours: 2,
        },
      ];
    } else if (i === 2) {
      dayDistrict = 'Ramgarh';
      dayTheme = 'Serpentine Valleys & Sacred River Confluence';
      const patratu = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'patratu-valley');
      const rajrappa = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'rajrappa-temple');

      schedule = [
        {
          timeSlot: 'Morning',
          title: 'Patratu Valley Scenic Drive & Lake Boating',
          description: 'Navigate hairpin mountain loops and enjoy peaceful island boating.',
          destination: patratu,
          activityType: 'adventure',
          durationHours: 3,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Lakeside Promenade Relaxation',
          description: 'Relax at Patratu lake promenade with panoramic Chotanagpur hill views.',
          activityType: 'relaxation',
          durationHours: 2,
        },
        {
          timeSlot: 'Evening',
          title: 'Maa Chhinnamasta Shrine at Rajrappa Sangam',
          description: 'Visit the revered Shakti Peeth over Bhairavi and Damodar river gorge.',
          destination: rajrappa,
          activityType: 'culture',
          durationHours: 2.5,
        },
      ];
    } else if (i === 3) {
      dayDistrict = 'Latehar';
      dayTheme = 'Queen of Chotanagpur & Wildlife Wilderness';
      const netarhat = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'netarhat');
      const betla = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'betla-national-park');

      schedule = [
        {
          timeSlot: 'Morning',
          title: 'Netarhat Pine Grove Walks & Sunrise View',
          description: 'Crisp morning mountain walk through pine plantations.',
          destination: netarhat,
          activityType: 'sightseeing',
          durationHours: 3,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Betla National Park Forest Safari',
          description: 'Open-top jeep safari through Sal forests to spot wild Asian elephants and Chero forts.',
          destination: betla,
          activityType: 'adventure',
          durationHours: 3.5,
        },
        {
          timeSlot: 'Evening',
          title: 'Sunset at Magnolia Point',
          description: 'Witness the iconic sunset over the layered Vindhyan valley ranges.',
          destination: netarhat,
          activityType: 'relaxation',
          durationHours: 1.5,
        },
      ];
    } else {
      dayDistrict = 'East Singhbhum';
      dayTheme = 'Elephant Sanctuary & Foothills';
      const dalma = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'dalma-wildlife-sanctuary');
      const dimna = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'dimna-lake');

      schedule = [
        {
          timeSlot: 'Morning',
          title: 'Dalma Mountain Range Wildlife Exploration',
          description: 'Drive up Dalma hilltop sanctuary overlooking Jamshedpur valley.',
          destination: dalma,
          activityType: 'adventure',
          durationHours: 3.5,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Dimna Lake Waterfront Relaxation',
          description: 'Lakeside promenade nestled in the foothills.',
          destination: dimna,
          activityType: 'relaxation',
          durationHours: 2.5,
        },
        {
          timeSlot: 'Evening',
          title: 'Jubilee Park Illumination',
          description: 'Stroll through rose gardens and musical laser fountains.',
          activityType: 'culture',
          durationHours: 2,
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
      title: `Day ${i}: ${dayTheme}`,
      theme: dayTheme,
      district: dayDistrict,
      schedule,
      recommendedStay: districtStay,
      recommendedExperience: districtExperience,
      recommendedTransport: districtTransport,
      dayBudgetEstimate: budgetPerDay,
      localTips: [
        `Carry a light waterproof jacket and comfortable walking shoes for ${dayDistrict}.`,
        'Keep some cash handy as remote forest checkpoints may have limited UPI connectivity.',
      ],
    });
  }

  const minBudget = days.reduce((sum, d) => sum + d.dayBudgetEstimate, 0);
  const maxBudget = Math.round(minBudget * 1.35);

  return {
    id: `itinerary-${Date.now()}`,
    title: `${daysCount}-Day ${input.travellerType.toUpperCase()} Jharkhand Odyssey`,
    summary: `A carefully tailored ${daysCount}-day journey through Jharkhand, connecting iconic waterfalls, tranquil hill stations, wildlife sanctuaries, and authentic tribal cultural experiences starting from ${input.startLocation}.`,
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
    activeAdvisories: [
      'Hundru Falls: Remain on upper observation decks during high surge hours.',
      'Betla National Park: Advance safari booking is recommended on weekends.',
    ],
    curatorNote: 'Crafted with certified Jharkhand Tourism geospatial data and verified local service provider connections.',
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
  tag?: 'weekend' | 'family' | 'eco' | 'culture' | 'adventure';
}): { title: string; subtitle: string; destinations: Destination[] } {
  let filtered = [...VERIFIED_JHARKHAND_DESTINATIONS];
  let title = 'Recommended for You';
  let subtitle = 'Curated top destinations across Jharkhand';

  if (criteria.tag === 'weekend') {
    title = 'Perfect Weekend Escapes';
    subtitle = 'Quick refreshing getaways under 3 hours from major transport hubs';
    filtered = filtered.filter((d) => ['Ranchi', 'Ramgarh', 'Latehar'].includes(d.district));
  } else if (criteria.tag === 'family') {
    title = 'Family & Nature Retreats';
    subtitle = 'Safe, scenic, and well-equipped spots for travellers of all age groups';
    filtered = filtered.filter((d) => d.category === 'waterfall' || d.category === 'eco' || d.slug === 'rock-garden-ranchi');
  } else if (criteria.tag === 'culture') {
    title = 'Deep Cultural & Tribal Immersion';
    subtitle = 'Ancient megaliths, sacred groves, Sohrai art villages & heritage forts';
    filtered = filtered.filter((d) => d.category === 'tribal_culture' || d.category === 'heritage' || d.category === 'religious');
  } else if (criteria.tag === 'adventure') {
    title = 'Thrill, Treks & Water Adventures';
    subtitle = 'Hairpin passes, mountain trails, speedboating, and dense jungle treks';
    filtered = filtered.filter((d) => d.category === 'adventure' || d.category === 'wildlife');
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
}): Promise<ProviderContentOutput> {
  const district = input.district || 'Jharkhand';
  const highlights = input.keyHighlights || 'authentic local experience';

  // Call Groq Edge Function
  const edgeResponse = await callGroqEdgeFunction({
    action: 'provider_writer',
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
          safetyNotes: parsed.safetyNotes || 'Follow standard safety precautions.',
          modelUsed: edgeResponse.model || 'Groq Llama 3.3',
        };
      }
    } catch (parseErr) {
      console.warn('[AI Service] Failed to parse provider writer JSON from Groq:', parseErr);
    }
  }

  // Fallback
  if (input.kind === 'stay') {
    return {
      enhancedTitle: input.title.includes('Resort') || input.title.includes('Stay') ? input.title : `${input.title} Eco Stay & Homestay`,
      shortDescription: `Comfortable and sustainable accommodation nestled in scenic ${district}, offering warm Jharkhandi hospitality and farm-fresh cuisine.`,
      detailedDescription: `Escape the ordinary at ${input.title}. Set amidst the serene landscapes of ${district}, our property blends traditional Chotanagpur tribal architectural warmth with modern comfort. Guests enjoy panoramic nature views, personalized local guidance, and locally sourced organic meals. Highlights include: ${highlights}.`,
      amenitiesOrHighlights: [
        'Scenic Forest & Valley View',
        'Organic Farm-to-Table Meals',
        'Eco-Friendly Solar Power & Waste Management',
        'Guided Village & Nature Trails',
        '24/7 Hot Water & Power Backup',
      ],
      safetyNotes: 'Fully sanitised rooms, verified local staff, and emergency medical assistance available on call.',
      modelUsed: 'Jharkhand Tourism Content Engine',
    };
  } else if (input.kind === 'product') {
    return {
      enhancedTitle: `Authentic Handcrafted ${input.title}`,
      shortDescription: `100% handcrafted artisan piece made with natural regional materials by master tribal artisans of ${district}.`,
      detailedDescription: `Celebrate Jharkhand’s rich artistic legacy with this genuine ${input.title}. Handcrafted with ancestral precision in ${district}, every detail tells a story of sustainable forest traditions and indigenous craft identity. Features: ${highlights}.`,
      amenitiesOrHighlights: [
        '100% Handcrafted by Certified Tribal Artisans',
        'Natural Eco-Friendly Pigments & Metals',
        'Supports Rural Livelihoods Directly',
        'GI Heritage Craft Origin',
      ],
      safetyNotes: 'Handle with care; wipe gently with a dry cotton cloth. Keep away from harsh direct chemical cleaners.',
      modelUsed: 'Jharkhand Tourism Content Engine',
    };
  } else if (input.kind === 'tour') {
    return {
      enhancedTitle: `${input.title} — Guided Discovery Circuit`,
      shortDescription: `Curated guided exploration in ${district} led by government-certified local experts.`,
      detailedDescription: `Immerse yourself in the authentic stories of ${district} with our signature tour: ${input.title}. Experience hidden cascades, ancient shrines, and local culinary stops with seamless logistics. Features: ${highlights}.`,
      amenitiesOrHighlights: [
        'Certified English/Hindi/Local Dialect Guide',
        'All Tolls, Parking & Entry Permits Included',
        'Comfortable Sanitised Transport',
        'Authentic Regional Snacks & Water Provided',
      ],
      safetyNotes: 'Wear sturdy walking shoes. Carry valid photo ID and personal medications.',
      modelUsed: 'Jharkhand Tourism Content Engine',
    };
  } else {
    return {
      enhancedTitle: `${input.title} (${district})`,
      shortDescription: `Premium tourism service in ${district} offering dependable, verified local hospitality.`,
      detailedDescription: `Discover the wonders of ${district} with ${input.title}. Designed to give travelers a seamless, safe, and deeply enriching travel experience. Key features: ${highlights}.`,
      amenitiesOrHighlights: [
        'Verified & Background-Checked Operators',
        'Transparent Pricing with No Hidden Charges',
        'Flexible Booking & Customer Support',
      ],
      safetyNotes: 'Follow driver and guide safety briefings at all times.',
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
}): Promise<GovernmentAIInsight[]> {
  const edgeResponse = await callGroqEdgeFunction({
    action: 'admin_insights',
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
