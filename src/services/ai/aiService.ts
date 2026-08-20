import { VERIFIED_JHARKHAND_DESTINATIONS, JHARKHAND_DISTRICTS_DATA } from '../../constants/jharkhandDistrictsGeo';
import { JHARKHAND_ACCOMMODATIONS } from '../../constants/accommodationsData';
import {
  JHARKHAND_MARKETPLACE_PRODUCTS,
  JHARKHAND_MARKETPLACE_EXPERIENCES,
  JHARKHAND_CURATED_TOURS,
  JHARKHAND_CURATED_TRANSPORT,
} from '../../constants/marketplaceData';
import type { Destination } from '../../types/destination';
import type { ProviderOffering } from '../../types/provider';
import type { TourismAlert } from '../../types/admin';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
    activityType: 'sightseeing' | 'adventure' | 'culture' | 'dining' | 'relaxation';
    durationHours: number;
  }>;
  recommendedStay?: ProviderOffering;
  recommendedExperience?: ProviderOffering;
  recommendedTransport?: ProviderOffering;
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
 * Intelligent natural language response generator for Jharkhand Travel Assistant
 */
export async function generateAITravelResponse(
  userQuery: string,
  _history: AIMessage[] = []
): Promise<AIMessage> {
  const queryLower = userQuery.toLowerCase();

  // Extract matching destinations
  const matchedDestinations = VERIFIED_JHARKHAND_DESTINATIONS.filter((d) => {
    return (
      queryLower.includes(d.name.toLowerCase()) ||
      queryLower.includes(d.district.toLowerCase()) ||
      (queryLower.includes('waterfall') && d.category === 'waterfall') ||
      (queryLower.includes('wildlife') && d.category === 'wildlife') ||
      (queryLower.includes('heritage') && (d.category === 'heritage' || d.category === 'religious')) ||
      (queryLower.includes('temple') && d.category === 'religious') ||
      (queryLower.includes('tribal') && d.category === 'tribal_culture') ||
      (queryLower.includes('eco') && (d.eco_zone || d.category === 'eco')) ||
      (queryLower.includes('adventure') && d.category === 'adventure')
    );
  }).slice(0, 4);

  // Extract matching provider offerings
  const matchedOfferings: ProviderOffering[] = [
    ...JHARKHAND_ACCOMMODATIONS,
    ...JHARKHAND_MARKETPLACE_PRODUCTS,
    ...JHARKHAND_MARKETPLACE_EXPERIENCES,
    ...JHARKHAND_CURATED_TOURS,
  ].filter((offering) => {
    const name = offering.name.toLowerCase();
    const district = (offering.district || '').toLowerCase();

    return (
      queryLower.includes(name) ||
      (district && queryLower.includes(district)) ||
      (queryLower.includes('stay') && offering.kind === 'stay') ||
      (queryLower.includes('hotel') && offering.kind === 'stay') ||
      (queryLower.includes('resort') && offering.kind === 'stay') ||
      (queryLower.includes('craft') && offering.kind === 'product') ||
      (queryLower.includes('sohrai') && offering.kind === 'product') ||
      (queryLower.includes('tour') && offering.kind === 'tour') ||
      (queryLower.includes('guide') && offering.kind === 'tour') ||
      (queryLower.includes('experience') && offering.kind === 'experience')
    );
  }).slice(0, 3);

  // Check for relevant alerts
  const relevantAlerts = ACTIVE_SYSTEM_ALERTS.filter((alert) => {
    const alertDist = (alert.district || '').toLowerCase();
    return (
      (alertDist && queryLower.includes(alertDist)) ||
      (alert.destination_name && queryLower.includes(alert.destination_name.toLowerCase())) ||
      matchedDestinations.some((d) => d.name.toLowerCase() === alert.destination_name?.toLowerCase())
    );
  });

  // Construct context-rich response
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
  } else if (queryLower.includes('deoghar') || queryLower.includes('temple') || queryLower.includes('religious') || queryLower.includes('shravan')) {
    responseText = `**Deoghar & Spiritual Pilgrimage Circuit**:

• **Baidyanath Dham (Deoghar)**: One of the sacred 12 Jyotirlingas of Lord Shiva and host of the legendary Shravani Mela.
• **Basukinath Dham (Dumka)**: Pilgrimage companion shrine 42 km from Deoghar.
• **Trikuta Hills (Trikut Pahar)**: Sacred three-peaked mountain with ropeway and hermitage caves.
• **Parasnath Shikharji (Giridih)**: Highest summit in Jharkhand (1,365m) and supreme Jain pilgrimage site.`;

    quickActions.push(
      { label: 'View Deoghar Map', action: 'navigate', payload: '/map?district=Deoghar' },
      { label: 'Guided Pilgrimage Tours', action: 'navigate', payload: '/tours' }
    );
  } else if (queryLower.includes('near ranchi') || queryLower.includes('ranchi')) {
    responseText = `**Best Excursions Near Ranchi (within 50 km)**:

1. **Hundru Falls & Dassam Falls** (40–45 km) — Scenic day trips for photography and picnics.
2. **Patratu Valley & Dam** (35 km) — Hairpin roads, lake speedboating, and sunset viewpoints.
3. **Rock Garden & Kanke Dam** (6 km) — City-side landscaped boulder park.
4. **Jagannath Temple Dhurwa** (10 km) — 1691 historic hilltop architectural landmark.
5. **Tagore Hill** (5 km) — Serene viewpoint associated with Jyotirindranath Tagore.`;

    quickActions.push(
      { label: 'Explore Ranchi on Map', action: 'navigate', payload: '/map?district=Ranchi' },
      { label: 'Local Cabs & Transport', action: 'navigate', payload: '/transport' }
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

  // Add safety disclaimer
  responseText += `\n\n> ℹ️ *Official Travel Advisory: Please verify real-time weather and park timings with local authorities before departure.*`;

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responseText,
    timestamp: new Date().toISOString(),
    suggestedDestinations: matchedDestinations.length > 0 ? matchedDestinations : undefined,
    suggestedOfferings: matchedOfferings.length > 0 ? matchedOfferings : undefined,
    alerts: relevantAlerts.length > 0 ? relevantAlerts : undefined,
    quickActions: quickActions.length > 0 ? quickActions : undefined,
  };
}

/**
 * Intelligent Personalized Itinerary Generator
 */
export function generatePersonalizedItinerary(
  input: ItineraryGenerationInput
): GeneratedItinerary {
  const daysCount = Math.max(1, Math.min(input.days, 7));
  const intensity = input.travelIntensity || 'balanced';
  const interests = input.interests.length > 0 ? input.interests : ['waterfall', 'eco', 'culture'];

  const days: ItineraryDay[] = [];

  // District Circuit Selection based on start location and interests
  const startDistrict = input.startLocation.toLowerCase().includes('jamshedpur')
    ? 'East Singhbhum'
    : input.startLocation.toLowerCase().includes('deoghar')
      ? 'Deoghar'
      : input.startLocation.toLowerCase().includes('dhanbad')
        ? 'Dhanbad'
        : 'Ranchi';

  // Base itineraries
  for (let i = 1; i <= daysCount; i++) {
    let dayDistrict = startDistrict;
    let dayTheme = '';
    let schedule: ItineraryDay['schedule'] = [];
    let budgetPerDay = input.budgetTier === 'budget' ? 1200 : input.budgetTier === 'premium' ? 4500 : 2400;

    if (i === 1) {
      dayDistrict = startDistrict;
      dayTheme = startDistrict === 'Ranchi' ? 'City of Waterfalls & Ancient Temples' : `${startDistrict} Arrival & Exploration`;
      
      const hundru = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'hundru-falls');
      const rockGarden = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'rock-garden-ranchi');

      schedule = [
        {
          timeSlot: 'Morning',
          title: 'Arrival & Iconic Hundru Falls Excursion',
          description: 'Experience the 98-metre roaring cascade of Subarnarekha River. Photography along ancient Precambrian rocks.',
          destination: hundru,
          activityType: 'sightseeing',
          durationHours: 3.5,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Traditional Jharkhandi Lunch & Rock Garden',
          description: 'Savor organic local cuisine (Dhuska & Chhilka Roti), followed by walking trails through landscaped rock sculptures.',
          destination: rockGarden,
          activityType: 'relaxation',
          durationHours: 2.5,
        },
        {
          timeSlot: 'Evening',
          title: 'Tribal Cultural Heritage Museum & Craft Shopping',
          description: 'Discover Sohrai GI murals, lost-wax Dhokra bronze artifacts, and musical instruments.',
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
          description: 'Navigate the famous hairpin mountain loop and enjoy peaceful island boating on Patratu reservoir.',
          destination: patratu,
          activityType: 'adventure',
          durationHours: 3,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Lakeside Picnic & Local Fish Thali',
          description: 'Relax at Patratu lake promenade with panoramic Chotanagpur hill views.',
          activityType: 'relaxation',
          durationHours: 2,
        },
        {
          timeSlot: 'Evening',
          title: 'Maa Chhinnamasta Shrine at Rajrappa Sangam',
          description: 'Visit the revered Shakti Peeth situated over the roaring Bhairavi and Damodar river gorge.',
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
          title: 'Netarhat Pine Grove Walks & Koel View Point',
          description: 'Crisp morning mountain walk through British-era pine plantations and sunrise viewpoints.',
          destination: netarhat,
          activityType: 'sightseeing',
          durationHours: 3,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Betla National Park Forest Safari',
          description: 'Open-top jeep safari through Sal forests to spot wild Asian elephants, deer herds, and Chero forts.',
          destination: betla,
          activityType: 'adventure',
          durationHours: 3.5,
        },
        {
          timeSlot: 'Evening',
          title: 'Golden Sunset at Magnolia Point',
          description: 'Witness the iconic sunset over the layered Vindhyan valley ranges with warm tea.',
          destination: netarhat,
          activityType: 'relaxation',
          durationHours: 1.5,
        },
      ];
    } else if (i === 4) {
      dayDistrict = 'East Singhbhum';
      dayTheme = 'Elephant Sanctuary & Steel Heritage';
      const dalma = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'dalma-wildlife-sanctuary');
      const dimna = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'dimna-lake');

      schedule = [
        {
          timeSlot: 'Morning',
          title: 'Dalma Mountain Range Wildlife Exploration',
          description: 'Drive up Dalma hilltop sanctuary for elephant sightings and panoramic view over Jamshedpur valley.',
          destination: dalma,
          activityType: 'adventure',
          durationHours: 3.5,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Dimna Lake Waterfront Relaxation',
          description: 'Serene lakeside promenade nestled in the foothills with watersports and shady groves.',
          destination: dimna,
          activityType: 'relaxation',
          durationHours: 2.5,
        },
        {
          timeSlot: 'Evening',
          title: 'Jubilee Park Illumination & Local Dining',
          description: 'Stroll through rose gardens and musical laser fountains.',
          activityType: 'culture',
          durationHours: 2,
        },
      ];
    } else if (i === 5) {
      dayDistrict = 'Deoghar';
      dayTheme = 'Spiritual Baidyanath Jyotirlinga & Trikut Pahar';
      const baidyanath = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'baidyanath-dham-deoghar');
      const trikut = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'trikut-pahar-deoghar');

      schedule = [
        {
          timeSlot: 'Morning',
          title: 'Sacred Baidyanath Jyotirlinga Darshan',
          description: 'Visit the revered 22-temple shrine complex with traditional priest guidance.',
          destination: baidyanath,
          activityType: 'culture',
          durationHours: 3,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Trikut Pahar Mountain Trails & Ropeway',
          description: 'Ascend the three-peaked holy mountain with views of the Chotanagpur plateau.',
          destination: trikut,
          activityType: 'adventure',
          durationHours: 3,
        },
        {
          timeSlot: 'Evening',
          title: 'Peda Delicacy Tasting & Tower Chowk Markets',
          description: 'Sample authentic Deoghar roasted khoya Peda sweets and local handicraft bazaars.',
          activityType: 'relaxation',
          durationHours: 2,
        },
      ];
    } else if (i === 6) {
      dayDistrict = 'Giridih';
      dayTheme = 'Summit of Jharkhand & Usri River Canyon';
      const parasnath = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'parasnath-shikharji');
      const usri = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'usri-falls');

      schedule = [
        {
          timeSlot: 'Morning',
          title: 'Parasnath Shikharji Footprint Ridge Trail',
          description: 'Hike into the sacred foothills of Jharkhand’s highest peak (1,365 m).',
          destination: parasnath,
          activityType: 'adventure',
          durationHours: 4,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Usri Gorge Cascades & Canyon Picnic',
          description: 'Spectacular three-tiered granite water drop surrounded by dense forests.',
          destination: usri,
          activityType: 'relaxation',
          durationHours: 3,
        },
        {
          timeSlot: 'Evening',
          title: 'Khandoli Adventure Dam Sunset View',
          description: 'Waterside viewpoints, birdwatching, and relaxed photography.',
          activityType: 'sightseeing',
          durationHours: 2,
        },
      ];
    } else {
      dayDistrict = 'West Singhbhum';
      dayTheme = 'Primeval Saranda Forests & Hirni Waterfalls';
      const saranda = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'saranda-forest');
      const hirni = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === 'hirni-falls');

      schedule = [
        {
          timeSlot: 'Morning',
          title: 'Saranda Forest Canopy Trek',
          description: 'Guided nature walk into Asia’s densest Sal woodland along crystal streams.',
          destination: saranda,
          activityType: 'adventure',
          durationHours: 3.5,
        },
        {
          timeSlot: 'Afternoon',
          title: 'Hirni Falls Forest Hanging Bridge Walk',
          description: 'Walk across the wooden bridge overlooking the cascading water plunge.',
          destination: hirni,
          activityType: 'sightseeing',
          durationHours: 2.5,
        },
        {
          timeSlot: 'Evening',
          title: 'Local Tribal Village Immersion & Return',
          description: 'Experience Ho community hospitality, organic forest honey, and tribal folk melodies.',
          activityType: 'culture',
          durationHours: 2,
        },
      ];
    }

    // Match real accommodations and services for this district
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
        'Respect local tribal sacred groves (Sarna Sthal) and obtain permission before filming.',
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
    interests,
    travelIntensity: intensity,
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

  // Detect district mentions
  const matchedDistricts = Object.keys(JHARKHAND_DISTRICTS_DATA).filter((dist) =>
    q.includes(dist.toLowerCase())
  );

  // Match destinations
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

  // Match provider offerings
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
 * Provider AI Content Generator & Enhancer (Never auto-publishes)
 */
export function generateProviderContent(input: {
  kind: 'stay' | 'product' | 'tour' | 'experience' | 'transport';
  title: string;
  district: string;
  keyHighlights: string;
}): {
  enhancedTitle: string;
  shortDescription: string;
  detailedDescription: string;
  amenitiesOrHighlights: string[];
  safetyNotes: string;
} {
  const district = input.district || 'Jharkhand';
  const highlights = input.keyHighlights || 'authentic local experience';

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
    };
  }
}

/**
 * Government Tourism Analytics AI Insights
 */
export function generateGovernmentInsights(_data?: {
  totalDestinations: number;
  totalProviders: number;
  totalOfferings: number;
  pendingFeedbackCount: number;
}): Array<{
  category: 'growth' | 'eco_alert' | 'artisan' | 'demand';
  title: string;
  insight: string;
  actionRecommendation: string;
  urgency: 'high' | 'medium' | 'low';
}> {
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
