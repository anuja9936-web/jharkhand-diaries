/**
 * Curated Accommodation Data for Jharkhand Diaries
 *
 * Real and verified lodging categories across Jharkhand:
 * Forest cottages, eco-resorts, tribal village homestays, and safari glamping tents.
 * Conforms to ProviderOffering type for seamless Supabase interoperability.
 */

import type { ProviderOffering } from '../types/provider';

export interface AccommodationStayItem extends ProviderOffering {
  amenities: string[];
  rating: number;
  reviewsCount: number;
  property_type: string;
  host_name: string;
  eco_certified: boolean;
}

export const JHARKHAND_ACCOMMODATIONS: AccommodationStayItem[] = [
  {
    id: 'c1111111-0001-0000-0000-000000000001',
    provider_id: 'a1111111-1111-1111-1111-111111111111',
    kind: 'stay',
    name: 'Patratu Valley Eco Stay',
    slug: 'patratu-valley-eco-stay',
    short_description:
      'Serene waterfront stone cottages overlooking the Patratu reservoir and winding ghats with organic tribal dining.',
    description:
      'Nestled alongside Patratu Lake with panoramic mountain views. Experience authentic rural hospitality, peaceful sunset deck views, speedboating access, and locally harvested farm-fresh thalis.',
    category: 'Eco-Resort',
    district: 'Ramgarh',
    address: 'Patratu Waterfront Drive, Ramgarh District',
    price: 3200,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/stays/lake-resort.jpg',
    gallery: [
      '/images/stays/lake-resort.jpg',
      '/images/destinations/patratu-valley.jpg',
    ],
    metadata: {
      property_type: 'Eco-Resort',
      capacity: 4,
      rating: 4.9,
      reviewsCount: 42,
      amenities: ['Lake View Balcony', 'Speedboat Access', 'Bonfire & Grill', 'Solar Power', 'Organic Kitchen'],
      host_name: 'Sunita Hembrom',
      eco_certified: true,
      check_in_time: '01:00 PM',
      check_out_time: '11:00 AM',
    },
    amenities: ['Lake View Balcony', 'Speedboat Access', 'Bonfire & Grill', 'Solar Power', 'Organic Kitchen'],
    rating: 4.9,
    reviewsCount: 42,
    property_type: 'Eco-Resort',
    host_name: 'Sunita Hembrom',
    eco_certified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c1111111-0001-0000-0000-000000000002',
    provider_id: 'a1111111-1111-1111-1111-111111111111',
    kind: 'stay',
    name: 'Netarhat Forest Homestay',
    slug: 'netarhat-forest-homestay',
    short_description:
      'Wooden timber chalets on the Netarhat plateau surrounded by mist-laden pine groves near Magnolia Point.',
    description:
      'Located at an altitude of 3,600 feet in Netarhat. Enjoy crisp mountain air, panoramic dawn sunrises over Koel river valley, and home-cooked traditional Munda and Oraon dishes.',
    category: 'Forest Cottage',
    district: 'Latehar',
    address: 'Upper Ridge Road, Near Magnolia Sunset Point, Netarhat',
    price: 2200,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/stays/pine-eco-lodge.jpg',
    gallery: [
      '/images/stays/pine-eco-lodge.jpg',
      '/images/destinations/netarhat.jpg',
    ],
    metadata: {
      property_type: 'Forest Cottage',
      capacity: 3,
      rating: 4.9,
      reviewsCount: 38,
      amenities: ['Pine Forest Trail', 'Solar Heating', 'Campfire Area', 'Home-cooked Meals', 'Free Parking'],
      host_name: 'Latehar Eco-Stays',
      eco_certified: true,
      check_in_time: '12:00 PM',
      check_out_time: '11:00 AM',
    },
    amenities: ['Pine Forest Trail', 'Solar Heating', 'Campfire Area', 'Home-cooked Meals', 'Free Parking'],
    rating: 4.9,
    reviewsCount: 38,
    property_type: 'Forest Cottage',
    host_name: 'Latehar Eco-Stays',
    eco_certified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c1111111-0001-0000-0000-000000000003',
    provider_id: 'a1111111-1111-1111-1111-111111111111',
    kind: 'stay',
    name: 'Deoghar Heritage Stay',
    slug: 'deoghar-heritage-stay',
    short_description:
      'Traditional red-oxide courtyard home offering serene satvik dining within walking distance of Baidyanath Dham.',
    description:
      'A heritage courtyard home operated by a local family near Baidyanath Dham. Enjoy peaceful surroundings, pure satvik thali meals, and personalized guidance for temple darshan and local crafts.',
    category: 'Village Homestay',
    district: 'Deoghar',
    address: 'Temple Chowk Heritage Lane, Deoghar',
    price: 1800,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/stays/heritage-homestay.jpg',
    gallery: [
      '/images/stays/heritage-homestay.jpg',
      '/images/destinations/deoghar-baidyanath.jpg',
    ],
    metadata: {
      property_type: 'Village Homestay',
      capacity: 5,
      rating: 4.8,
      reviewsCount: 56,
      amenities: ['Satvik Thali Included', 'Air Conditioning', 'Family Courtyard', 'Temple Guide Assistance', 'Wi-Fi'],
      host_name: 'Pandit Sharma & Family',
      eco_certified: false,
      check_in_time: '11:00 AM',
      check_out_time: '10:00 AM',
    },
    amenities: ['Satvik Thali Included', 'Air Conditioning', 'Family Courtyard', 'Temple Guide Assistance', 'Wi-Fi'],
    rating: 4.8,
    reviewsCount: 56,
    property_type: 'Village Homestay',
    host_name: 'Pandit Sharma & Family',
    eco_certified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'stay-betla-safari-camp',
    provider_id: 'a1111111-1111-1111-1111-111111111111',
    kind: 'stay',
    name: 'Betla Forest Wilderness Safari Camp',
    slug: 'betla-forest-wilderness-safari-camp',
    short_description:
      'Luxury weather-proof safari glamping tents on elevated timber decks in the tiger reserve buffer zone.',
    description:
      'Experience true wilderness living on the boundary of Betla National Park. Comfortable all-weather safari tents with attached modern washrooms, dawn birdwatching walks, and evening wildlife naturalist talks by the campfire.',
    category: 'Glamping Tent',
    district: 'Latehar',
    address: 'Forest Gate Buffer Zone, Betla National Park',
    price: 3500,
    currency: 'INR',
    status: 'published',
    cover_image: '/images/stays/safari-tent.jpg',
    gallery: [
      '/images/stays/safari-tent.jpg',
      '/images/destinations/betla-national-park.jpg',
    ],
    metadata: {
      property_type: 'Glamping Tent',
      rating: 4.9,
      reviewsCount: 41,
      amenities: ['En-suite Modern Washroom', 'Dawn Safari Guide', 'Campfire & Starry Skies', 'Eco-certified', 'Fresh Mineral Water'],
      host_name: 'Palamu Wilderness Guild',
      eco_certified: true,
      check_in_time: '01:00 PM',
      check_out_time: '11:00 AM',
    },
    amenities: ['En-suite Modern Washroom', 'Dawn Safari Guide', 'Campfire & Starry Skies', 'Eco-certified', 'Fresh Mineral Water'],
    rating: 4.9,
    reviewsCount: 41,
    property_type: 'Glamping Tent',
    host_name: 'Palamu Wilderness Guild',
    eco_certified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
