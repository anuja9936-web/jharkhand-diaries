-- ==============================================================================
-- Jharkhand Diaries — Real Provider Ecosystem Demo / Seed Data (Phase 8)
-- ==============================================================================
-- Safe, idempotent seed script providing realistic demo records for all 5
-- provider categories with proper foreign key handling and unverified status.
-- ==============================================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. Create or ensure Demo Provider Auth & Profile records
-- ------------------------------------------------------------------------------

-- Provider 1: Accommodation Provider
insert into public.profiles (
  id,
  full_name,
  business_name,
  owner_name,
  role,
  verification_status,
  district,
  state,
  phone,
  provider_categories,
  description,
  created_at,
  updated_at
) values (
  'a1111111-1111-1111-1111-111111111111',
  'Sunita Hembrom',
  'Patratu & Netarhat Eco-Stays Collective',
  'Sunita Hembrom',
  'provider',
  'unverified',
  'Ramgarh',
  'Jharkhand',
  '+91 94311 22334',
  array['accommodation']::text[],
  'Community-led eco-lodges, rustic forest chalets, and heritage homestays across Ramgarh and Latehar.',
  now(),
  now()
) on conflict (id) do update set
  business_name = excluded.business_name,
  role = 'provider',
  verification_status = 'unverified',
  provider_categories = excluded.provider_categories;

-- Provider 2: Artisan & Marketplace Provider
insert into public.profiles (
  id,
  full_name,
  business_name,
  owner_name,
  role,
  verification_status,
  district,
  state,
  phone,
  provider_categories,
  description,
  created_at,
  updated_at
) values (
  'a2222222-2222-2222-2222-222222222222',
  'Budheshwar Karmakar',
  'Hazaribagh & Khunti Tribal Artisan Guild',
  'Budheshwar Karmakar',
  'provider',
  'unverified',
  'Hazaribagh',
  'Jharkhand',
  '+91 98351 44556',
  array['artisan']::text[],
  'Master artisans creating authentic GI Sohrai canvas paintings, lost-wax Dhokra brass castings, and handloom silks.',
  now(),
  now()
) on conflict (id) do update set
  business_name = excluded.business_name,
  role = 'provider',
  verification_status = 'unverified',
  provider_categories = excluded.provider_categories;

-- Provider 3: Guide & Tour Operator
insert into public.profiles (
  id,
  full_name,
  business_name,
  owner_name,
  role,
  verification_status,
  district,
  state,
  phone,
  provider_categories,
  description,
  created_at,
  updated_at
) values (
  'a3333333-3333-3333-3333-333333333333',
  'Ratan Murmu',
  'Jharkhand Heritage Guides & Explorers',
  'Ratan Murmu',
  'provider',
  'unverified',
  'Ranchi',
  'Jharkhand',
  '+91 97712 66778',
  array['guide']::text[],
  'Certified local guides for waterfall circuits, tribal culture walks, and heritage temple circuits.',
  now(),
  now()
) on conflict (id) do update set
  business_name = excluded.business_name,
  role = 'provider',
  verification_status = 'unverified',
  provider_categories = excluded.provider_categories;

-- Provider 4: Adventure & Experience Provider
insert into public.profiles (
  id,
  full_name,
  business_name,
  owner_name,
  role,
  verification_status,
  district,
  state,
  phone,
  provider_categories,
  description,
  created_at,
  updated_at
) values (
  'a4444444-4444-4444-4444-444444444444',
  'Kunal Bedia',
  'Wild Jharkhand Adventure & Trekking Co.',
  'Kunal Bedia',
  'provider',
  'unverified',
  'Ramgarh',
  'Jharkhand',
  '+91 93045 88990',
  array['adventure']::text[],
  'Curated outdoor experiences: valley treks, watersports, wildlife walks, and authentic tribal culinary classes.',
  now(),
  now()
) on conflict (id) do update set
  business_name = excluded.business_name,
  role = 'provider',
  verification_status = 'unverified',
  provider_categories = excluded.provider_categories;

-- Provider 5: Transport & Travel Provider
insert into public.profiles (
  id,
  full_name,
  business_name,
  owner_name,
  role,
  verification_status,
  district,
  state,
  phone,
  provider_categories,
  description,
  created_at,
  updated_at
) values (
  'a5555555-5555-5555-5555-555555555555',
  'Vikram Soren',
  'Jharkhand Tourist Cab & Safari Fleet',
  'Vikram Soren',
  'provider',
  'unverified',
  'Ranchi',
  'Jharkhand',
  '+91 91223 77889',
  array['transport']::text[],
  'Dedicated tourist tourist cabs, AC sedans, and 4x4 expedition vehicles connecting all 24 Jharkhand districts.',
  now(),
  now()
) on conflict (id) do update set
  business_name = excluded.business_name,
  role = 'provider',
  verification_status = 'unverified',
  provider_categories = excluded.provider_categories;


-- ------------------------------------------------------------------------------
-- 2. Seed Stays & Accommodation Offerings
-- ------------------------------------------------------------------------------

insert into public.provider_offerings (
  id,
  provider_id,
  kind,
  name,
  slug,
  short_description,
  description,
  category,
  district,
  address,
  price,
  currency,
  status,
  cover_image,
  gallery,
  metadata
) values
(
  'c1111111-0001-0000-0000-000000000001',
  'a1111111-1111-1111-1111-111111111111',
  'stay',
  'Patratu Valley Eco Stay',
  'patratu-valley-eco-stay',
  'Serene waterfront stone cottages overlooking the Patratu reservoir and winding ghats with organic tribal dining.',
  'Nestled alongside Patratu Lake with panoramic mountain views. Experience authentic rural hospitality, peaceful sunset deck views, speedboating access, and locally harvested farm-fresh thalis.',
  'Eco-Resort',
  'Ramgarh',
  'Patratu Waterfront Drive, Ramgarh District',
  3200,
  'INR',
  'published',
  '/images/stays/lake-resort.jpg',
  array['/images/stays/lake-resort.jpg', '/images/destinations/patratu-valley.jpg'],
  jsonb_build_object(
    'property_type', 'Eco-Resort',
    'capacity', 4,
    'rating', 4.9,
    'reviewsCount', 42,
    'amenities', array['Lake View Balcony', 'Speedboat Access', 'Bonfire & Grill', 'Solar Power', 'Organic Kitchen'],
    'host_name', 'Sunita Hembrom'
  )
),
(
  'c1111111-0001-0000-0000-000000000002',
  'a1111111-1111-1111-1111-111111111111',
  'stay',
  'Netarhat Forest Homestay',
  'netarhat-forest-homestay',
  'Wooden timber chalets on the Netarhat plateau surrounded by mist-laden pine groves near Magnolia Point.',
  'Located at an altitude of 3,600 feet in Netarhat. Enjoy crisp mountain air, panoramic dawn sunrises over Koel river valley, and home-cooked traditional Munda and Oraon dishes.',
  'Forest Cottage',
  'Latehar',
  'Upper Ridge Road, Near Magnolia Sunset Point, Netarhat',
  2200,
  'INR',
  'published',
  '/images/stays/pine-eco-lodge.jpg',
  array['/images/stays/pine-eco-lodge.jpg', '/images/destinations/netarhat.jpg'],
  jsonb_build_object(
    'property_type', 'Forest Cottage',
    'capacity', 3,
    'rating', 4.9,
    'reviewsCount', 38,
    'amenities', array['Pine Forest Trail', 'Solar Heating', 'Campfire Area', 'Home-cooked Meals', 'Free Parking'],
    'host_name', 'Latehar Eco-Stays'
  )
),
(
  'c1111111-0001-0000-0000-000000000003',
  'a1111111-1111-1111-1111-111111111111',
  'stay',
  'Deoghar Heritage Stay',
  'deoghar-heritage-stay',
  'Traditional red-oxide courtyard home offering serene satvik dining within walking distance of Baidyanath Dham.',
  'A heritage courtyard home operated by a local family near Baidyanath Dham. Enjoy peaceful surroundings, pure satvik thali meals, and personalized guidance for temple darshan and local crafts.',
  'Village Homestay',
  'Deoghar',
  'Temple Chowk Heritage Lane, Deoghar',
  1800,
  'INR',
  'published',
  '/images/stays/heritage-homestay.jpg',
  array['/images/stays/heritage-homestay.jpg', '/images/destinations/deoghar-baidyanath.jpg'],
  jsonb_build_object(
    'property_type', 'Village Homestay',
    'capacity', 5,
    'rating', 4.8,
    'reviewsCount', 56,
    'amenities', array['Satvik Thali Included', 'Air Conditioning', 'Family Courtyard', 'Temple Guide Assistance', 'Wi-Fi'],
    'host_name', 'Pandit Sharma & Family'
  )
)
on conflict (provider_id, kind, slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  status = excluded.status,
  cover_image = excluded.cover_image,
  metadata = excluded.metadata,
  updated_at = now();


-- ------------------------------------------------------------------------------
-- 3. Seed Artisan & Marketplace Product Offerings
-- ------------------------------------------------------------------------------

insert into public.provider_offerings (
  id,
  provider_id,
  kind,
  name,
  slug,
  short_description,
  description,
  category,
  district,
  address,
  price,
  currency,
  status,
  cover_image,
  gallery,
  metadata
) values
(
  'c2222222-0002-0000-0000-000000000001',
  'a2222222-2222-2222-2222-222222222222',
  'product',
  'Sohrai Wall Art Painting',
  'sohrai-wall-art-painting',
  'Authentic GI-certified hand-painted canvas depicting sacred forest motifs created with natural earth clays.',
  'Created on archival cotton canvas by master women artisans from Hazaribagh using four natural mineral clays: red haematite, white kaolin, manganese black, and yellow ochre. Symbolizes prosperity and ancestral forest harmony.',
  'Handicrafts & Art',
  'Hazaribagh',
  'Bhadal Artisan Village, Hazaribagh',
  2400,
  'INR',
  'published',
  '/images/products/sohrai-canvas.jpg',
  array['/images/products/sohrai-canvas.jpg', '/images/art/sohrai-painting.jpg'],
  jsonb_build_object(
    'artisan_name', 'Parvati Devi (National Awardee)',
    'craft_tradition', 'Sohrai Wall Painting',
    'dimensions', '24 x 36 inches',
    'gi_tagged', true,
    'stock', 8,
    'rating', 5.0,
    'reviewsCount', 24
  )
),
(
  'c2222222-0002-0000-0000-000000000002',
  'a2222222-2222-2222-2222-222222222222',
  'product',
  'Dhokra Tribal Craft Musician Trio',
  'dhokra-tribal-craft-musician',
  '4,000-year-old lost-wax bronze metal casting of traditional Mandar, Nagara and Flute tribal musicians.',
  'Handcrafted in Khunti using the ancient lost-wax metallurgy method. Molten bell metal is hand-poured into intricately coiled beeswax clay moulds. Every piece is an exclusive, unrepeatable cultural artifact.',
  'Handicrafts & Art',
  'Khunti',
  'Torpa Metal Craft Cluster, Khunti',
  1650,
  'INR',
  'published',
  '/images/products/dokra-figurine.jpg',
  array['/images/products/dokra-figurine.jpg', '/images/art/dokra-craft.jpg'],
  jsonb_build_object(
    'artisan_name', 'Budheshwar Karmakar',
    'craft_tradition', 'Dhokra Lost-Wax Casting',
    'dimensions', '8 inches height (Set of 3)',
    'gi_tagged', false,
    'stock', 15,
    'rating', 4.9,
    'reviewsCount', 31
  )
),
(
  'c2222222-0002-0000-0000-000000000003',
  'a2222222-2222-2222-2222-222222222222',
  'product',
  'Tussar Silk Handwoven Stole',
  'tussar-silk-handwoven-stole',
  'Handloom wild Kuchai Tussar silk stole featuring a radiant golden sheen and traditional tribal border weaves.',
  'Hand-reeled from wild forest cocoons by women weavers in Ranchi. Lightweight, breathable, and dyed with organic vegetal extracts. Features temple border geometry inspired by traditional saris.',
  'Textiles & Handloom',
  'Ranchi',
  'Jharcraft Silk Weavers Cooperative, Ranchi',
  2100,
  'INR',
  'published',
  '/images/products/tussar-silk.jpg',
  array['/images/products/tussar-silk.jpg'],
  jsonb_build_object(
    'artisan_name', 'Kuchai Weavers Collective',
    'craft_tradition', 'Tussar Handloom Weaving',
    'dimensions', '2.2 meters x 28 inches',
    'gi_tagged', true,
    'stock', 20,
    'rating', 4.8,
    'reviewsCount', 19
  )
)
on conflict (provider_id, kind, slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  status = excluded.status,
  cover_image = excluded.cover_image,
  metadata = excluded.metadata,
  updated_at = now();


-- ------------------------------------------------------------------------------
-- 4. Seed Guide & Tour Operator Offerings
-- ------------------------------------------------------------------------------

insert into public.provider_offerings (
  id,
  provider_id,
  kind,
  name,
  slug,
  short_description,
  description,
  category,
  district,
  address,
  price,
  currency,
  status,
  cover_image,
  gallery,
  metadata
) values
(
  'c3333333-0003-0000-0000-000000000001',
  'a3333333-3333-3333-3333-333333333333',
  'tour',
  'Ranchi Waterfall Circuit Guided Tour',
  'ranchi-waterfall-circuit-tour',
  'A full-day guided exploration of Ranchi’s iconic waterfalls: Hundru (98m), Dassam (44m), and Jonha Falls with tribal folklore.',
  'Depart from Ranchi with a certified nature guide. Hike down Precambrian granite steps at Hundru Falls, photograph the stepped canyon cascade of Dassam Falls, and enjoy hot Dhuska and Chai at Jonha village.',
  'Nature & Waterfalls',
  'Ranchi',
  'Ranchi City Pickup & Drops',
  1500,
  'INR',
  'published',
  '/images/destinations/hundru-falls.jpg',
  array['/images/destinations/hundru-falls.jpg', '/images/destinations/dassam-falls.jpg'],
  jsonb_build_object(
    'guide_name', 'Ratan Murmu',
    'duration', '7 Hours',
    'max_participants', 8,
    'languages', array['Hindi', 'English', 'Nagpuri'],
    'includes', array['Guide fees', 'Entry tickets', 'Traditional snack box', 'First aid support'],
    'rating', 4.9,
    'reviews_count', 45
  )
),
(
  'c3333333-0003-0000-0000-000000000002',
  'a3333333-3333-3333-3333-333333333333',
  'tour',
  'Tribal Culture & Sohrai Heritage Walk',
  'tribal-culture-sohrai-heritage-walk',
  'An intimate 5-hour guided trail through living painted art villages, Santali Akhra grounds, and master artisan ateliers.',
  'Walk through heritage mural lanes in Hazaribagh. Learn how mud walls are painted during Sohrai harvest festival, participate in a brief clay tile workshop, and enjoy an authentic satvik organic lunch.',
  'Heritage & Culture',
  'Hazaribagh',
  'Bhadal Heritage Art Village, Hazaribagh',
  1100,
  'INR',
  'published',
  '/images/destinations/hazaribagh.jpg',
  array['/images/destinations/hazaribagh.jpg', '/images/experiences/sohrai-workshop.jpg'],
  jsonb_build_object(
    'guide_name', 'Parvati Devi Guild Guides',
    'duration', '5 Hours',
    'max_participants', 10,
    'languages', array['Hindi', 'Santali', 'English'],
    'includes', array['Village entry', 'Local organic lunch', 'Take-home painted souvenir'],
    'rating', 5.0,
    'reviews_count', 32
  )
),
(
  'c3333333-0003-0000-0000-000000000003',
  'a3333333-3333-3333-3333-333333333333',
  'tour',
  'Deoghar Heritage & Temple Circuit Tour',
  'deoghar-heritage-temple-tour',
  'Comprehensive guided spiritual circuit covering Baidyanath Jyotirlinga Dham, Naulakha Mandir, and Trikuta Parvat ropeway.',
  'Expert spiritual and architectural tour of ancient Deoghar. Skip the long lines with local guide assistance, discover historical inscriptions dating back centuries, and take the scenic ropeway to the three peaks of Trikuta Hill.',
  'Spiritual & Heritage',
  'Deoghar',
  'Baidyanath Dham Temple Area, Deoghar',
  1350,
  'INR',
  'published',
  '/images/destinations/deoghar-baidyanath.jpg',
  array['/images/destinations/deoghar-baidyanath.jpg'],
  jsonb_build_object(
    'guide_name', 'Pandit Sharma & Associates',
    'duration', '6 Hours',
    'max_participants', 12,
    'languages', array['Hindi', 'Bengali', 'English'],
    'includes', array['Temple protocol guidance', 'Ropeway coordination', 'Prasadam snack box'],
    'rating', 4.8,
    'reviews_count', 68
  )
)
on conflict (provider_id, kind, slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  status = excluded.status,
  cover_image = excluded.cover_image,
  metadata = excluded.metadata,
  updated_at = now();


-- ------------------------------------------------------------------------------
-- 5. Seed Adventure & Experience Offerings
-- ------------------------------------------------------------------------------

insert into public.provider_offerings (
  id,
  provider_id,
  kind,
  name,
  slug,
  short_description,
  description,
  category,
  district,
  address,
  price,
  currency,
  status,
  cover_image,
  gallery,
  metadata
) values
(
  'c4444444-0004-0000-0000-000000000001',
  'a4444444-4444-4444-4444-444444444444',
  'experience',
  'Patratu Valley Nature Trek',
  'patratu-valley-nature-trek',
  'A scenic 3-hour guided hill ridge trek along Patratu ghats overlooking hairpin curves and reservoir waterways.',
  'Hike with certified adventure guides across rocky mountain outcrops overlooking the famous winding Patratu Valley. Learn about regional flora, birdwatch along ravine streams, and take stunning sunrise or sunset panoramic photographs.',
  'Adventure & Treks',
  'Ramgarh',
  'Patratu Valley Viewpoint Trailhead, Ramgarh',
  850,
  'INR',
  'published',
  '/images/destinations/patratu-valley.jpg',
  array['/images/destinations/patratu-valley.jpg', '/images/experiences/lake-kayaking.jpg'],
  jsonb_build_object(
    'host_name', 'Wild Jharkhand Adventure',
    'duration', '3 Hours',
    'difficulty', 'Moderate',
    'capacity', 12,
    'rating', 4.9,
    'reviewsCount', 52,
    'highlights', array['Trek leader assistance', 'High-res photos', 'Energy snacks & electrolytes', 'Safety gear']
  )
),
(
  'c4444444-0004-0000-0000-000000000002',
  'a4444444-4444-4444-4444-444444444444',
  'experience',
  'Dalma Wildlife Experience',
  'dalma-wildlife-sanctuary-experience',
  'Deep forest safari through Asian elephant trails, leopard habitats, and hilltop Shiva shrine in Dalma Hills.',
  'Embark on an open safari exploration into Dalma Wildlife Sanctuary. Accompanied by trained naturalists, observe elephant corridors, barking deer, giant squirrels, and panoramic vistas overlooking the Subarnarekha River valley.',
  'Wildlife Safari',
  'Purbi Singhbhum',
  'Dalma Forest Gate, Near Jamshedpur',
  1250,
  'INR',
  'published',
  '/images/destinations/dalma-wildlife.jpg',
  array['/images/destinations/dalma-wildlife.jpg'],
  jsonb_build_object(
    'host_name', 'Dalma Eco-Trail Team',
    'duration', '4.5 Hours',
    'difficulty', 'Easy',
    'capacity', 8,
    'rating', 4.8,
    'reviewsCount', 37,
    'highlights', array['Sanctuary permit assistance', 'Binoculars provided', 'Wildlife naturalist talk', 'Sal leaf tea']
  )
),
(
  'c4444444-0004-0000-0000-000000000003',
  'a4444444-4444-4444-4444-444444444444',
  'experience',
  'Rural Tribal Village Immersion',
  'rural-tribal-village-immersion',
  'Hands-on forest foraging, ancestral Dheki grain pounding, and authentic clay-pot cooking of Dhuska & Rugra.',
  'An authentic cultural and culinary experience in a forest village near Saranda. Forage wild herbs, learn to cook over firewood hearths, grind rice on stone querns, and enjoy hot Chilka Roti served on fresh Sal leaf patras.',
  'Cultural Workshops',
  'West Singhbhum',
  'Manoharpur Village Kitchen, West Singhbhum',
  950,
  'INR',
  'published',
  '/images/experiences/tribal-cooking.jpg',
  array['/images/experiences/tribal-cooking.jpg', '/images/cuisine/dhuska.jpg'],
  jsonb_build_object(
    'host_name', 'Santhali Hearth Collective',
    'duration', '4 Hours',
    'difficulty', 'Easy',
    'capacity', 10,
    'rating', 5.0,
    'reviewsCount', 28,
    'highlights', array['Full traditional 4-course meal', 'Herbal tea tasting', 'Traditional recipe cards']
  )
)
on conflict (provider_id, kind, slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  status = excluded.status,
  cover_image = excluded.cover_image,
  metadata = excluded.metadata,
  updated_at = now();


-- ------------------------------------------------------------------------------
-- 6. Seed Transport & Travel Offerings
-- ------------------------------------------------------------------------------

insert into public.provider_offerings (
  id,
  provider_id,
  kind,
  name,
  slug,
  short_description,
  description,
  category,
  district,
  address,
  price,
  currency,
  status,
  cover_image,
  gallery,
  metadata
) values
(
  'c5555555-0005-0000-0000-000000000001',
  'a5555555-5555-5555-5555-555555555555',
  'transport',
  'Ranchi–Patratu Tourist Cab',
  'ranchi-patratu-tourist-cab',
  'Reliable AC Sedan / SUV return transfer covering Ranchi city, Kanke Dam, and Patratu Valley ghat viewpoints.',
  'Punctual tourist taxi service with polite, experienced local drivers. Ideal for half-day or full-day excursions to Patratu Valley. Includes flexible stops at scenic hairpin turns, boating complex, and valley dhabas.',
  'Sightseeing Cab',
  'Ranchi',
  'Pickup from any hotel / airport in Ranchi',
  2200,
  'INR',
  'published',
  '/images/destinations/ranchi-skyline.jpg',
  array['/images/destinations/ranchi-skyline.jpg'],
  jsonb_build_object(
    'vehicle_type', 'AC Sedan / Toyota Innova',
    'seating_capacity', 4,
    'ac_available', true,
    'features', array['Professional Driver', 'Tolls & Fuel Included', 'Flexible Itinerary', 'Mineral Water Bottles'],
    'rating', 4.8,
    'reviews_count', 62
  )
),
(
  'c5555555-0005-0000-0000-000000000002',
  'a5555555-5555-5555-5555-555555555555',
  'transport',
  'Ranchi–Netarhat Tourist Vehicle',
  'ranchi-netarhat-tourist-vehicle',
  'Rugged 4x4 off-road SUV transfer for the high-altitude Ranchi–Latehar–Netarhat mountain road circuit.',
  'Traverse the picturesque forest roads of Chotanagpur to the Netarhat hills with peace of mind. Robust 4x4 vehicle driven by experienced ghat drivers capable of navigating steep switchbacks, forest river passes, and remote sunrise points.',
  'Outstation Vehicle',
  'Latehar',
  'Pickup in Ranchi | Drop in Netarhat',
  4800,
  'INR',
  'published',
  '/images/destinations/netarhat.jpg',
  array['/images/destinations/netarhat.jpg'],
  jsonb_build_object(
    'vehicle_type', 'Mahindra 4x4 / Scorpio SUV',
    'seating_capacity', 6,
    'ac_available', true,
    'features', array['All Terrain Capable', 'Emergency Toolset', 'Experienced Ghat Driver', 'Luggage Carrier'],
    'rating', 4.9,
    'reviews_count', 44
  )
),
(
  'c5555555-0005-0000-0000-000000000003',
  'a5555555-5555-5555-5555-555555555555',
  'transport',
  'Deoghar Local Sightseeing Cab',
  'deoghar-local-sightseeing-cab',
  'Full-day local AC tourist taxi covering Baidyanath Dham, Tapovan Caves, Trikuta Hills, and Jasidih station.',
  'Clean, comfortable local cab service for temple pilgrims and travelers in Deoghar. Covers all major shrines, historical caves, and airport/railway transfers with zero surge pricing.',
  'City Taxi',
  'Deoghar',
  'Deoghar Airport / Jasidih Station / Hotels',
  1800,
  'INR',
  'published',
  '/images/destinations/deoghar-baidyanath.jpg',
  array['/images/destinations/deoghar-baidyanath.jpg'],
  jsonb_build_object(
    'vehicle_type', 'AC Sedan (Swift Dzire / Etios)',
    'seating_capacity', 4,
    'ac_available', true,
    'features', array['Station & Airport Pickup', 'Temple Circuit Routing', 'Fixed Transparent Fare', 'Luggage Space'],
    'rating', 4.7,
    'reviews_count', 89
  )
)
on conflict (provider_id, kind, slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  status = excluded.status,
  cover_image = excluded.cover_image,
  metadata = excluded.metadata,
  updated_at = now();
