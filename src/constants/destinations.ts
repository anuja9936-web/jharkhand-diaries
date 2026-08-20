export const DESTINATION_CATEGORY_VALUES = [
  'waterfall',
  'heritage',
  'tribal_culture',
  'eco',
  'craft',
  'adventure',
  'religious',
  'wildlife',
] as const;

export const DESTINATION_STATUS_VALUES = ['draft', 'published'] as const;

export type DestinationCategory = (typeof DESTINATION_CATEGORY_VALUES)[number];
export type DestinationStatus = (typeof DESTINATION_STATUS_VALUES)[number];
export type DestinationFilterCategory = DestinationCategory | 'all';

// ── Explore UI categories ──────────────────────────────────────────────────
// These are the human-facing tabs shown on the Explore page.
// They do NOT correspond 1-to-1 to DB categories for all entries.
// 'cuisine' and 'festival' are served from static content (no DB rows).
export type ExploreCategory =
  | 'all'
  | 'places'
  | 'cuisine'
  | 'art_crafts'
  | 'adventure'
  | 'culture'
  | 'wildlife'
  | 'heritage'
  | 'festival';

export const EXPLORE_CATEGORY_OPTIONS: Array<{
  value: ExploreCategory;
  label: string;
  emoji: string;
}> = [
  { value: 'all',       label: 'All',         emoji: '✦' },
  { value: 'places',    label: 'Places',       emoji: '🏔️' },
  { value: 'cuisine',   label: 'Cuisine',      emoji: '🍛' },
  { value: 'art_crafts',label: 'Art & Crafts', emoji: '🎨' },
  { value: 'adventure', label: 'Adventure',    emoji: '⛺' },
  { value: 'culture',   label: 'Culture',      emoji: '🥁' },
  { value: 'wildlife',  label: 'Wildlife',     emoji: '🌿' },
  { value: 'heritage',  label: 'Heritage',     emoji: '🏛️' },
  { value: 'festival',  label: 'Festivals',    emoji: '🎊' },
];

export const JHARKHAND_DISTRICTS = [
  'Bokaro',
  'Chatra',
  'Deoghar',
  'Dhanbad',
  'Dumka',
  'East Singhbhum',
  'Garhwa',
  'Giridih',
  'Godda',
  'Gumla',
  'Hazaribagh',
  'Jamtara',
  'Khunti',
  'Koderma',
  'Latehar',
  'Lohardaga',
  'Pakur',
  'Palamu',
  'Ramgarh',
  'Ranchi',
  'Sahibganj',
  'Saraikela Kharsawan',
  'Simdega',
  'West Singhbhum',
] as const;

export type JharkhandDistrict = (typeof JHARKHAND_DISTRICTS)[number];

/** Map an explore UI category → the DB DestinationCategory values it covers */
export const EXPLORE_TO_DB_CATEGORIES: Record<ExploreCategory, DestinationCategory[]> = {
  all:        ['waterfall', 'heritage', 'tribal_culture', 'eco', 'craft', 'adventure', 'religious', 'wildlife'],
  places:     ['waterfall', 'eco'],
  cuisine:    [], // static content + provider offerings
  art_crafts: ['craft'],
  adventure:  ['adventure'],
  culture:    ['tribal_culture'],
  wildlife:   ['wildlife'],
  heritage:   ['heritage', 'religious'],
  festival:   [], // static content + cultural calendar
};

/** Returns true if an explore category is backed by static (non-DB) content */
export function isStaticExploreCategory(cat: ExploreCategory): boolean {
  return cat === 'cuisine' || cat === 'festival';
}

export const DESTINATION_CATEGORY_LABELS: Record<DestinationCategory, string> = {
  waterfall: 'Waterfalls',
  heritage: 'Heritage',
  tribal_culture: 'Tribal Culture',
  eco: 'Eco',
  craft: 'Craft',
  adventure: 'Adventure',
  religious: 'Religious',
  wildlife: 'Wildlife',
};

export const DESTINATION_CATEGORY_OPTIONS: Array<{
  value: DestinationFilterCategory;
  label: string;
}> = [
  { value: 'all', label: 'All' },
  { value: 'waterfall', label: 'Waterfalls' },
  { value: 'heritage', label: 'Heritage' },
  { value: 'tribal_culture', label: 'Tribal Culture' },
  { value: 'eco', label: 'Eco' },
  { value: 'craft', label: 'Craft' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'religious', label: 'Religious' },
  { value: 'wildlife', label: 'Wildlife' },
];

export const DESTINATION_STATUS_LABELS: Record<DestinationStatus, string> = {
  draft: 'Draft',
  published: 'Published',
};

export const DEFAULT_DESTINATION_IMAGE =
  'https://placehold.co/1200x800/png?text=Jharkhand+Destination';

export function isDestinationCategory(value: string): value is DestinationCategory {
  return (DESTINATION_CATEGORY_VALUES as readonly string[]).includes(value);
}

export function getDestinationCategoryLabel(category: DestinationCategory): string {
  return DESTINATION_CATEGORY_LABELS[category];
}

export function getDestinationStatusLabel(status: DestinationStatus): string {
  return DESTINATION_STATUS_LABELS[status];
}
