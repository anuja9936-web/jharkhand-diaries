/**
 * Curated Marketplace Products, Experiences, Tours & Transport Data for Jharkhand Diaries
 *
 * Conforms to ProviderOffering type for full compatibility with Supabase.
 */

import type { ProviderOffering } from '../types/provider';

export interface MarketplaceItem extends ProviderOffering {
  materials?: string;
  artisan_name?: string;
  craft_tradition?: string;
  dimensions?: string;
  duration?: string;
  rating?: number;
  reviewsCount?: number;
  stock?: number;
  gi_tagged?: boolean;
}

// ---------------------------------------------------------------------------
// 1. Artisan & Marketplace Products
// ---------------------------------------------------------------------------

export const JHARKHAND_MARKETPLACE_PRODUCTS: MarketplaceItem[] = [
  {
    id: 'c2222222-0002-0000-0000-000000000001',
    provider_id: 'a2222222-2222-2222-2222-222222222222',
    kind: 'product',
    name: 'Sohrai Wall Art Painting',
    slug: 'sohrai-wall-art-painting',
    short_description:
      'Authentic GI-certified hand-painted canvas depicting sacred forest motifs created with natural earth clays.',
    description:
      'Created on archival cotton canvas by master women artisans from Hazaribagh using four natural mineral clays: red haematite, white kaolin, manganese black, and yellow ochre. Symbolizes prosperity and ancestral forest harmony.',
    category: 'Handicrafts & Art',
    district: 'Hazaribagh',
    address: 'Bhadal Artisan Village, Hazaribagh',
    price: 2400,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/products/sohrai-canvas.jpg',
    gallery: [
      '/images/products/sohrai-canvas.jpg',
      '/images/art/sohrai-painting.jpg',
    ],
    metadata: {
      craft_tradition: 'Sohrai Wall Painting',
      artisan_name: 'Parvati Devi (National Awardee)',
      materials: 'Natural Earth Pigments on Handmade Khadi Canvas',
      dimensions: '24 x 36 inches',
      gi_tagged: true,
      stock: 8,
      rating: 5.0,
      reviewsCount: 24,
    },
    materials: 'Natural Earth Pigments on Handmade Khadi Canvas',
    artisan_name: 'Parvati Devi (National Awardee)',
    craft_tradition: 'Sohrai Wall Painting',
    dimensions: '24 x 36 inches',
    gi_tagged: true,
    stock: 8,
    rating: 5.0,
    reviewsCount: 24,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2222222-0002-0000-0000-000000000002',
    provider_id: 'a2222222-2222-2222-2222-222222222222',
    kind: 'product',
    name: 'Dhokra Tribal Craft Musician Trio',
    slug: 'dhokra-tribal-craft-musician',
    short_description:
      '4,000-year-old lost-wax bronze metal casting of traditional Mandar, Nagara and Flute tribal musicians.',
    description:
      'Handcrafted in Khunti using the ancient lost-wax metallurgy method. Molten bell metal is hand-poured into intricately coiled beeswax clay moulds. Every piece is an exclusive, unrepeatable cultural artifact.',
    category: 'Handicrafts & Art',
    district: 'Khunti',
    address: 'Torpa Metal Craft Cluster, Khunti',
    price: 1650,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/products/dokra-figurine.jpg',
    gallery: [
      '/images/products/dokra-figurine.jpg',
      '/images/art/dokra-craft.jpg',
    ],
    metadata: {
      craft_tradition: 'Dhokra Lost-Wax Casting',
      artisan_name: 'Budheshwar Karmakar',
      materials: 'Recycled Bell Metal & Brass',
      dimensions: '8 inches height (Set of 3)',
      gi_tagged: false,
      stock: 15,
      rating: 4.9,
      reviewsCount: 31,
    },
    materials: 'Recycled Bell Metal & Brass',
    artisan_name: 'Budheshwar Karmakar',
    craft_tradition: 'Dhokra Lost-Wax Casting',
    dimensions: '8 inches height (Set of 3)',
    gi_tagged: false,
    stock: 15,
    rating: 4.9,
    reviewsCount: 31,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2222222-0002-0000-0000-000000000003',
    provider_id: 'a2222222-2222-2222-2222-222222222222',
    kind: 'product',
    name: 'Tussar Silk Handwoven Stole',
    slug: 'tussar-silk-handwoven-stole',
    short_description:
      'Handloom wild Kuchai Tussar silk stole featuring a radiant golden sheen and traditional tribal border weaves.',
    description:
      'Hand-reeled from wild forest cocoons by women weavers in Ranchi. Lightweight, breathable, and dyed with organic vegetal extracts. Features temple border geometry inspired by traditional saris.',
    category: 'Textiles & Handloom',
    district: 'Ranchi',
    address: 'Jharcraft Silk Weavers Cooperative, Ranchi',
    price: 2100,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/products/tussar-silk.jpg',
    gallery: ['/images/products/tussar-silk.jpg'],
    metadata: {
      craft_tradition: 'Tussar Handloom Weaving',
      artisan_name: 'Kuchai Weavers Collective',
      materials: '100% Organic Forest Tussar Silk',
      dimensions: '2.2 meters x 28 inches',
      gi_tagged: true,
      stock: 20,
      rating: 4.8,
      reviewsCount: 19,
    },
    materials: '100% Organic Forest Tussar Silk',
    artisan_name: 'Kuchai Weavers Collective',
    craft_tradition: 'Tussar Handloom Weaving',
    dimensions: '2.2 meters x 28 inches',
    gi_tagged: true,
    stock: 20,
    rating: 4.8,
    reviewsCount: 19,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// 2. Adventure & Experience Providers
// ---------------------------------------------------------------------------

export const JHARKHAND_MARKETPLACE_EXPERIENCES: MarketplaceItem[] = [
  {
    id: 'c4444444-0004-0000-0000-000000000001',
    provider_id: 'a4444444-4444-4444-4444-444444444444',
    kind: 'experience',
    name: 'Patratu Valley Nature Trek',
    slug: 'patratu-valley-nature-trek',
    short_description:
      'A scenic 3-hour guided hill ridge trek along Patratu ghats overlooking hairpin curves and reservoir waterways.',
    description:
      'Hike with certified adventure guides across rocky mountain outcrops overlooking the famous winding Patratu Valley. Learn about regional flora, birdwatch along ravine streams, and take stunning sunrise or sunset panoramic photographs.',
    category: 'Adventure & Treks',
    district: 'Ramgarh',
    address: 'Patratu Valley Viewpoint Trailhead, Ramgarh',
    price: 850,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/destinations/patratu-valley.jpg',
    gallery: [
      '/images/destinations/patratu-valley.jpg',
      '/images/experiences/lake-kayaking.jpg',
    ],
    metadata: {
      host_name: 'Wild Jharkhand Adventure',
      duration: '3 Hours',
      difficulty: 'Moderate',
      capacity: 12,
      rating: 4.9,
      reviewsCount: 52,
      highlights: ['Trek leader assistance', 'High-res photos', 'Energy snacks & electrolytes', 'Safety gear'],
    },
    duration: '3 Hours',
    artisan_name: 'Wild Jharkhand Adventure',
    rating: 4.9,
    reviewsCount: 52,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c4444444-0004-0000-0000-000000000002',
    provider_id: 'a4444444-4444-4444-4444-444444444444',
    kind: 'experience',
    name: 'Dalma Wildlife Experience',
    slug: 'dalma-wildlife-sanctuary-experience',
    short_description:
      'Deep forest safari through Asian elephant trails, leopard habitats, and hilltop Shiva shrine in Dalma Hills.',
    description:
      'Embark on an open safari exploration into Dalma Wildlife Sanctuary. Accompanied by trained naturalists, observe elephant corridors, barking deer, giant squirrels, and panoramic vistas overlooking the Subarnarekha River valley.',
    category: 'Wildlife Safari',
    district: 'Purbi Singhbhum',
    address: 'Dalma Forest Gate, Near Jamshedpur',
    price: 1250,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/destinations/dalma-wildlife.jpg',
    gallery: [
      '/images/destinations/dalma-wildlife.jpg',
    ],
    metadata: {
      host_name: 'Dalma Eco-Trail Team',
      duration: '4.5 Hours',
      difficulty: 'Easy',
      capacity: 8,
      rating: 4.8,
      reviewsCount: 37,
      highlights: ['Sanctuary permit assistance', 'Binoculars provided', 'Wildlife naturalist talk', 'Sal leaf tea'],
    },
    duration: '4.5 Hours',
    artisan_name: 'Dalma Eco-Trail Team',
    rating: 4.8,
    reviewsCount: 37,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c4444444-0004-0000-0000-000000000003',
    provider_id: 'a4444444-4444-4444-4444-444444444444',
    kind: 'experience',
    name: 'Rural Tribal Village Immersion',
    slug: 'rural-tribal-village-immersion',
    short_description:
      'Hands-on forest foraging, ancestral Dheki grain pounding, and authentic clay-pot cooking of Dhuska & Rugra.',
    description:
      'An authentic cultural and culinary experience in a forest village near Saranda. Forage wild herbs, learn to cook over firewood hearths, grind rice on stone querns, and enjoy hot Chilka Roti served on fresh Sal leaf patras.',
    category: 'Cultural Workshops',
    district: 'West Singhbhum',
    address: 'Manoharpur Village Kitchen, West Singhbhum',
    price: 950,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/experiences/tribal-cooking.jpg',
    gallery: [
      '/images/experiences/tribal-cooking.jpg',
      '/images/cuisine/dhuska.jpg',
    ],
    metadata: {
      host_name: 'Santhali Hearth Collective',
      duration: '4 Hours',
      difficulty: 'Easy',
      capacity: 10,
      rating: 5.0,
      reviewsCount: 28,
      highlights: ['Full traditional 4-course meal', 'Herbal tea tasting', 'Traditional recipe cards'],
    },
    duration: '4 Hours',
    artisan_name: 'Santhali Hearth Collective',
    rating: 5.0,
    reviewsCount: 28,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// 3. Guide & Tour Operators
// ---------------------------------------------------------------------------

export const JHARKHAND_CURATED_TOURS: ProviderOffering[] = [
  {
    id: 'c3333333-0003-0000-0000-000000000001',
    provider_id: 'a3333333-3333-3333-3333-333333333333',
    kind: 'tour',
    name: 'Ranchi Waterfall Circuit Guided Tour',
    slug: 'ranchi-waterfall-circuit-tour',
    short_description:
      'A full-day guided exploration of Ranchi’s iconic waterfalls: Hundru (98m), Dassam (44m), and Jonha Falls with tribal folklore.',
    description:
      'Depart from Ranchi with a certified nature guide. Hike down Precambrian granite steps at Hundru Falls, photograph the stepped canyon cascade of Dassam Falls, and enjoy hot Dhuska and Chai at Jonha village.',
    category: 'Nature & Waterfalls',
    district: 'Ranchi',
    address: 'Ranchi City Pickup & Drops',
    price: 1500,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/destinations/hundru-falls.jpg',
    gallery: ['/images/destinations/hundru-falls.jpg', '/images/destinations/dassam-falls.jpg'],
    metadata: {
      guide_name: 'Ratan Murmu',
      duration: '7 Hours',
      max_participants: 8,
      languages: ['Hindi', 'English', 'Nagpuri'],
      includes: ['Guide fees', 'Entry tickets', 'Traditional snack box', 'First aid support'],
      rating: 4.9,
      reviews_count: 45,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3333333-0003-0000-0000-000000000002',
    provider_id: 'a3333333-3333-3333-3333-333333333333',
    kind: 'tour',
    name: 'Tribal Culture & Sohrai Heritage Walk',
    slug: 'tribal-culture-sohrai-heritage-walk',
    short_description:
      'An intimate 5-hour guided trail through living painted art villages, Santali Akhra grounds, and master artisan ateliers.',
    description:
      'Walk through heritage mural lanes in Hazaribagh. Learn how mud walls are painted during Sohrai harvest festival, participate in a brief clay tile workshop, and enjoy an authentic satvik organic lunch.',
    category: 'Heritage & Culture',
    district: 'Hazaribagh',
    address: 'Bhadal Heritage Art Village, Hazaribagh',
    price: 1100,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/destinations/hazaribagh.jpg',
    gallery: ['/images/destinations/hazaribagh.jpg', '/images/experiences/sohrai-workshop.jpg'],
    metadata: {
      guide_name: 'Parvati Devi Guild Guides',
      duration: '5 Hours',
      max_participants: 10,
      languages: ['Hindi', 'Santali', 'English'],
      includes: ['Village entry', 'Local organic lunch', 'Take-home painted souvenir'],
      rating: 5.0,
      reviews_count: 32,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3333333-0003-0000-0000-000000000003',
    provider_id: 'a3333333-3333-3333-3333-333333333333',
    kind: 'tour',
    name: 'Deoghar Heritage & Temple Circuit Tour',
    slug: 'deoghar-heritage-temple-tour',
    short_description:
      'Comprehensive guided spiritual circuit covering Baidyanath Jyotirlinga Dham, Naulakha Mandir, and Trikuta Parvat ropeway.',
    description:
      'Expert spiritual and architectural tour of ancient Deoghar. Skip the long lines with local guide assistance, discover historical inscriptions dating back centuries, and take the scenic ropeway to the three peaks of Trikuta Hill.',
    category: 'Spiritual & Heritage',
    district: 'Deoghar',
    address: 'Baidyanath Dham Temple Area, Deoghar',
    price: 1350,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/destinations/deoghar-baidyanath.jpg',
    gallery: ['/images/destinations/deoghar-baidyanath.jpg'],
    metadata: {
      guide_name: 'Pandit Sharma & Associates',
      duration: '6 Hours',
      max_participants: 12,
      languages: ['Hindi', 'Bengali', 'English'],
      includes: ['Temple protocol guidance', 'Ropeway coordination', 'Prasadam snack box'],
      rating: 4.8,
      reviews_count: 68,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// 4. Transport & Travel Providers
// ---------------------------------------------------------------------------

export const JHARKHAND_CURATED_TRANSPORT: ProviderOffering[] = [
  {
    id: 'c5555555-0005-0000-0000-000000000001',
    provider_id: 'a5555555-5555-5555-5555-555555555555',
    kind: 'transport',
    name: 'Ranchi–Patratu Tourist Cab',
    slug: 'ranchi-patratu-tourist-cab',
    short_description:
      'Reliable AC Sedan / SUV return transfer covering Ranchi city, Kanke Dam, and Patratu Valley ghat viewpoints.',
    description:
      'Punctual tourist taxi service with polite, experienced local drivers. Ideal for half-day or full-day excursions to Patratu Valley. Includes flexible stops at scenic hairpin turns, boating complex, and valley dhabas.',
    category: 'Sightseeing Cab',
    district: 'Ranchi',
    address: 'Pickup from any hotel / airport in Ranchi',
    price: 2200,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/destinations/ranchi-skyline.jpg',
    gallery: ['/images/destinations/ranchi-skyline.jpg'],
    metadata: {
      vehicle_type: 'AC Sedan / Toyota Innova',
      seating_capacity: 4,
      ac_available: true,
      features: ['Professional Driver', 'Tolls & Fuel Included', 'Flexible Itinerary', 'Mineral Water Bottles'],
      rating: 4.8,
      reviews_count: 62,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c5555555-0005-0000-0000-000000000002',
    provider_id: 'a5555555-5555-5555-5555-555555555555',
    kind: 'transport',
    name: 'Ranchi–Netarhat Tourist Vehicle',
    slug: 'ranchi-netarhat-tourist-vehicle',
    short_description:
      'Rugged 4x4 off-road SUV transfer for the high-altitude Ranchi–Latehar–Netarhat mountain road circuit.',
    description:
      'Traverse the picturesque forest roads of Chotanagpur to the Netarhat hills with peace of mind. Robust 4x4 vehicle driven by experienced ghat drivers capable of navigating steep switchbacks, forest river passes, and remote sunrise points.',
    category: 'Outstation Vehicle',
    district: 'Latehar',
    address: 'Pickup in Ranchi | Drop in Netarhat',
    price: 4800,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/destinations/netarhat.jpg',
    gallery: ['/images/destinations/netarhat.jpg'],
    metadata: {
      vehicle_type: 'Mahindra 4x4 / Scorpio SUV',
      seating_capacity: 6,
      ac_available: true,
      features: ['All Terrain Capable', 'Emergency Toolset', 'Experienced Ghat Driver', 'Luggage Carrier'],
      rating: 4.9,
      reviews_count: 44,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c5555555-0005-0000-0000-000000000003',
    provider_id: 'a5555555-5555-5555-5555-555555555555',
    kind: 'transport',
    name: 'Deoghar Local Sightseeing Cab',
    slug: 'deoghar-local-sightseeing-cab',
    short_description:
      'Full-day local AC tourist taxi covering Baidyanath Dham, Tapovan Caves, Trikuta Hills, and Jasidih station.',
    description:
      'Clean, comfortable local cab service for temple pilgrims and travelers in Deoghar. Covers all major shrines, historical caves, and airport/railway transfers with zero surge pricing.',
    category: 'City Taxi',
    district: 'Deoghar',
    address: 'Deoghar Airport / Jasidih Station / Hotels',
    price: 1800,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/destinations/deoghar-baidyanath.jpg',
    gallery: ['/images/destinations/deoghar-baidyanath.jpg'],
    metadata: {
      vehicle_type: 'AC Sedan (Swift Dzire / Etios)',
      seating_capacity: 4,
      ac_available: true,
      features: ['Station & Airport Pickup', 'Temple Circuit Routing', 'Fixed Transparent Fare', 'Luggage Space'],
      rating: 4.7,
      reviews_count: 89,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
