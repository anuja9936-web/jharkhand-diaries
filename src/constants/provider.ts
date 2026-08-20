import type { ProviderCapability, ProviderOfferingKind, ProviderVerificationStatus } from '../types/provider';

export interface ProviderCapabilityOption {
  id: ProviderCapability;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
  route: string;
  offeringKind: ProviderOfferingKind;
}

export const PROVIDER_CAPABILITIES: ProviderCapabilityOption[] = [
  {
    id: 'accommodation',
    label: 'Accommodation',
    shortLabel: 'Accommodations',
    description: 'Homestays, eco-lodges, resorts, campsites and other places to stay.',
    iconName: 'Home',
    route: '/provider/stays',
    offeringKind: 'stay',
  },
  {
    id: 'artisan',
    label: 'Artisan & Marketplace',
    shortLabel: 'Artisan & Crafts',
    description: 'Local handicrafts, Sohrai, Khovar, Dokra, Tussar, bamboo products and other authentic Jharkhand crafts.',
    iconName: 'ShoppingBag',
    route: '/provider/products',
    offeringKind: 'product',
  },
  {
    id: 'guide',
    label: 'Guide & Tour Operator',
    shortLabel: 'Tours & Guides',
    description: 'Local guides, heritage tours, wildlife tours, cultural tours and curated travel itineraries.',
    iconName: 'Compass',
    route: '/provider/tours',
    offeringKind: 'tour',
  },
  {
    id: 'adventure',
    label: 'Adventure & Experience',
    shortLabel: 'Experiences',
    description: 'Trekking, camping, kayaking, outdoor activities, cultural workshops and immersive experiences.',
    iconName: 'Sparkles',
    route: '/provider/experiences',
    offeringKind: 'experience',
  },
  {
    id: 'transport',
    label: 'Transport & Travel',
    shortLabel: 'Transport Services',
    description: 'Tourist cabs, SUVs, Tempo Travellers, vans, bike rentals and local travel services.',
    iconName: 'Car',
    route: '/provider/transport',
    offeringKind: 'transport',
  },
];

export const PROVIDER_CAPABILITY_MAP: Record<ProviderCapability, ProviderCapabilityOption> =
  PROVIDER_CAPABILITIES.reduce(
    (acc, cap) => {
      acc[cap.id] = cap;
      return acc;
    },
    {} as Record<ProviderCapability, ProviderCapabilityOption>
  );

export const PROVIDER_OFFERING_KIND_OPTIONS = [
  { value: 'stay', label: 'Accommodation / Stay' },
  { value: 'product', label: 'Artisan Product' },
  { value: 'tour', label: 'Tour & Guiding Service' },
  { value: 'experience', label: 'Adventure / Experience' },
  { value: 'transport', label: 'Transport / Vehicle Service' },
] as const;

export const PROVIDER_CATEGORY_OPTIONS = [
  { value: 'destination', label: 'Destination owner / manager' },
  { value: 'guide', label: 'Local guide' },
  { value: 'artisan', label: 'Artisan / craft seller' },
  { value: 'handicraft', label: 'Handicraft seller' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'restaurant', label: 'Restaurant / food provider' },
  { value: 'experience', label: 'Cultural experience provider' },
  { value: 'transport', label: 'Transport provider' },
  { value: 'local_business', label: 'Local tourism business' },
  { value: 'other', label: 'Other' },
] as const;

export const ACCOMMODATION_PROPERTY_TYPES = [
  'Homestay',
  'Eco Lodge',
  'Resort',
  'Forest Cottage',
  'Campsite',
  'Guest House',
] as const;

export const ARTISAN_CATEGORIES = [
  'Sohrai Art',
  'Khovar Art',
  'Dokra',
  'Bamboo Craft',
  'Tussar Silk',
  'Tribal Jewellery',
  'Forest Products',
  'Other Handicrafts',
] as const;

export const GUIDE_SPECIALTIES = [
  'Nature',
  'Wildlife',
  'Heritage',
  'Tribal Culture',
  'Adventure',
  'Photography',
  'Local Food/Culture',
] as const;

export const ADVENTURE_CATEGORIES = [
  'Trekking',
  'Camping',
  'Kayaking',
  'Rock Climbing',
  'Village Experiences',
  'Cultural Workshops',
  'Nature Experiences',
  'Adventure Activities',
] as const;

export const TRANSPORT_VEHICLE_TYPES = [
  'Sedan',
  'SUV',
  'Tempo Traveller',
  'Tourist Van',
  '4x4 Off-Road',
  'Electric Auto',
  'Bike / Scooter Rental',
] as const;

export const JHARKHAND_LANGUAGES = [
  'Hindi',
  'English',
  'Nagpuri',
  'Santhali',
  'Mundari',
  'Ho',
  'Kurukh',
  'Khortha',
  'Bengali',
] as const;

export const VERIFICATION_STATUS_LABELS: Record<
  ProviderVerificationStatus,
  { label: string; badgeVariant: 'neutral' | 'accent' | 'success' | 'warning'; description: string }
> = {
  unverified: {
    label: 'Verification Required',
    badgeVariant: 'warning',
    description: 'Submit your business documents to become a verified local partner.',
  },
  under_review: {
    label: 'Under Review',
    badgeVariant: 'accent',
    description: 'Your verification submission is being reviewed by the tourism desk.',
  },
  verified: {
    label: 'Verified Provider',
    badgeVariant: 'success',
    description: 'Your identity and credentials have been verified by Jharkhand Tourism.',
  },
  rejected: {
    label: 'Needs Attention',
    badgeVariant: 'warning',
    description: 'Verification details require corrections. Please update and resubmit.',
  },
};

export function getProviderCategoryLabel(value: string): string {
  const matching = PROVIDER_CAPABILITIES.find(
    (cap) => cap.id === value || cap.label.toLowerCase() === value.toLowerCase()
  );
  if (matching) return matching.label;

  const legacyMap: Record<string, string> = {
    destination: 'Destination Host',
    guide: 'Local Guide',
    artisan: 'Artisan & Craft Seller',
    handicraft: 'Handicraft Seller',
    hotel: 'Hotel & Resort',
    homestay: 'Homestay Host',
    restaurant: 'Cuisine Provider',
    experience: 'Experience Provider',
    transport: 'Transport Provider',
  };

  return legacyMap[value] || value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getProviderOfferingKindLabel(kind: string): string {
  const match = PROVIDER_OFFERING_KIND_OPTIONS.find((opt) => opt.value === kind);
  return match?.label || kind.charAt(0).toUpperCase() + kind.slice(1);
}
